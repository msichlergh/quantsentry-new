// Used when no CRM credentials are present: local dev, and preview deploys
// that should not write into the live CRM.
//
// It logs and succeeds rather than throwing, so the form is testable without
// secrets. `configured: false` travels back in the API response, which is
// what the UI keys off to avoid claiming a booking was made when nothing was.
import type { Lead } from "@/lib/lead";

export const name = "noop";

export function isConfigured(): boolean {
  return true;
}

export async function createLead(lead: Lead): Promise<{ id: null; configured: false }> {
  console.log("[lead] no CRM configured, not delivered:", JSON.stringify(lead));
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
  console.log(
    "[booking] no CRM configured, not delivered:",
    JSON.stringify({ lead, startIso, timezone }),
  );
  return { id: null, contactId: null, configured: false };
}
