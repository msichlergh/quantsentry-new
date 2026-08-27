// The only CRM surface the app knows about.
//
// Route handlers import from here and never from a provider file, so
// replacing GoHighLevel later is a new adapter plus one env var — no route or
// component changes. Worth being clear about the limit of that: the
// workflows, tags, custom fields and calendar all still live in the provider.
// This keeps the *website* portable, it does not make the CRM disposable.
import type { CrmProvider } from "./provider";
import * as ghl from "./ghl";
import * as noop from "./noop";

const PROVIDERS: Record<string, CrmProvider> = { ghl, noop };

export function crm(): CrmProvider {
  const want = process.env.CRM_PROVIDER || "ghl";
  const p = PROVIDERS[want];
  if (!p) throw new Error(`Unknown CRM_PROVIDER: ${want}`);
  // Falling back to the noop provider rather than throwing keeps local dev
  // and preview deploys working without credentials — it logs instead of
  // writing.
  return p.isConfigured() ? p : noop;
}
