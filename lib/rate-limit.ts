// Request throttling for the public API routes.
//
// Why this exists: POST /api/lead performs a WRITE into the customer's live
// GoHighLevel account on every accepted request, and GET /api/slots and
// GET /api/geo each make an outbound third-party call. Without a limiter, one
// script turns the CRM into a landfill and the ipwho.is quota into a bill.
//
// --- The honest limitation, read this before trusting the numbers ----------
//
// The default store is IN-MEMORY and therefore PER PROCESS. On Vercel each
// serverless instance has its own Map, and instances are created, frozen and
// destroyed at the platform's discretion. Concretely:
//
//   * a burst spread across N warm instances gets roughly N x the limit
//   * a cold start resets the counter to zero
//   * nothing is shared between regions
//
// So this is a SPEED BUMP, not a guarantee. It stops the naive `for i in
// {1..500}` loop and the misbehaving retry loop, which is the actual threat
// today. It does not stop a distributed attacker, and it must not be described
// to anyone as if it does.
//
// The fix when that matters is a shared counter. `RateLimitStore` below is the
// seam for it: implement `hit()` against Upstash Redis REST (an INCR + PEXPIRE
// pipeline over plain fetch, no SDK needed) and register it from env in
// `store()`. Deliberately NOT written yet — an untested network client on the
// critical path of the site's only conversion form, days before launch, is a
// worse bug than the one it fixes.
import "server-only";

export type RateLimitRule = {
  /** Requests permitted per window. */
  limit: number;
  /** Window length in milliseconds. */
  windowMs: number;
};

export type RateLimitResult = {
  /** False when the caller has exhausted the window and must be rejected. */
  ok: boolean;
  limit: number;
  /** Requests left in the current window. Never negative. */
  remaining: number;
  /** Epoch ms at which the current window ends. */
  resetAt: number;
  /** Whole seconds until reset, floored at 1. For the Retry-After header. */
  retryAfter: number;
};

// The seam. Everything above the store works against this and nothing else, so
// swapping the in-memory Map for a shared counter is one new file plus one
// branch in `store()` — no route handler changes.
export interface RateLimitStore {
  readonly name: string;
  /**
   * Record one request against `key` and report whether it is permitted.
   * Async by contract so a network-backed store fits without touching callers,
   * even though the in-memory implementation resolves synchronously.
   */
  hit(key: string, rule: RateLimitRule, now: number): Promise<RateLimitResult>;
}

// Hard ceiling on distinct keys held in memory. Each entry is ~100 bytes, so
// 20k keys is ~2MB — small enough to be invisible, large enough that a real
// traffic spike never evicts a legitimate visitor's counter.
//
// This bound is the whole point: the map is keyed on caller-supplied values
// (IP, email), so an unbounded Map is a memory-exhaustion primitive handed to
// anyone who can send requests.
const MAX_KEYS = 20_000;

type Window = { count: number; resetAt: number };

class MemoryStore implements RateLimitStore {
  readonly name = "memory";
  // Map preserves insertion order, which is what makes the eviction below O(1)
  // amortised without a second data structure.
  private readonly windows = new Map<string, Window>();

  async hit(key: string, rule: RateLimitRule, now: number): Promise<RateLimitResult> {
    const existing = this.windows.get(key);

    if (!existing || existing.resetAt <= now) {
      // New window. Re-inserting (delete first) keeps insertion order aligned
      // with recency so the eviction pass drops the coldest keys.
      if (existing) this.windows.delete(key);
      this.evictIfNeeded(now);
      const resetAt = now + rule.windowMs;
      this.windows.set(key, { count: 1, resetAt });
      return result(true, rule.limit, rule.limit - 1, resetAt, now);
    }

    existing.count += 1;
    const allowed = existing.count <= rule.limit;
    return result(
      allowed,
      rule.limit,
      Math.max(0, rule.limit - existing.count),
      existing.resetAt,
      now,
    );
  }

  private evictIfNeeded(now: number): void {
    if (this.windows.size < MAX_KEYS) return;
    // Cheap pass first: expired windows are dead weight and dropping them is
    // free. Only if that is not enough do we evict live counters.
    for (const [key, window] of this.windows) {
      if (window.resetAt <= now) this.windows.delete(key);
    }
    // Still full: drop oldest-inserted until back under the cap. Evicting a
    // live counter grants that key a fresh window, which is the correct
    // failure direction — a limiter must never deny service because its own
    // bookkeeping is full.
    while (this.windows.size >= MAX_KEYS) {
      const oldest = this.windows.keys().next();
      if (oldest.done) break;
      this.windows.delete(oldest.value);
    }
  }
}

function result(
  ok: boolean,
  limit: number,
  remaining: number,
  resetAt: number,
  now: number,
): RateLimitResult {
  return {
    ok,
    limit,
    remaining,
    resetAt,
    // Retry-After must be a positive integer; a 0 tells a client to retry
    // immediately and it hammers straight back into the same 429.
    retryAfter: Math.max(1, Math.ceil((resetAt - now) / 1000)),
  };
}

let active: RateLimitStore | null = null;

// Resolved once per process. The Upstash branch goes here when it is written;
// until then the env vars are deliberately not read, so nobody can set them and
// believe distributed limiting is on.
function store(): RateLimitStore {
  if (!active) active = new MemoryStore();
  return active;
}

/** Test seam. Swapping the store mid-process is not a production operation. */
export function setRateLimitStore(next: RateLimitStore | null): void {
  active = next;
}

// --- Rules ----------------------------------------------------------------
//
// Tuned against the real form, not against a threat model on paper. The demo
// wizard is long; people abandon it, come back and resubmit, and a shared
// office NAT puts a whole firm behind one address. Blocking a genuine lead is a
// direct revenue loss, so every per-IP number below has slack in it and the
// tight limit is on the email, where a repeat is unambiguous.
export const RULES = {
  /** Lead writes per IP. Generous: NAT, and a person legitimately retrying. */
  leadPerIp: { limit: 8, windowMs: 10 * 60_000 },
  /**
   * Lead writes per email address. The tight one. Three submissions from one
   * address in an hour is already more than any real flow needs — the wizard
   * plus a correction plus one spare.
   */
  leadPerEmail: { limit: 3, windowMs: 60 * 60_000 },
  /**
   * Availability lookups per IP. The picker refetches on every month change,
   * so this has to absorb a visitor clicking through a year of the calendar.
   */
  slotsPerIp: { limit: 40, windowMs: 60_000 },
  /** Geo lookups per IP. One per wizard mount; the rest is reloads. */
  geoPerIp: { limit: 30, windowMs: 60_000 },
} as const satisfies Record<string, RateLimitRule>;

/**
 * Count one request against `key` under `rule`.
 *
 * Fails OPEN. If the store throws — which a future network-backed store can —
 * the request is allowed through. A limiter outage must degrade to "no
 * limiting", never to "no lead capture".
 */
export async function rateLimit(key: string, rule: RateLimitRule): Promise<RateLimitResult> {
  const now = Date.now();
  try {
    return await store().hit(key, rule, now);
  } catch (err) {
    console.error("[rate-limit] store failed, allowing request:", err instanceof Error ? err.message : err);
    return result(true, rule.limit, rule.limit, now + rule.windowMs, now);
  }
}

/** Headers describing the caller's current budget. Safe to attach to any response. */
export function rateLimitHeaders(r: RateLimitResult): Record<string, string> {
  return {
    "RateLimit-Limit": String(r.limit),
    "RateLimit-Remaining": String(r.remaining),
    "RateLimit-Reset": String(r.retryAfter),
  };
}

// --- Client identity ------------------------------------------------------

const IPV4 = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;
// Deliberately loose on IPv6 shape (full validation of :: compression is not
// worth it here) but strict on the CHARACTER SET, which is the part that
// matters: this value becomes a Map key and is echoed into log lines.
const IPV6 = /^[0-9a-fA-F:]{2,45}$/;

/** True when `value` is syntactically an IP address. Says nothing about routability. */
export function isIpAddress(value: string): boolean {
  if (!value || value.length > 45) return false;
  if (IPV4.test(value)) return true;
  return value.includes(":") && IPV6.test(value);
}

/**
 * Best-effort client address.
 *
 * Order matters. `x-vercel-forwarded-for` and `x-real-ip` are written by the
 * platform from the connecting socket and cannot be forged by the client;
 * `x-forwarded-for` is a client-supplied header that the platform APPENDS to,
 * so its leftmost entry is only trustworthy when a trusted proxy set it.
 * Preferring the platform headers means a spoofed XFF cannot be used to dodge
 * a limit or to poison a cache key.
 *
 * Returns null when nothing parses as an IP — callers must decide whether that
 * shares one bucket (rate limiting: yes, and it is the correct conservative
 * choice) or skips the feature entirely (geo lookup).
 */
export function clientIp(request: Request): string | null {
  const candidates = [
    request.headers.get("x-vercel-forwarded-for"),
    request.headers.get("x-real-ip"),
    request.headers.get("cf-connecting-ip"),
    request.headers.get("x-forwarded-for")?.split(",")[0],
  ];
  for (const candidate of candidates) {
    const value = candidate?.trim();
    if (value && isIpAddress(value)) return value;
  }
  return null;
}

/**
 * Rate-limit bucket for a request. Never null: an unidentifiable caller shares
 * the "unknown" bucket rather than escaping the limiter, which is the only safe
 * default — an attacker who can strip every address header would otherwise be
 * unlimited.
 */
export function rateLimitKey(request: Request, scope: string): string {
  return `${scope}:${clientIp(request) ?? "unknown"}`;
}
