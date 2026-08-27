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
export const dynamic = "force-dynamic";

const LOOKUP_TIMEOUT_MS = 1500;

// Per-IP, so a visitor reloading does not re-hit the lookup. Serverless
// instances are short-lived and this is a preselected dial code, not a
// billing decision — a cold instance simply looks it up again.
const cache = new Map<string, { country: string | null; at: number }>();
const CACHE_TTL_MS = 60 * 60 * 1000;

export async function GET(request: Request) {
  const url = new URL(request.url);

  const forced = normalise(url.searchParams.get("cc"));
  if (forced) return json({ country: forced, source: "override" });

  const header = normalise(
    request.headers.get("x-vercel-ip-country") || request.headers.get("cf-ipcountry"),
  );
  if (header) return json({ country: header, source: "header" });

  const ip = clientIp(request);
  if (!ip) return json({ country: null, source: "none" });

  const hit = cache.get(ip);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) {
    return json({ country: hit.country, source: "cache" });
  }

  const country = await lookup(ip);
  cache.set(ip, { country, at: Date.now() });
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

// First entry in x-forwarded-for is the client; the rest are proxies.
function clientIp(request: Request): string | null {
  const fwd = request.headers.get("x-forwarded-for") || "";
  const first = fwd.split(",")[0].trim() || request.headers.get("x-real-ip") || "";
  return isRoutable(first) ? first : null;
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

function json(body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    headers: {
      "Content-Type": "application/json",
      // Per-visitor answer: caching it would hand one country to everyone.
      "Cache-Control": "no-store",
    },
  });
}

function normalise(cc: string | null | undefined): string | null {
  if (!cc || cc === "XX" || !/^[A-Za-z]{2}$/.test(cc)) return null;
  return cc.toUpperCase();
}
