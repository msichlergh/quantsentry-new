// Real availability for the demo calendar.
//
// Returns an empty map rather than an error when the CRM is unconfigured, and
// the picker renders its "no times open" state off that. The one thing this
// must never do is hand back plausible-looking times that nobody can attend.
import { crm } from "@/lib/crm";
import { RULES, rateLimit, rateLimitHeaders, rateLimitKey } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

// One upstream call at 8s (SLOTS_TIMEOUT_MS in lib/crm/ghl.ts) plus request
// overhead. 15 leaves room for a slow cold start without letting a hung
// calendar hold an invocation open.
export const maxDuration = 15;

const MAX_RANGE_DAYS = 62;

// Nobody can take a call that starts in twenty minutes. The calendar happily
// returns the next slot on the clock, so without this the soonest bookable
// time is whatever the hour boundary happens to be — a booking the visitor
// makes in good faith and nobody on our side is ready for.
//
// Enforced here rather than in the picker because a client-side filter is a
// suggestion, not a rule.
const MIN_LEAD_HOURS = 4;
const MIN_LEAD_MS = MIN_LEAD_HOURS * 3600_000;

// An IANA zone is at most a few segments of ASCII. Bounding the shape before
// handing it to Intl keeps a pathological string out of the validator, and out
// of the response it gets echoed into.
const TZ_SHAPE = /^[A-Za-z0-9+_\-]+(?:\/[A-Za-z0-9+_\-]+){0,2}$/;
const TZ_MAX_LENGTH = 64;

export async function GET(request: Request) {
  // Each call here is an outbound request to the customer's calendar. Without a
  // budget, the picker's public URL is a free proxy onto the GHL API and
  // whatever rate limits that account has.
  const limit = await rateLimit(rateLimitKey(request, "slots:ip"), RULES.slotsPerIp);
  if (!limit.ok) {
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

  const { searchParams } = new URL(request.url);

  // `tz` used to be forwarded to GoHighLevel verbatim AND echoed back in the
  // response. Both are the caller's string, so it had to be validated for two
  // separate reasons: an unvalidated value is an injection surface on the
  // upstream query, and an echoed one is a reflection primitive.
  //
  // Intl is the authority on what a real zone is — it throws RangeError for
  // anything the runtime's own tz database does not know, so there is no list
  // here to go stale. The shape check in front of it is just to keep a 10KB
  // string out of the constructor.
  const requestedTz = searchParams.get("tz");
  if (requestedTz !== null && !isValidTimeZone(requestedTz)) {
    return json({ ok: false, code: "VALIDATION_ERROR", error: "Invalid timezone" }, 400);
  }
  const timezone = requestedTz || "UTC";

  const from = Date.parse(searchParams.get("from") || "");
  const to = Date.parse(searchParams.get("to") || "");
  if (!Number.isFinite(from) || !Number.isFinite(to) || to <= from) {
    return json({ ok: false, error: "Invalid range" }, 400);
  }
  // Bounded so a crafted range cannot turn one request into a months-long
  // query against the CRM.
  if (to - from > MAX_RANGE_DAYS * 86400_000) {
    return json({ ok: false, error: "Range too wide" }, 400);
  }

  // Never ask the calendar for a window that is already inside the lead time.
  const earliest = Date.now() + MIN_LEAD_MS;
  const fromClamped = Math.max(from, earliest);

  try {
    // Inside the try: crm() throws on an unknown CRM_PROVIDER, and in
    // production when credentials are missing. Both used to escape as an
    // unhandled 500; a 502 with a logged reason is the honest answer.
    const provider = crm();

    // The whole requested window is inside the lead time, so there is nothing
    // to ask for. Returning an empty map lets the picker render its normal
    // "no times" state rather than an error.
    if (fromClamped >= to) {
      return json({ ok: true, configured: provider.name !== "noop", timezone, days: {}, minLeadHours: MIN_LEAD_HOURS });
    }
    // GHL takes epoch millis on this endpoint, not ISO.
    const raw = await provider.getSlots({ from: fromClamped, to, timezone });
    // Clamping the query start is not enough: the calendar returns whole
    // days, so today's array still carries the slots before the cutoff. Drop
    // them, then drop any day left with nothing — an empty array would light
    // that date up as available in the month grid.
    const days: Record<string, string[]> = {};
    for (const [key, times] of Object.entries(raw || {})) {
      const kept = (times || []).filter((t) => {
        const ms = Date.parse(t);
        return Number.isFinite(ms) ? ms >= earliest : true;
      });
      if (kept.length) days[key] = kept;
    }
    return json({ ok: true, configured: provider.name !== "noop", timezone, days, minLeadHours: MIN_LEAD_HOURS });
  } catch (err) {
    console.error("[slots] lookup failed:", err instanceof Error ? err.message : err);
    return json({ ok: false, error: "Could not load availability" }, 502);
  }
}

// True only for a zone this runtime's IANA database actually contains.
// `Intl.DateTimeFormat` throws RangeError on anything else, which is the same
// database GoHighLevel is being asked about — so a value that passes here is a
// value the calendar can answer for.
function isValidTimeZone(tz: string): boolean {
  if (!tz || tz.length > TZ_MAX_LENGTH || !TZ_SHAPE.test(tz)) return false;
  // "UTC" and fixed offsets like "Etc/GMT+5" are accepted by Intl and are
  // legitimate values for this parameter.
  try {
    new Intl.DateTimeFormat("en-GB", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

const json = (data: Record<string, unknown>, status = 200, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store", ...extra },
  });
