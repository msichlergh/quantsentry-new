// GoHighLevel (LeadConnector) adapter.
//
// Auth is a Private Integration token, created per location in GHL under
// Settings > Private Integrations, scoped to contacts write and calendars
// read/write. It is a server-only secret: nothing in here may be imported from
// a "use client" component.
//
// The Version header is pinned by env because HighLevel is mid-migration on
// it: existing integrations run the dated `2021-07-28` while newer docs show
// `v3`. Default is the dated one; flip GHL_API_VERSION if the token is issued
// against v3, rather than editing code.
import type { Lead } from "@/lib/lead";

const BASE = "https://services.leadconnectorhq.com";
const VERSION = process.env.GHL_API_VERSION || "2021-07-28";

export const name = "ghl";

export function isConfigured(): boolean {
  return Boolean(process.env.GHL_API_TOKEN && process.env.GHL_LOCATION_ID);
}

class GhlError extends Error {
  status: number;
  detail: unknown;

  constructor(message: string, status: number, detail: unknown) {
    super(message);
    this.status = status;
    this.detail = detail;
  }
}

type CallOptions = {
  method?: string;
  body?: unknown;
  query?: Record<string, string | number | undefined | null>;
};

async function call(path: string, { method = "GET", body, query }: CallOptions = {}) {
  const url = new URL(BASE + path);
  for (const [k, v] of Object.entries(query || {})) {
    if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
  }
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${process.env.GHL_API_TOKEN}`,
      Version: VERSION,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
    // Never cache a CRM call, and never let one hang a serverless invocation.
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });
  const text = await res.text();
  let json: Record<string, unknown> | null = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    /* non-JSON error body */
  }
  if (!res.ok) {
    // The detail carries the useful part (which field it rejected); keep it
    // out of anything user-facing, it can echo submitted values back.
    throw new GhlError(`GHL ${method} ${path} -> ${res.status}`, res.status, json || text.slice(0, 400));
  }
  return json;
}

// Upsert, not create: it honours the location's duplicate-contact setting and
// matches on email/phone, so a repeat enquiry updates one record instead of
// littering the CRM with near-identical contacts.
export async function createLead(lead: Lead): Promise<{ id: string | null }> {
  const body = {
    locationId: process.env.GHL_LOCATION_ID,
    firstName: lead.firstName,
    lastName: lead.lastName,
    name: lead.name,
    email: lead.email,
    website: lead.website || undefined,
    phone: lead.phone || undefined,
    source: lead.source,
    tags: lead.tags,
    // Everything the form asks that has no first-class GHL field. Custom
    // fields are addressed by key, which has to exist on the location first.
    customFields: compact([
      field("qs_intent", lead.intent),
      field("qs_stack", lead.currentPlatform),
      field("qs_role", lead.role),
      field("qs_risk_today", lead.stage),
      field("qs_timeline", lead.timeline),
      field("qs_telegram", lead.telegram),
      field("qs_notes", lead.notes),
      field("qs_page", lead.page),
    ]),
  };
  const out = await call("/contacts/upsert", { method: "POST", body });
  const contact = out?.contact as { id?: string } | undefined;
  const id = contact?.id || (typeof out?.id === "string" ? out.id : null);
  if (!id) throw new Error("GHL upsert returned no contact id");
  return { id };
}

// Availability map keyed by YYYY-MM-DD. The per-day payload has varied across
// API versions, so this normalises defensively rather than trusting one shape.
export async function getSlots({
  from,
  to,
  timezone,
}: {
  from: number;
  to: number;
  timezone: string;
}): Promise<Record<string, string[]>> {
  const calendarId = process.env.GHL_CALENDAR_ID;
  if (!calendarId) throw new Error("GHL_CALENDAR_ID is not set");
  const out = await call(`/calendars/${calendarId}/free-slots`, {
    query: { startDate: from, endDate: to, timezone },
  });
  const days: Record<string, string[]> = {};
  for (const [key, value] of Object.entries(out || {})) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) continue; // skip traceId & friends
    const raw = Array.isArray(value) ? value : (value as { slots?: unknown })?.slots;
    if (!Array.isArray(raw)) continue;
    days[key] = raw
      .map((s) => (typeof s === "string" ? s : s?.startTime || s?.start))
      .filter((s): s is string => typeof s === "string" && s.length > 0);
  }
  return days;
}

// Contact first, then appointment against its id. Some API versions accept a
// contact inline on the appointment; upserting first works on all of them and
// means a booking that fails at the calendar step still captured the lead.
export async function createAppointment({
  lead,
  startIso,
  timezone,
}: {
  lead: Lead;
  startIso: string;
  timezone: string;
}): Promise<{ id: string | null; contactId: string | null }> {
  const { id: contactId } = await createLead(lead);
  const out = await call("/calendars/events/appointments", {
    method: "POST",
    body: {
      calendarId: process.env.GHL_CALENDAR_ID,
      locationId: process.env.GHL_LOCATION_ID,
      contactId,
      startTime: startIso,
      timezone,
      title: `Demo — ${lead.name}`,
      appointmentStatus: "confirmed",
      ignoreFreeSlotValidation: false,
    },
  });
  const event = out?.event as { id?: string } | undefined;
  const id = (typeof out?.id === "string" ? out.id : null) || event?.id || null;
  return { id, contactId };
}

const field = (key: string, value: string | undefined) =>
  value ? { key, field_value: value } : null;
const compact = <T,>(arr: (T | null)[]): T[] => arr.filter((x): x is T => x !== null);
