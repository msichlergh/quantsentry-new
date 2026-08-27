import type { Lead } from "@/lib/lead";

// The contract every CRM adapter implements. Route handlers only ever talk to
// this shape, so replacing GoHighLevel later is a new adapter plus one env var.
export type CrmProvider = {
  name: string;
  isConfigured: () => boolean;
  createLead: (lead: Lead) => Promise<{ id: string | null; configured?: boolean }>;
  getSlots: (args: { from: number; to: number; timezone: string }) => Promise<Record<string, string[]>>;
  createAppointment: (args: { lead: Lead; startIso: string; timezone: string }) => Promise<{
    id: string | null;
    contactId: string | null;
    configured?: boolean;
  }>;
};
