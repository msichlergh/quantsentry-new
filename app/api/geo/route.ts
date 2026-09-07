// Country of the request, used only to preselect the phone dial code.
//
// Three sources, in order of how much they should be trusted:
//
//   1. The platform header. Vercel sets x-vercel-ip-country (Cloudflare sets
//      cf-ipcountry) from the connecting IP, at no cost and with no
//      third-party call. On production this answers every request and
//      nothing below runs.
//   2. An IP lookup, only when there is no header and the client IP is
//      routable. This is what makes local dev and any non-Vercel deploy
//      IP-sensitive rather than silently falling back to the browser locale.
//   3. Nothing — the client then uses navigator.language, which is a guess.
//
// `?cc=DE` forces an answer, so the picker can be checked without a VPN.
import { RULES, clientIp, isIpAddress, rateLimit, rateLimitHeaders, rateLimitKey } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

// One optional 1.5s IP lookup and nothing else. A ceiling here is cheap
// insurance: this route is hit on every page render of the wizard.
export const maxDuration = 10;

const LOOKUP_TIMEOUT_MS = 1500;

// --- Cache ----------------------------------------------------------------
//
// Per-IP, so a visitor reloading does not re-hit the lookup. Serverless
// instances are short-lived and this is a preselected dial code, not a
// billing decision — a cold instance simply looks it up again.
//
// This map is keyed on a CALLER-SUPPLIED value. Before it was bounded it was a
// memory-exhaustion primitive: every request with a fresh x-forwarded-for added
// a permanent entry, the TTL was only ever consulted on a hit, and nothing swept
// or capped it. A few hundred thousand forged headers and the instance is out
// of heap — with no lookup ever performed, so not even the third-party timeout
// slowed the attack down.
//
// Two changes fix that. The key must parse as an IP (lib/rate-limit validates
// the character set, which is what stops arbitrary strings becoming keys), and
// the map is a hard-capped LRU.
const CACHE_TTL_MS = 60 * 60 * 1000;
// ~1000 entries at roughly 80 bytes each. The working set of a marketing site
// is nowhere near this; the cap exists for the adversarial case, not the real one.
const CACHE_MAX = 1000;

const cache = new Map<string, { country: string | null; at: number }>();

// Map iterates in insertion order, so re-inserting on every read makes the
// first key the least recently used and eviction O(1) with no extra structure.
function cacheGet(ip: string): { country: string | null; at: number } | null {
  const hit = cache.get(ip);
  if (!hit) return null;
  if (Date.now() - hit.at >= CACHE_TTL_MS) {
    cache.delete(ip);
    return null;
  }
  cache.delete(ip);
  cache.set(ip, hit);
  return hit;
}

function cacheSet(ip: string, country: string | null): void {
  cache.delete(ip);
  cache.set(ip, { country, at: Date.now() });
  // Evict oldest first. A single `while` rather than a sweep: entries are added
  // one at a time, so at most one eviction per insert is ever needed.
  while (cache.size > CACHE_MAX) {
    const oldest = cache.keys().next();
    if (oldest.done) break;
    cache.delete(oldest.value);
  }
}

export async function GET(request: Request) {
  // ipwho.is is free and keyless, which means the quota is enforced by them
  // cutting us off. A budget here keeps a script from spending it.
  const limit = await rateLimit(rateLimitKey(request, "geo:ip"), RULES.geoPerIp);
  if (!limit.ok) {
    return json(
      { country: null, source: "rate-limited" },
      429,
      { "Retry-After": String(limit.retryAfter), ...rateLimitHeaders(limit) },
    );
  }

  const url = new URL(request.url);

  const forced = normalise(url.searchParams.get("cc"));
  if (forced) return json({ country: forced, source: "override" });

  const header = normalise(
    request.headers.get("x-vercel-ip-country") || request.headers.get("cf-ipcountry"),
  );
  if (header) return json({ country: header, source: "header" });

  // Platform-set headers first, and validated as an IP before it is used as a
  // cache key or interpolated into the lookup URL.
  const ip = routableClientIp(request);
  if (!ip) return json({ country: null, source: "none" });

  const hit = cacheGet(ip);
  if (hit) return json({ country: hit.country, source: "cache" });

  const country = await lookup(ip);
  cacheSet(ip, country);
  return json({ country, source: country ? "lookup" : "none" });
}

// Free, keyless, and entirely optional — the picker works without it, so a
// failure here is not worth surfacing. Never allowed to hold up the response.
async function lookup(ip: string): Promise<string | null> {
  try {
    const res = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}?fields=success,country_code`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(LOOKUP_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.success ? normalise(data.country_code) : null;
  } catch {
    return null;
  }
}

// Shares lib/rate-limit's header precedence, so the address this caches under
// is the same one the limiter counts against — otherwise a forged
// x-forwarded-for would get its own cache entry while being limited as someone
// else.
function routableClientIp(request: Request): string | null {
  const ip = clientIp(request);
  if (!ip || !isIpAddress(ip)) return null;
  return isRoutable(ip) ? ip : null;
}

// Localhost and RFC1918 have no country, and asking about them wastes the
// timeout on every request in local dev.
function isRoutable(ip: string): boolean {
  if (!ip) return false;
  if (ip === "::1" || ip.startsWith("127.") || ip.startsWith("fe80:") || ip === "::") return false;
  if (ip.startsWith("10.") || ip.startsWith("192.168.")) return false;
  const m = ip.match(/^172\.(\d+)\./);
  if (m && Number(m[1]) >= 16 && Number(m[1]) <= 31) return false;
  return true;
}

function json(body: Record<string, unknown>, status = 200, extra: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      // Per-visitor answer: caching it would hand one country to everyone.
      "Cache-Control": "no-store",
      ...extra,
    },
  });
}

function normalise(cc: string | null | undefined): string | null {
  if (!cc || cc === "XX" || !/^[A-Za-z]{2}$/.test(cc)) return null;
  return cc.toUpperCase();
}
