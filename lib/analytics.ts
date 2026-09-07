"use client";

import { track } from "@vercel/analytics";

// Browser analytics. Provider: Vercel Web Analytics (custom events) +
// Vercel Speed Insights, both mounted in app/layout.tsx via
// lib/analytics-provider.tsx.
//
// Vercel Web Analytics was chosen because it is first-party to the host, needs
// no account wiring, sets no cookie and builds no cross-site profile — so it
// adds no consent surface to a site that has none. If a provider that does
// need consent is ever adopted, it goes behind a banner, not behind this file.
//
// Three rules hold this module together:
//
//   1. Event names and payload keys are STABLE. The wizard's call sites were
//      written before a provider existed; renaming an event orphans whatever
//      the dashboard has already collected.
//   2. Reporting NEVER breaks a flow. Every send is wrapped. A lead is worth
//      more than the record that it happened, so a throw here must never
//      escape into a form submission.
//   3. NO personal data leaves the browser. The server-side logs were
//      redacted for this reason; the client must not undo that. `scrub` below
//      is the enforcement, not a convention — see the note on it.

// Hard off switch. Static reference so Next inlines it at build time.
// Unset means ON: analytics must fail open, or one forgotten dashboard
// setting silently costs the whole launch window's data.
const DISABLED = process.env.NEXT_PUBLIC_ANALYTICS_DISABLED === "1";

const DEV = process.env.NODE_ENV !== "production";

// Vercel accepts flat primitives only; nested objects are dropped by the SDK.
type SafeValue = string | number | boolean | null;

// ---------------------------------------------------------------------------
// PII scrubbing
// ---------------------------------------------------------------------------
//
// The public signature takes `Record<string, unknown>`, so a future call site
// can hand this module anything — including `{ ...form }`. The denylist is
// deliberately blunt and biased towards over-blocking: a dropped dimension is
// a reporting gap, a leaked one is a data-protection incident.
//
// Substring match, on the key lowercased with separators stripped. `name`
// covers firstName / last_name / fullname / surname in one entry, and will
// also block a legitimate `step_name` — that trade is intentional. If a key
// you want is being dropped, rename the key; do not weaken the list.
const BLOCKED_FRAGMENTS = [
  "mail",
  "name",
  "phone",
  "telegram",
  "whatsapp",
  "address",
  "postcode",
  "postal",
  "birth",
  "passport",
  "notes",
  "message",
  "comment",
  "company",
  "website",
];

// Short, ambiguous keys that would over-match as substrings ("ip" inside
// "description", "id" inside "step_id"), so they are matched whole.
const BLOCKED_KEYS = new Set([
  "ip",
  "id",
  "uid",
  "user",
  "tel",
  "url",
  "href",
  "note",
  "msg",
  "dial",
  "contact",
  "street",
  "zip",
]);

const EMAIL_LIKE = /[^\s@]+@[^\s@]+\.[^\s@]{2,}/;
// A leading + or digit followed by six or more digits/formatting characters.
const PHONE_LIKE = /^[+\d][\d\s().-]{6,}$/;

// Free text is the other leak vector — a `notes` field renamed to something
// the denylist misses still arrives as a long string. Anything longer than a
// label is refused rather than truncated: a truncated email still identifies.
const MAX_VALUE_LENGTH = 64;
const MAX_PROPERTIES = 12;

function blockedKey(key: string): boolean {
  const normalized = key.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (BLOCKED_KEYS.has(normalized)) return true;
  return BLOCKED_FRAGMENTS.some((fragment) => normalized.includes(fragment));
}

function safeValue(value: unknown): SafeValue | undefined {
  if (value === null) return null;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return Number.isFinite(value) ? value : undefined;
  if (typeof value !== "string") return undefined;

  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (trimmed.length > MAX_VALUE_LENGTH) return undefined;
  if (EMAIL_LIKE.test(trimmed)) return undefined;
  if (PHONE_LIKE.test(trimmed)) return undefined;
  return trimmed;
}

function scrub(props: Record<string, unknown>): Record<string, SafeValue> {
  const out: Record<string, SafeValue> = {};
  for (const [key, raw] of Object.entries(props)) {
    if (Object.keys(out).length >= MAX_PROPERTIES) break;
    if (blockedKey(key)) continue;
    const value = safeValue(raw);
    if (value === undefined) continue;
    out[key] = value;
  }
  return out;
}

// ---------------------------------------------------------------------------
// Where the visitor arrived from
// ---------------------------------------------------------------------------
//
// `document.referrer` is set once per document load and is NOT rewritten by
// the client router, so this stays the session's entry referrer across
// in-app navigations — which is the question worth answering ("where did this
// booking come from"), not "which route did they click from".
//
// Cross-origin referrers are reduced to the host: `Referrer-Policy:
// strict-origin-when-cross-origin` already strips the path, and a full URL we
// do not control can carry query strings we do not want to store. Same-origin
// referrers keep the path — those are our own routes — with the query and
// hash dropped.
let cachedReferrer: string | null = null;

function entryReferrer(): string {
  if (cachedReferrer !== null) return cachedReferrer;
  if (typeof document === "undefined") return "unknown";

  const raw = document.referrer;
  if (!raw) {
    cachedReferrer = "direct";
    return cachedReferrer;
  }
  try {
    const url = new URL(raw);
    const value = url.origin === window.location.origin ? url.pathname : url.hostname;
    cachedReferrer = value.slice(0, MAX_VALUE_LENGTH);
  } catch {
    cachedReferrer = "unknown";
  }
  return cachedReferrer;
}

// ---------------------------------------------------------------------------
// Send
// ---------------------------------------------------------------------------
//
// Not exported: every event this site sends is a named function below, so the
// catalogue is greppable and nobody can invent an event name at a call site.
function send(name: string, props?: Record<string, unknown>): void {
  if (DISABLED) return;
  // The SDK queues into `window.vaq` until its script loads and no-ops on the
  // server, but the guard keeps the intent explicit.
  if (typeof window === "undefined") return;
  try {
    const payload = scrub({ ...props, referrer: entryReferrer() });
    if (DEV) console.debug("[analytics]", name, payload);
    track(name, payload);
  } catch {
    // Deliberately swallowed. This function sits inside a form submission;
    // a reporting failure must not surface to the visitor or abort the send.
  }
}

/**
 * Booking funnel events. `event` is one of the names in the catalogue:
 * `demo_form_start`, `demo_form_step`, `demo_slot_selected`,
 * `demo_booked`, `demo_submit_failed`.
 */
export function trackBookDemo(event: string, props?: Record<string, unknown>): void {
  send(event, props);
}

/** A lead that the server confirmed it delivered. The conversion event. */
export function trackLeadSubmit(props?: Record<string, unknown>): void {
  send("lead_submit", props);
}
