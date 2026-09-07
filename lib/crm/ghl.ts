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
import "server-only";

import type { Lead } from "@/lib/lead";

const BASE = "https://services.leadconnectorhq.com";
const VERSION = process.env.GHL_API_VERSION || "2021-07-28";

export const name = "ghl";

// --- Timeout budget -------------------------------------------------------
//
// These are not arbitrary. The booking path makes TWO sequential calls inside
// one serverless invocation, and the route then has a fallback webhook to
// reach if either fails. The whole chain has to finish inside the function's
// maxDuration or the platform kills the request mid-flight — which is how you
// end up with a contact in the CRM, no appointment against it, and an error on
// the visitor's screen.
//
//   contact upsert        6s
//   appointment create    6s   (capped further by whatever the budget has left)
//   ------------------------
//   provider worst case  12s
//   fallback webhook      4s   (app/api/lead/route.ts)
//   ------------------------
//   route worst case     16s   < maxDuration 20 in app/api/lead/route.ts
//
// Changing any number here means re-checking the maxDuration in both routes.
export const CONTACT_TIMEOUT_MS = 6_000;
export const APPOINTMENT_TIMEOUT_MS = 6_000;
export const SLOTS_TIMEOUT_MS = 8_000;
export const BOOKING_BUDGET_MS = CONTACT_TIMEOUT_MS + APPOINTMENT_TIMEOUT_MS;
// Below this there is no point starting an HTTP call; it would be aborted
// before the connection is established and burn the remaining budget for
// nothing.
const MIN_CALL_MS = 750;

export function isConfigured(): boolean {
  return missingConfig().length === 0;
}

// Names only, never values. Callers put these in logs and error responses.
export function missingConfig(): string[] {
  const missing: string[] = [];
  if (!process.env.GHL_API_TOKEN) missing.push("GHL_API_TOKEN");
  if (!process.env.GHL_LOCATION_ID) missing.push("GHL_LOCATION_ID");
  return missing;
}

// Booking needs a calendar on top of the contact credentials. Deliberately not
// part of isConfigured(): a missing calendar id must not demote the whole
// provider to noop and swallow contact capture too.
export function missingBookingConfig(): string[] {
  const missing = missingConfig();
  if (!process.env.GHL_CALENDAR_ID) missing.push("GHL_CALENDAR_ID");
  return missing;
}

export class GhlError extends Error {
  status: number;
  detail: unknown;

  constructor(message: string, status: number, detail: unknown) {
    super(message);
    this.name = "GhlError";
    this.status = status;
    this.detail = detail;
  }
}

// Thrown when the contact upsert succeeded and the appointment did not. The
// distinction matters to whoever picks the lead up: the CRM already holds this
// person, so the follow-up is "book them", not "re-enter them".
export class PartialBookingError extends Error {
  contactId: string | null;
  cause: unknown;

  constructor(message: string, contactId: string | null, cause: unknown) {
    super(message);
    this.name = "PartialBookingError";
    this.contactId = contactId;
    this.cause = cause;
  }
}

type CallOptions = {
  method?: string;
  body?: unknown;
  query?: Record<string, string | number | undefined | null>;
  timeoutMs?: number;
};

async function call(
  path: string,
  { method = "GET", body, query, timeoutMs = CONTACT_TIMEOUT_MS }: CallOptions = {},
) {
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
    signal: AbortSignal.timeout(Math.max(MIN_CALL_MS, timeoutMs)),
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
export async function createLead(
  lead: Lead,
  { timeoutMs = CONTACT_TIMEOUT_MS }: { timeoutMs?: number } = {},
): Promise<{ id: string | null }> {
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
      field("qs_role", lead.role),
      field("qs_risk_today", lead.stage),
      field("qs_timeline", lead.timeline),
      field("qs_telegram", lead.telegram),
      field("qs_notes", lead.notes),
      field("qs_page", lead.page),
    ]),
  };
  const out = await call("/contacts/upsert", { method: "POST", body, timeoutMs });
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
    timeoutMs: SLOTS_TIMEOUT_MS,
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
//
// Both calls share ONE wall-clock budget. Without that, a slow contact upsert
// plus a slow appointment create can run past the function limit, and the
// platform kills the invocation after the contact was written — the visitor
// sees a failure while the CRM holds a contact with no booking, and the
// fallback webhook never gets a chance to run. With the shared deadline the
// second call is capped by whatever is left, and if nothing is left we throw
// PartialBookingError ourselves so the route's rescue path still fires.
export async function createAppointment({
  lead,
  startIso,
  timezone,
}: {
  lead: Lead;
  startIso: string;
  timezone: string;
}): Promise<{ id: string | null; contactId: string | null }> {
  const deadline = Date.now() + BOOKING_BUDGET_MS;

  const { id: contactId } = await createLead(lead, { timeoutMs: CONTACT_TIMEOUT_MS });

  const remaining = deadline - Date.now();
  if (remaining < MIN_CALL_MS) {
    throw new PartialBookingError(
      "GHL contact upsert consumed the booking budget; appointment not attempted",
      contactId,
      null,
    );
  }

  try {
    const out = await call("/calendars/events/appointments", {
      method: "POST",
      timeoutMs: Math.min(APPOINTMENT_TIMEOUT_MS, remaining),
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
  } catch (err) {
    // Re-thrown with the contact id attached so the fallback payload can say
    // "this person is already in the CRM, they just are not booked".
    throw new PartialBookingError(
      err instanceof Error ? err.message : String(err),
      contactId,
      err,
    );
  }
}

const field = (key: string, value: string | undefined) =>
  value ? { key, field_value: value } : null;
const compact = <T,>(arr: (T | null)[]): T[] => arr.filter((x): x is T => x !== null);
