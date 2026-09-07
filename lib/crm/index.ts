// The only CRM surface the app knows about.
//
// Route handlers import from here and never from a provider file, so
// replacing GoHighLevel later is a new adapter plus one env var — no route or
// component changes. Worth being clear about the limit of that: the
// workflows, tags, custom fields and calendar all still live in the provider.
// This keeps the *website* portable, it does not make the CRM disposable.
//
// --- Why this file refuses to fail quietly --------------------------------
//
// The demo wizard is the site's only conversion path. The noop provider logs
// and returns success, so anything that silently routes production traffic to
// it turns the lead form into a black hole that still answers HTTP 200 — a
// failure nobody notices until someone asks why the pipeline is empty.
//
// So the fallback to noop is scoped, not automatic:
//
//   local dev / preview  -> fall back to noop, log a warning, keep working
//   production           -> throw, loudly, on the first call
//
// "Production" is VERCEL_ENV when the platform sets it, and NODE_ENV
// otherwise. CRM_ALLOW_NOOP=1 is the explicit, documented escape hatch for the
// one legitimate case — running a production *build* locally, or a deploy that
// deliberately must not write to the live CRM.
import "server-only";

import type { CrmProvider } from "./provider";
import * as ghl from "./ghl";
import * as noop from "./noop";

const PROVIDERS: Record<string, CrmProvider> = { ghl, noop };

export class CrmNotConfiguredError extends Error {
  readonly requested: string;
  readonly missing: string[];

  constructor(requested: string, missing: string[]) {
    super(
      `CRM_PROVIDER="${requested}" is not usable in this environment. ` +
        `Missing: ${missing.join(", ") || "unknown"}. ` +
        `Set them, or set CRM_ALLOW_NOOP=1 to deliberately run without a CRM ` +
        `(leads will be logged and NOT delivered).`,
    );
    this.name = "CrmNotConfiguredError";
    this.requested = requested;
    this.missing = missing;
  }
}

export class UnknownCrmProviderError extends Error {
  readonly requested: string;

  constructor(requested: string) {
    super(
      `Unknown CRM_PROVIDER: "${requested}". Known providers: ${Object.keys(PROVIDERS).join(", ")}.`,
    );
    this.name = "UnknownCrmProviderError";
    this.requested = requested;
  }
}

export type CrmResolution = {
  provider: CrmProvider;
  /** What CRM_PROVIDER asked for. */
  requested: string;
  /** True when a real provider was requested and we had to substitute noop. */
  degraded: boolean;
  /** Env var NAMES that are missing. Never values. */
  missing: string[];
  /** Env var names missing for the booking path specifically. */
  missingBooking: string[];
  /** True when this environment refuses to run degraded. */
  strict: boolean;
};

// VERCEL_ENV is "production" | "preview" | "development" and is authoritative
// on Vercel. NODE_ENV alone cannot tell a real production deploy from
// `next build && next start` on a laptop, which is exactly why the escape
// hatch exists.
export function isProductionRuntime(): boolean {
  const vercelEnv = process.env.VERCEL_ENV;
  if (vercelEnv) return vercelEnv === "production";
  return process.env.NODE_ENV === "production";
}

export function noopAllowed(): boolean {
  const v = process.env.CRM_ALLOW_NOOP;
  return v === "1" || v === "true";
}

// Non-throwing inspection. Use this for diagnostics and health output; use
// crm() for anything that is about to read or write.
export function resolveCrm(): CrmResolution {
  const requested = process.env.CRM_PROVIDER || "ghl";
  const provider = PROVIDERS[requested];
  // A typo in CRM_PROVIDER is a configuration error everywhere, including
  // preview. Serving noop for it would hide the typo behind a 200.
  if (!provider) throw new UnknownCrmProviderError(requested);

  // Explicitly asking for noop is a choice, not a degradation.
  if (requested === "noop") {
    return { provider: noop, requested, degraded: false, missing: [], missingBooking: [], strict: false };
  }

  const missing = provider.missingConfig();
  if (missing.length === 0) {
    return {
      provider,
      requested,
      degraded: false,
      missing: [],
      missingBooking: provider.missingBookingConfig(),
      strict: false,
    };
  }

  return {
    provider: noop,
    requested,
    degraded: true,
    missing,
    missingBooking: provider.missingBookingConfig(),
    strict: isProductionRuntime() && !noopAllowed(),
  };
}

// Warned once per server instance rather than once per request: a cold Vercel
// instance re-logs it, a warm one does not spam every submission.
let warned = false;

export function crm(): CrmProvider {
  const resolution = resolveCrm();

  if (resolution.degraded) {
    if (!warned) {
      warned = true;
      console.error(
        "[crm] DEGRADED TO NOOP — leads are logged, NOT delivered. " +
          `Requested "${resolution.requested}", missing: ${resolution.missing.join(", ")}.`,
      );
    }
    if (resolution.strict) {
      throw new CrmNotConfiguredError(resolution.requested, resolution.missing);
    }
  } else if (resolution.missingBooking.length > 0 && !warned) {
    // Contact capture works, booking does not. Worth one loud line, because
    // the symptom otherwise is "the calendar shows no times" with a healthy
    // looking lead route.
    warned = true;
    console.error(
      "[crm] booking is not configured — contact capture works, appointments will fail. " +
        `Missing: ${resolution.missingBooking.join(", ")}.`,
    );
  }

  return resolution.provider;
}
