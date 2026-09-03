// Lead intake. The demo wizard posts here.
//
// Two modes, distinguished by whether a slot came with the submission:
//   no slot  -> contact upsert only ("Send request")
//   slot     -> contact upsert + calendar appointment ("Confirm booking")
//
// The response never claims more than happened: `delivered` is false when the
// CRM is unconfigured or errored, and the UI reads it rather than assuming a
// 200 means a human will follow up.
//
// --- This route is a write into a live CRM --------------------------------
//
// There is no authentication here and there cannot be: it is a public marketing
// form. So every request is hostile until proven otherwise, and the gate runs
// in cost order — reject on a header before parsing a body, reject on a body
// before spending a rate-limit slot, spend a slot before calling GoHighLevel.
//
//   1. Content-Type   cheapest, and closes the cross-origin form-post hole
//   2. Origin/Referer same-origin + preview only
//   3. Rate limit/IP  before any parsing work
//   4. JSON parse
//   5. Bot heuristics honeypot + render timestamp (silent 200)
//   6. Turnstile      only when configured (silent 200)
//   7. Field validation
//   8. Rate limit/email  after parsing, because the address is the key
//   9. CRM write
import { SITE_URL } from "@/app/_seo/site";
import { crm } from "@/lib/crm";
import { PartialBookingError } from "@/lib/crm/ghl";
import { fingerprint, looksAutomated, parseLead, redactLead, type Lead } from "@/lib/lead";
import {
  RULES,
  rateLimit,
  rateLimitHeaders,
  rateLimitKey,
  type RateLimitResult,
} from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

// The booking path is the longest thing this app does, and it is the one that
// must not be cut off halfway. Worst case inside this handler:
//
//   turnstile verify          3s  (only when configured)
//   contact upsert            6s  \ shared budget, lib/crm/ghl.ts
//   appointment create        6s  /
//   fallback webhook          4s  (FALLBACK_TIMEOUT_MS below)
//   -----------------------------
//                            19s
//
// maxDuration has to be comfortably above that, otherwise the platform kills
// the invocation after the contact was written but before the appointment
// exists: the visitor sees an error and the CRM holds a contact with no
// booking. Raised from 20 to 25 when Turnstile was added to the chain.
export const maxDuration = 25;

const FALLBACK_TIMEOUT_MS = 4_000;
const TURNSTILE_TIMEOUT_MS = 3_000;
const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

type Booking = { startIso: string; timezone: string };

export async function POST(request: Request) {
  // --- 1. Content type ----------------------------------------------------
  //
  // A cross-origin <form enctype="text/plain"> can POST to any URL with no
  // preflight and no CORS check — the browser just sends it, with the victim's
  // cookies. It cannot set Content-Type to application/json, so requiring one
  // is what actually closes that hole. An XHR/fetch that DOES set it is forced
  // into a CORS preflight, which this origin never answers for other sites.
  //
  // This is the CSRF defence. The Origin check below is belt and braces; this
  // is the belt.
  const contentType = request.headers.get("content-type") || "";
  if (!/^application\/(\w+\+)?json\b/i.test(contentType.trim())) {
    return json(
      { ok: false, code: "UNSUPPORTED_MEDIA_TYPE", error: "Expected application/json" },
      415,
    );
  }

  // --- 2. Origin ----------------------------------------------------------
  if (!originAllowed(request)) {
    console.warn("[lead] rejected cross-origin submission from:", safeOriginLabel(request));
    return json({ ok: false, code: "FORBIDDEN", error: "Request origin not allowed" }, 403);
  }

  // --- 3. Per-IP budget ---------------------------------------------------
  const ipLimit = await rateLimit(rateLimitKey(request, "lead:ip"), RULES.leadPerIp);
  if (!ipLimit.ok) return tooMany(ipLimit);

  // --- 4. Body ------------------------------------------------------------
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, code: "MALFORMED_JSON", error: "Malformed request" }, 400);
  }
  // `json()` happily resolves arrays and primitives. Everything downstream
  // indexes into this, so reject anything that is not a plain object rather
  // than letting `body?.email` be silently undefined on an array.
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return json({ ok: false, code: "MALFORMED_JSON", error: "Malformed request" }, 400);
  }

  // --- 5. Bot heuristics --------------------------------------------------
  //
  // Silent 200. A bot told it failed just tries again with the field removed.
  const automated = looksAutomated(body);
  if (automated) {
    console.log("[lead] dropped:", automated);
    return json({ ok: true, delivered: false, dropped: true }, 200, rateLimitHeaders(ipLimit));
  }

  // --- 6. Turnstile -------------------------------------------------------
  if (turnstileEnabled()) {
    const passed = await verifyTurnstile(body, request);
    if (!passed) {
      console.log("[lead] dropped: turnstile");
      return json({ ok: true, delivered: false, dropped: true }, 200, rateLimitHeaders(ipLimit));
    }
  }

  // --- 7. Field validation ------------------------------------------------
  const { lead, errors, ok } = parseLead(body, { page: body?.page });
  if (!ok) return json({ ok: false, code: "VALIDATION_ERROR", errors }, 422, rateLimitHeaders(ipLimit));

  // --- 8. Per-email budget ------------------------------------------------
  //
  // The tight limit, and the one that survives an attacker rotating IPs while
  // hammering a single address. Keyed on a fingerprint rather than the address
  // itself so the limiter's key space is not a store of email addresses.
  const emailLimit = await rateLimit(
    `lead:email:${fingerprint(lead.email)}`,
    RULES.leadPerEmail,
  );
  if (!emailLimit.ok) {
    console.warn("[lead] per-email limit hit:", redactLead(lead).id);
    return tooMany(emailLimit);
  }

  const booking = parseBooking(body);
  if (booking) lead.tags.push("demo-booked");

  try {
    // Resolved INSIDE the try on purpose. crm() throws on an unknown
    // CRM_PROVIDER and on a production environment with no credentials —
    // both are exactly the situations where the lead must still be rescued by
    // the fallback webhook. Resolving it outside meant those threw an
    // unhandled 500 straight past the rescue path and the submission was lost.
    const provider = crm();

    const result = booking
      ? await provider.createAppointment({ lead, startIso: booking.startIso, timezone: booking.timezone })
      : await provider.createLead(lead);

    const delivered = result?.configured !== false;
    if (!delivered) console.warn("[lead] accepted but not delivered — no CRM configured");
    return json(
      { ok: true, delivered, booked: Boolean(booking && delivered) },
      200,
      rateLimitHeaders(ipLimit),
    );
  } catch (err) {
    // The submission must survive a CRM outage. The log line is the last
    // resort and always runs; LEAD_FALLBACK_WEBHOOK_URL (n8n, Slack, anything
    // that takes JSON) is the one that actually reaches a person.
    const detail = err instanceof Error ? err.message : String(err);
    // Set when the contact upsert landed and only the appointment failed. It
    // travels to the webhook so whoever picks this up knows to book the
    // person rather than re-enter them.
    const contactId = err instanceof PartialBookingError ? err.contactId : null;
    // REDACTED. This used to be JSON.stringify(lead) — name, work email, phone
    // and the visitor's free-text notes, written into platform logs on every
    // CRM hiccup. redactLead keeps the diagnostic fields and masks the rest;
    // the full record is still delivered intact to the fallback webhook below,
    // which is an endpoint the customer controls rather than a log drain.
    console.error(
      "[lead] CRM write failed:",
      detail,
      contactId ? `(contact ${contactId} was created)` : "(no contact created)",
      JSON.stringify(redactLead(lead)),
    );
    const rescued = await fallback({ lead, booking, error: detail, contactId });
    if (rescued) {
      return json(
        { ok: true, delivered: true, degraded: true, booked: false },
        200,
        rateLimitHeaders(ipLimit),
      );
    }
    return json(
      {
        ok: false,
        code: "CRM_UNAVAILABLE",
        error: "We could not send that just now. Please try again in a moment.",
      },
      502,
    );
  }
}

// --- Origin ---------------------------------------------------------------

// Hosts permitted to post here. The canonical site plus its www form; anything
// else has to come from a Vercel preview of THIS project, matched below.
const ALLOWED_HOSTS = new Set(
  [SITE_URL, process.env.NEXT_PUBLIC_SITE_URL]
    .filter((v): v is string => Boolean(v))
    .flatMap((value) => {
      try {
        const host = new URL(value).host;
        return host.startsWith("www.") ? [host, host.slice(4)] : [host, `www.${host}`];
      } catch {
        return [];
      }
    }),
);

/**
 * Same-origin, a Vercel preview of this project, or a local dev host.
 *
 * Origin is absent on some legitimate requests (a plain form navigation, older
 * privacy extensions), so Referer is the documented fallback. When BOTH are
 * absent the request is allowed — a browser always sends at least one for a
 * cross-origin POST, so an empty pair means a non-browser client, and those are
 * governed by the rate limiter, not by a header a script can set to anything.
 * The Content-Type gate above is what actually stops the forged-form attack.
 */
function originAllowed(request: Request): boolean {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const candidate = origin || referer;
  if (!candidate || candidate === "null") return !origin && !referer;

  let host: string;
  try {
    host = new URL(candidate).host;
  } catch {
    return false;
  }

  // Same-origin: the Host header is what the request was actually addressed
  // to, which covers every deployment domain without enumerating them.
  const self = request.headers.get("host");
  if (self && host === self) return true;

  if (ALLOWED_HOSTS.has(host)) return true;

  const hostname = host.split(":")[0];
  // Vercel preview deploys: <project>-<hash>-<scope>.vercel.app. Scoped to the
  // suffix rather than a wildcard on any subdomain of anything.
  if (hostname === "vercel.app" || hostname.endsWith(".vercel.app")) return true;
  // Local development.
  if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1") return true;

  return false;
}

// Only ever the host, never the full URL — a Referer carries a path and query
// string that can contain anything the sender chose to put there.
function safeOriginLabel(request: Request): string {
  const candidate = request.headers.get("origin") || request.headers.get("referer") || "";
  try {
    return new URL(candidate).host;
  } catch {
    return "unparseable";
  }
}

// --- Turnstile ------------------------------------------------------------
//
// Cloudflare Turnstile, entirely OFF unless both keys are set — and they are
// not set today. With them unset every branch here is skipped and the route
// behaves exactly as it did before.
//
// !! Read before setting these in an environment !!
// Turning this on is a TWO-SIDED change. The server half is here; the widget
// that produces the token is not, because rendering it is a change to the form
// components and that is the Frontend Engineer's file. Set the keys without the
// widget shipped and every submission arrives with no token and is silently
// dropped — the exact black hole this codebase is otherwise careful to avoid.
// Ship the widget first, then set the keys.
function turnstileEnabled(): boolean {
  return Boolean(process.env.TURNSTILE_SECRET_KEY && process.env.TURNSTILE_SITE_KEY);
}

async function verifyTurnstile(body: Record<string, unknown>, request: Request): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;

  // Cloudflare's widget names the field `cf-turnstile-response`; accept the
  // camelCase spelling too so a JSON client is not forced into a hyphenated key.
  const raw = body["cf-turnstile-response"] ?? body.turnstileToken;
  const token = typeof raw === "string" ? raw.trim() : "";
  // Tokens are short. A long one is someone probing the verify endpoint through us.
  if (!token || token.length > 2048) return false;

  try {
    const form = new URLSearchParams({ secret, response: token });
    // Binds the token to the address that solved the challenge. Optional in
    // Cloudflare's API and skipped when we cannot identify the caller.
    const ip = request.headers.get("x-vercel-forwarded-for") || request.headers.get("x-real-ip");
    if (ip) form.set("remoteip", ip);

    const res = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form,
      signal: AbortSignal.timeout(TURNSTILE_TIMEOUT_MS),
    });
    if (!res.ok) {
      // Cloudflare is down, not the visitor's fault. Fail OPEN: losing a real
      // lead costs more than admitting the bots that the honeypot, the
      // timestamp check and the rate limiter still have to get past.
      console.error("[lead] turnstile verify unavailable:", res.status);
      return true;
    }
    const data = (await res.json()) as { success?: boolean; "error-codes"?: string[] };
    if (!data?.success) {
      // Error codes only. Never the token — it is a bearer credential.
      console.log("[lead] turnstile rejected:", (data?.["error-codes"] || []).join(",") || "unknown");
      return false;
    }
    return true;
  } catch (err) {
    console.error("[lead] turnstile verify failed:", err instanceof Error ? err.message : err);
    return true; // fail open, see above
  }
}

// A slot is only honoured if it parses to a real future instant. Anything
// else is treated as a plain enquiry rather than silently booking the wrong
// time.
function parseBooking(body: Record<string, unknown>): Booking | null {
  const startIso = typeof body?.startIso === "string" ? body.startIso : null;
  if (!startIso) return null;
  const t = Date.parse(startIso);
  if (!Number.isFinite(t) || t < Date.now()) return null;
  return {
    startIso: new Date(t).toISOString(),
    timezone: typeof body?.timezone === "string" ? body.timezone : "UTC",
  };
}

async function fallback(payload: {
  lead: Lead;
  booking: Booking | null;
  error: string;
  contactId: string | null;
}) {
  const url = process.env.LEAD_FALLBACK_WEBHOOK_URL;
  if (!url) return false;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(FALLBACK_TIMEOUT_MS),
    });
    return res.ok;
  } catch {
    return false;
  }
}

function tooMany(limit: RateLimitResult) {
  return json(
    {
      ok: false,
      code: "RATE_LIMITED",
      error: "Too many requests. Please wait a moment and try again.",
      retryAfter: limit.retryAfter,
    },
    429,
    { "Retry-After": String(limit.retryAfter), ...rateLimitHeaders(limit) },
  );
}

const json = (data: Record<string, unknown>, status = 200, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store", ...extra },
  });
