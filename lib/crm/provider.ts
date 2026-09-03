import "server-only";

import type { Lead } from "@/lib/lead";

// The contract every CRM adapter implements. Route handlers only ever talk to
// this shape, so replacing GoHighLevel later is a new adapter plus one env var.
export type CrmProvider = {
  name: string;
  isConfigured: () => boolean;
  // Which env vars this adapter needs and does not have. Returned rather than
  // logged so the caller decides how loud to be — the resolver in ./index.ts
  // uses it to name the missing variable in production instead of quietly
  // degrading to noop. Never contains a value, only a variable name.
  missingConfig: () => string[];
  // The subset of config that only the booking path needs. Contact capture
  // works without it; an appointment does not. Kept separate so a missing
  // calendar id is reported as "booking is broken" rather than taking the
  // whole CRM down.
  missingBookingConfig: () => string[];
  createLead: (lead: Lead) => Promise<{ id: string | null; configured?: boolean }>;
  getSlots: (args: { from: number; to: number; timezone: string }) => Promise<Record<string, string[]>>;
  createAppointment: (args: { lead: Lead; startIso: string; timezone: string }) => Promise<{
    id: string | null;
    contactId: string | null;
    configured?: boolean;
  }>;
};
