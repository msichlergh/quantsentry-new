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
  currentPlatform?: string;
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
    currentPlatform: str(body?.currentPlatform, MAX.other) || undefined,
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

// Two cheap filters that cost a real visitor nothing:
//   trap  — a hidden input no human sees; bots fill every field they find
//   ts    — when the form was rendered; a sub-2s submission was not typed
// Both fail silently at the route: a bot told it was blocked just adapts.
export function looksAutomated(body: LeadBody | null | undefined): string | null {
  if (str(body?.company_confirm, 200)) return "honeypot";
  const rendered = Number(body?.ts);
  if (Number.isFinite(rendered) && Date.now() - rendered < 2000) return "too-fast";
  return null;
}
