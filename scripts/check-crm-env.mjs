#!/usr/bin/env node
// Preflight: is this environment actually able to deliver a lead?
//
//   node scripts/check-crm-env.mjs          report, exit 0 unless production is broken
//   node scripts/check-crm-env.mjs --strict  treat any missing var as a failure
//
// Wire it in front of the build to make a credential-less production deploy
// impossible to ship by accident:
//
//   "build": "node scripts/check-crm-env.mjs && next build"
//
// It never prints a secret — only whether each variable is set.
//
// The variable list here intentionally mirrors lib/crm/ghl.ts and
// lib/crm/index.ts. Keep them in step; this script runs under plain node and
// cannot import the TypeScript modules.
import { loadEnvFiles, describe } from "./env-file.mjs";

const files = loadEnvFiles();
const strictFlag = process.argv.includes("--strict");

const vercelEnv = process.env.VERCEL_ENV || null;
const nodeEnv = process.env.NODE_ENV || "development";
const isProduction = vercelEnv ? vercelEnv === "production" : nodeEnv === "production";
const allowNoop = process.env.CRM_ALLOW_NOOP === "1" || process.env.CRM_ALLOW_NOOP === "true";
const provider = process.env.CRM_PROVIDER || "ghl";

const rows = [
  describe("CRM_PROVIDER"),
  describe("GHL_API_TOKEN", { secret: true }),
  describe("GHL_LOCATION_ID", { secret: true }),
  describe("GHL_CALENDAR_ID", { secret: true }),
  describe("GHL_API_VERSION"),
  describe("LEAD_FALLBACK_WEBHOOK_URL", { secret: true }),
  describe("CRM_ALLOW_NOOP"),
];

const pad = Math.max(...rows.map((r) => r.name.length));
console.log("");
console.log(`env files loaded : ${files.length ? files.join(", ") : "(none)"}`);
console.log(`VERCEL_ENV       : ${vercelEnv ?? "(unset)"}`);
console.log(`NODE_ENV         : ${nodeEnv}`);
console.log(`treated as prod  : ${isProduction ? "yes" : "no"}`);
console.log("");
for (const r of rows) {
  console.log(`  ${r.name.padEnd(pad)}  ${r.set ? r.hint : "MISSING"}`);
}
console.log("");

const contactMissing = ["GHL_API_TOKEN", "GHL_LOCATION_ID"].filter((k) => !process.env[k]);
const bookingMissing = [...contactMissing, ...(process.env.GHL_CALENDAR_ID ? [] : ["GHL_CALENDAR_ID"])];

if (provider === "noop") {
  console.log('CRM_PROVIDER="noop": leads are LOGGED, NOT DELIVERED.');
} else if (provider !== "ghl") {
  console.error(`FAIL  Unknown CRM_PROVIDER "${provider}". Known: ghl, noop.`);
  process.exit(1);
} else if (contactMissing.length === 0 && bookingMissing.length === 0) {
  console.log("OK    contact capture and booking are both configured.");
} else if (contactMissing.length === 0) {
  console.log(`WARN  contact capture OK; booking will fail. Missing: ${bookingMissing.join(", ")}.`);
} else {
  console.log(`      contact capture NOT configured. Missing: ${contactMissing.join(", ")}.`);
}

if (!process.env.LEAD_FALLBACK_WEBHOOK_URL) {
  console.log("WARN  LEAD_FALLBACK_WEBHOOK_URL unset — a CRM outage loses the submission.");
}

const wouldDegrade = provider === "ghl" && contactMissing.length > 0;

if (wouldDegrade && isProduction && !allowNoop) {
  console.error("");
  console.error("FAIL  Production with no CRM credentials. /api/lead will refuse to");
  console.error("      pretend it delivered. Set the variables above, or set");
  console.error("      CRM_ALLOW_NOOP=1 to run deliberately without a CRM.");
  console.error("");
  process.exit(1);
}
if (wouldDegrade && isProduction && allowNoop) {
  console.warn("");
  console.warn("WARN  CRM_ALLOW_NOOP is set in a production-like environment.");
  console.warn("      Leads will be LOGGED and NOT DELIVERED.");
  console.warn("");
}
if (strictFlag && (wouldDegrade || bookingMissing.length > 0)) {
  console.error("FAIL  --strict: configuration is incomplete.");
  process.exit(1);
}
console.log("");
