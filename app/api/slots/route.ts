// Real availability for the demo calendar.
//
// Returns an empty map rather than an error when the CRM is unconfigured, and
// the picker renders its "no times open" state off that. The one thing this
// must never do is hand back plausible-looking times that nobody can attend.
import { crm } from "@/lib/crm";

export const dynamic = "force-dynamic";

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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const timezone = searchParams.get("tz") || "UTC";

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

  const provider = crm();
  try {
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

const json = (data: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
