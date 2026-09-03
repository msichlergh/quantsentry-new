// Used when no CRM credentials are present: local dev, and preview deploys
// that should not write into the live CRM.
//
// It logs and succeeds rather than throwing, so the form is testable without
// secrets. `configured: false` travels back in the API response, which is
// what the UI keys off to avoid claiming a booking was made when nothing was.
//
// IMPORTANT: reaching this provider by accident is a lead black hole — it
// returns success for a write that never happened. ./index.ts is what makes
// sure that can only happen where it is intended (dev and preview), and never
// silently in production.
import "server-only";

import { redactLead, type Lead } from "@/lib/lead";

export const name = "noop";

export function isConfigured(): boolean {
  return true;
}

export function missingConfig(): string[] {
  return [];
}

export function missingBookingConfig(): string[] {
  return [];
}

export async function createLead(lead: Lead): Promise<{ id: null; configured: false }> {
  // REDACTED. This ran on EVERY submission in any environment resolving to
  // noop — dev, preview, and a production build with CRM_ALLOW_NOOP — and it
  // printed the visitor's name, work email, phone and free-text notes in full.
  // redactLead keeps what is diagnostically useful (which form, which tags,
  // whether a phone was supplied) and masks the identifying values.
  console.log("[lead] no CRM configured, not delivered:", JSON.stringify(redactLead(lead)));
  return { id: null, configured: false };
}

export async function getSlots(): Promise<Record<string, string[]>> {
  // Deliberately empty rather than invented. A fabricated slot list is how
  // you ship a confirmation for a meeting that does not exist.
  return {};
}

export async function createAppointment({
  lead,
  startIso,
  timezone,
}: {
  lead: Lead;
  startIso: string;
  timezone: string;
}): Promise<{ id: null; contactId: null; configured: false }> {
  // Same redaction as createLead. The slot and zone are not PII and are the
  // only part of this line anyone debugging a booking actually reads.
  console.log(
    "[booking] no CRM configured, not delivered:",
    JSON.stringify({ lead: redactLead(lead), startIso, timezone }),
  );
  return { id: null, contactId: null, configured: false };
}
