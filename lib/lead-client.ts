"use client";

// Browser half of the lead flow. Server-only concerns (tokens, CRM) live in
// lib/crm — nothing from there may be imported here.

export type LeadForm = {
  intent: string;
  stage: string;
  role: string;
  timeline: string;
  notes: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  telegram: string;
  website: string;
  country: string;
  dial: string;
  company_confirm: string;
};

export type LeadResponse = {
  ok: boolean;
  delivered: boolean;
  booked?: boolean;
  degraded?: boolean;
  dropped?: boolean;
};

export type SlotsResponse = {
  ok: boolean;
  configured: boolean;
  timezone: string;
  days: Record<string, string[]>;
  minLeadHours: number;
};

export class LeadError extends Error {
  fieldErrors: Record<string, string> | null;

  constructor(message: string, fieldErrors: Record<string, string> | null = null) {
    super(message);
    this.fieldErrors = fieldErrors;
  }
}

export const localTimezone = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
};

// The Turnstile token, under the field name Cloudflare's own widget uses.
// Spread into the payload rather than set unconditionally: with the widget off
// — no NEXT_PUBLIC_TURNSTILE_SITE_KEY, which is the state today — the key is
// absent from the body entirely and the request is byte-for-byte what it was
// before Turnstile existed. An empty token is never sent as an empty string:
// the route treats a blank token and a missing one identically, and a key that
// is only ever "" is noise in the payload.
function turnstileField(token?: string): Record<string, string> {
  const value = (token || "").trim();
  return value ? { "cf-turnstile-response": value } : {};
}

// `ts` is when the form was rendered; the route rejects sub-2s submissions.
// `company_confirm` is the honeypot and is always sent empty from a real form.
export async function submitLead({
  form,
  startIso,
  timezone,
  renderedAt,
  page,
  turnstileToken,
}: {
  form: LeadForm;
  startIso: string | null;
  timezone: string;
  renderedAt: number;
  page?: string;
  turnstileToken?: string;
}): Promise<LeadResponse> {
  const payload = {
    ...form,
    ...turnstileField(turnstileToken),
    // The picker holds the dial code separately so the input can stay a plain
    // national number; the CRM wants one E.164-ish string.
    phone: [form.dial, form.phone].filter(Boolean).join(" ").trim() || "",
    company_confirm: form.company_confirm || "",
    ts: renderedAt,
    startIso,
    timezone: timezone || localTimezone(),
    page: page || (typeof window !== "undefined" ? window.location.pathname : ""),
  };

  const res = await fetch("/api/lead", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  let data: (LeadResponse & { error?: string; errors?: Record<string, string> }) | null = null;
  try {
    data = await res.json();
  } catch {
    /* handled below */
  }

  if (!res.ok || !data?.ok) {
    throw new LeadError(
      data?.error || "Something went wrong. Please try again.",
      data?.errors || null,
    );
  }
  return data;
}

// The compact contact form. Same route, same protections, no slot — it
// declares itself with `form: "contact"` so the CRM can route it later.
export async function submitContact({
  name,
  email,
  website,
  message,
  renderedAt,
  honeypot,
  turnstileToken,
}: {
  name: string;
  email: string;
  website: string;
  message: string;
  renderedAt: number;
  honeypot: string;
  turnstileToken?: string;
}): Promise<LeadResponse> {
  const payload = {
    form: "contact",
    ...turnstileField(turnstileToken),
    name,
    email,
    website,
    notes: message,
    company_confirm: honeypot || "",
    ts: renderedAt,
    page: typeof window !== "undefined" ? window.location.pathname : "",
  };

  const res = await fetch("/api/lead", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  let data: (LeadResponse & { error?: string; errors?: Record<string, string> }) | null = null;
  try {
    data = await res.json();
  } catch {
    /* handled below */
  }

  if (!res.ok || !data?.ok) {
    throw new LeadError(
      data?.error || "Something went wrong. Please try again.",
      data?.errors || null,
    );
  }
  return data;
}

export async function fetchSlots({
  from,
  to,
  timezone,
}: {
  from: Date;
  to: Date;
  timezone: string;
}): Promise<SlotsResponse> {
  const q = new URLSearchParams({
    from: new Date(from).toISOString(),
    to: new Date(to).toISOString(),
    tz: timezone || localTimezone(),
  });
  const res = await fetch(`/api/slots?${q}`, { headers: { Accept: "application/json" } });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.ok) throw new Error(data?.error || "Could not load availability");
  return data;
}

// Slots come back as whatever the calendar returned — ISO timestamps in
// practice. `zone` is the zone the visitor picked, not the browser's: a
// mis-shown demo time is a missed meeting.
export function slotLabel(iso: string, zone?: string): string {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return String(iso);
  try {
    return new Date(t).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      ...(zone ? { timeZone: zone } : {}),
    });
  } catch {
    // An invalid zone must not blank the time out.
    return new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
}

// Country for the phone prefix. Edge header first; the browser's own locale is
// the fallback, which is right often enough for a default the visitor can change.
export async function detectCountry(): Promise<string | null> {
  try {
    // `?cc=DE` on the page carries through, so the dial code can be checked for
    // any country without a VPN.
    const cc = new URLSearchParams(window.location.search).get("cc");
    const res = await fetch(`/api/geo${cc ? `?cc=${encodeURIComponent(cc)}` : ""}`, {
      headers: { Accept: "application/json" },
    });
    const data = await res.json();
    if (data?.country) return data.country;
  } catch {
    /* fall through */
  }
  try {
    const loc = new Intl.Locale(navigator.language);
    return (loc.region || navigator.language.split("-")[1] || "").toUpperCase() || null;
  } catch {
    return null;
  }
}

// "GMT+2", "GMT-5:30" — the part people actually recognise as "their" time.
export function tzOffsetLabel(zone: string): string {
  try {
    const parts = new Intl.DateTimeFormat("en-GB", { timeZone: zone, timeZoneName: "shortOffset" })
      .formatToParts(new Date());
    return parts.find((p) => p.type === "timeZoneName")?.value || "";
  } catch {
    return "";
  }
}

export const slotDayKey = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
