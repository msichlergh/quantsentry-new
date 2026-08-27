// Lead intake. The demo wizard posts here.
//
// Two modes, distinguished by whether a slot came with the submission:
//   no slot  -> contact upsert only ("Send request")
//   slot     -> contact upsert + calendar appointment ("Confirm booking")
//
// The response never claims more than happened: `delivered` is false when the
// CRM is unconfigured or errored, and the UI reads it rather than assuming a
// 200 means a human will follow up.
import { crm } from "@/lib/crm";
import { looksAutomated, parseLead, type Lead } from "@/lib/lead";

export const dynamic = "force-dynamic";

type Booking = { startIso: string; timezone: string };

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "Malformed request" }, 400);
  }

  // Silent 200. A bot told it failed just tries again with the field removed.
  const automated = looksAutomated(body);
  if (automated) {
    console.log("[lead] dropped:", automated);
    return json({ ok: true, delivered: false, dropped: true });
  }

  const { lead, errors, ok } = parseLead(body, { page: body?.page });
  if (!ok) return json({ ok: false, errors }, 422);

  const provider = crm();
  const booking = parseBooking(body);
  if (booking) lead.tags.push("demo-booked");

  try {
    const result = booking
      ? await provider.createAppointment({ lead, startIso: booking.startIso, timezone: booking.timezone })
      : await provider.createLead(lead);

    const delivered = result?.configured !== false;
    if (!delivered) console.warn("[lead] accepted but not delivered — no CRM configured");
    return json({ ok: true, delivered, booked: Boolean(booking && delivered) });
  } catch (err) {
    // The submission must survive a CRM outage. The log line is the last
    // resort and always runs; LEAD_FALLBACK_WEBHOOK_URL (n8n, Slack, anything
    // that takes JSON) is the one that actually reaches a person.
    const detail = err instanceof Error ? err.message : String(err);
    console.error("[lead] CRM write failed:", detail, JSON.stringify(lead));
    const rescued = await fallback({ lead, booking, error: detail });
    if (rescued) return json({ ok: true, delivered: true, degraded: true, booked: false });
    return json(
      { ok: false, error: "We could not send that just now. Please try again in a moment." },
      502,
    );
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

async function fallback(payload: { lead: Lead; booking: Booking | null; error: string }) {
  const url = process.env.LEAD_FALLBACK_WEBHOOK_URL;
  if (!url) return false;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

const json = (data: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
