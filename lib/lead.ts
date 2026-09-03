// Validation, normalisation and spam checks for inbound form submissions.
//
// Hand-rolled rather than a schema library: this is one shape, and adding a
// dependency for a dozen fields would be the more expensive choice.

const MAX = { name: 120, email: 200, firm: 160, website: 200, phone: 40, notes: 2000, other: 120 };

const str = (v: unknown, cap: number): string =>
  typeof v === "string" ? v.trim().slice(0, cap) : "";

// Deliberately permissive. The point is to reject obvious rubbish before it
// reaches the CRM, not to adjudicate RFC 5322 — a real address that this
// rejects costs more than a fake one it lets through.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const FREE_EMAIL = new Set([
  "gmail.com", "googlemail.com", "yahoo.com", "hotmail.com", "outlook.com",
  "live.com", "icloud.com", "aol.com", "proton.me", "protonmail.com", "gmx.com",
]);

export type Lead = {
  intent?: string;
  timeline?: string;
  telegram?: string;
  name: string;
  firstName: string;
  lastName?: string;
  email: string;
  website?: string;
  phone?: string;
  role?: string;
  stage?: string;
  notes?: string;
  page?: string;
  source: string;
  tags: string[];
  freeEmail: boolean;
};

type LeadBody = Record<string, unknown>;

export function parseLead(
  body: LeadBody | null | undefined,
  { page }: { page?: unknown } = {},
): { lead: Lead; errors: Record<string, string>; ok: boolean } {
  const errors: Record<string, string> = {};
  // The form posts the halves; `name` is still accepted so anything else
  // hitting this endpoint keeps working.
  const firstName = str(body?.firstName, MAX.name);
  const lastName = str(body?.lastName, MAX.name);
  const name = [firstName, lastName].filter(Boolean).join(" ") || str(body?.name, MAX.name);
  const email = str(body?.email, MAX.email).toLowerCase();
  const phone = str(body?.phone, MAX.phone);

  // The contact form declares itself, because the two forms do not agree on
  // what is required. A demo enquiry is a sales conversation and a phone
  // number is the point; the contact form is a message box and demanding one
  // there loses the message. Client-declared, which is fine here — the worst
  // a forged value does is skip one soft field on a lead form.
  const isContact = body?.form === "contact";

  if (name.length < 2) errors.firstName = "Enter your name";
  if (!EMAIL.test(email)) errors.email = "Enter a valid work email";
  // Digit count only. The form sends dial code + national number joined, so a
  // format check here would reject real numbers from countries we did not
  // think of. Six digits is the shortest national number in use.
  if (!isContact && phone.replace(/\D/g, "").length < 6) errors.phone = "Enter your phone number";

  const website = normaliseUrl(str(body?.website, MAX.website));

  const lead: Lead = {
    intent: str(body?.intent, MAX.other) || undefined,
    timeline: str(body?.timeline, MAX.other) || undefined,
    telegram: str(body?.telegram, MAX.other) || undefined,
    name,
    firstName: firstName || name.split(/\s+/)[0] || name,
    lastName: lastName || name.split(/\s+/).slice(1).join(" ") || undefined,
    email,
    website,
    phone: phone || undefined,
    role: str(body?.role, MAX.other) || undefined,
    stage: str(body?.stage, MAX.other) || undefined,
    notes: str(body?.notes, MAX.notes) || undefined,
    page: str(page, MAX.other) || undefined,
    source: "quantsentry.com",
    tags: ["website-lead"],
    // Flagged, not rejected: plenty of real founders enquire from a personal
    // address, and sales would rather see it than lose it.
    freeEmail: FREE_EMAIL.has(email.split("@")[1] || ""),
  };
  if (lead.freeEmail) lead.tags.push("personal-email");
  // Which form this came from travels as a tag, so a GHL workflow can route
  // a contact message differently from a demo request without parsing
  // custom fields.
  lead.tags.push(isContact ? "contact-form" : "demo-form");
  // The answers sales routes on travel as tags as well as fields, so a
  // workflow can trigger without parsing a custom field.
  const slug = (v: string) => v.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  if (lead.intent) lead.tags.push(`intent:${slug(lead.intent)}`);
  if (lead.timeline) lead.tags.push(`timeline:${slug(lead.timeline)}`);

  return { lead, errors, ok: Object.keys(errors).length === 0 };
}

function normaliseUrl(v: string): string | undefined {
  if (!v) return undefined;
  const withScheme = /^https?:\/\//i.test(v) ? v : `https://${v}`;
  try {
    return new URL(withScheme).toString();
  } catch {
    return undefined; // a malformed URL is not worth failing a lead over
  }
}

// Nobody fills a form in under two seconds.
const MIN_FILL_MS = 2000;
// Client clocks drift, and a visitor whose machine is a few minutes fast is not
// a bot. Anything beyond this is a fabricated timestamp.
const MAX_CLOCK_SKEW_MS = 5 * 60_000;
// No real browser stamps a render time before this. Catches 0, "", null coerced
// to 0, and seconds-instead-of-millis timestamps in one comparison.
const EARLIEST_PLAUSIBLE_TS = Date.UTC(2020, 0, 1);

// Two cheap filters that cost a real visitor nothing:
//   trap  — a hidden input no human sees; bots fill every field they find
//   ts    — when the form was rendered; a sub-2s submission was not typed
// Both fail silently at the route: a bot told it was blocked just adapts.
//
// --- Fails CLOSED, and that is the whole point ----------------------------
//
// The previous version read `Number(body?.ts)` and only applied the timing rule
// when the result was finite. `Number(undefined)` is NaN, so OMITTING `ts`
// skipped the check entirely — the defence was opt-in, and the attacker held
// the switch. Deleting one field from the payload disabled it.
//
// Now an absent, non-numeric or implausible `ts` is itself the signal. Both
// real clients (lib/lead-client.ts) always send a mount-time `Date.now()`, so
// this costs a genuine submission nothing.
//
// An OLD timestamp is deliberately NOT a failure: a visitor who leaves the tab
// open over lunch and submits an hour later is a lead, not a bot.
export function looksAutomated(body: LeadBody | null | undefined): string | null {
  if (str(body?.company_confirm, 200)) return "honeypot";

  const raw = body?.ts;
  if (typeof raw !== "number" && typeof raw !== "string") return "no-timestamp";
  const rendered = typeof raw === "number" ? raw : Number(raw.trim());
  if (!Number.isFinite(rendered) || rendered < EARLIEST_PLAUSIBLE_TS) return "bad-timestamp";

  const now = Date.now();
  if (rendered > now + MAX_CLOCK_SKEW_MS) return "future-timestamp";
  if (now - rendered < MIN_FILL_MS) return "too-fast";
  return null;
}

// --- Log redaction --------------------------------------------------------
//
// A lead is name, work email, phone and free-text notes: PII, and in the EU
// personal data under GDPR. Platform logs are retained, searchable, and visible
// to anyone with project access — so nothing below ever emits a raw value.
//
// What a log line still needs to be useful is the ability to say "this is the
// same person as that other line" and "which record do I go and look at in the
// CRM". `fingerprint` gives the first, the masked forms give the second.

// FNV-1a and DJB2 over the same input, concatenated to 64 bits.
//
// NOT a security primitive and not intended as one — a hash of an email is
// brute-forceable from a wordlist regardless of the algorithm. Its job is to
// correlate log lines without printing the address. Hand-rolled to keep this
// module free of a node:crypto import, which would make it server-only and it
// is shared with the provider types.
export function fingerprint(value: string): string {
  const input = value.trim().toLowerCase();
  if (!input) return "none";
  let fnv = 0x811c9dc5;
  let djb = 5381;
  for (let i = 0; i < input.length; i++) {
    const c = input.charCodeAt(i);
    fnv = Math.imul(fnv ^ c, 0x01000193);
    djb = Math.imul(djb, 33) ^ c;
  }
  const hex = (n: number) => (n >>> 0).toString(16).padStart(8, "0");
  return `${hex(fnv)}${hex(djb)}`;
}

// "m***@example.com" — the domain is the operationally useful half (it tells
// you whether this is a fund, a free mailbox or a throwaway) and the local part
// is the identifying half, so only the domain survives.
export function maskEmail(email: string | undefined): string {
  if (!email) return "";
  const at = email.lastIndexOf("@");
  if (at < 1) return "***";
  return `${email[0]}***@${email.slice(at + 1)}`;
}

// Last four digits only: enough to match against a CRM record you already have
// open, useless as a contact detail on its own.
export function maskPhone(phone: string | undefined): string {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  return digits.length < 4 ? "***" : `***${digits.slice(-4)}`;
}

/**
 * The only representation of a lead that may be written to a log.
 *
 * Never returns `name`, `email`, `phone`, `notes`, `telegram` or `website` in
 * full. Notes are reduced to a length because their CONTENT is free text a
 * visitor typed — the highest-risk field on the form and the one with no
 * diagnostic value at all.
 */
export function redactLead(lead: Lead): Record<string, unknown> {
  return {
    id: fingerprint(lead.email),
    email: maskEmail(lead.email),
    phone: maskPhone(lead.phone),
    // First initial only. Enough to disambiguate two leads from one firm.
    name: lead.name ? `${lead.name[0]}***` : "",
    // Host, not the full URL: a path can carry a query string with anything in it.
    websiteHost: hostOf(lead.website),
    hasTelegram: Boolean(lead.telegram),
    notesLength: lead.notes?.length ?? 0,
    intent: lead.intent,
    timeline: lead.timeline,
    role: lead.role,
    stage: lead.stage,
    page: lead.page,
    source: lead.source,
    tags: lead.tags,
    freeEmail: lead.freeEmail,
  };
}

function hostOf(url: string | undefined): string {
  if (!url) return "";
  try {
    return new URL(url).host;
  } catch {
    return "invalid";
  }
}
