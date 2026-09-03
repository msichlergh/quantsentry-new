#!/usr/bin/env node
// End-to-end verification of the GoHighLevel connection.
//
// Talks to the same endpoints, with the same headers and payload shape, as
// lib/crm/ghl.ts — so a pass here means the adapter's credentials, scopes,
// location and calendar are all genuinely working, not just present.
//
//   node scripts/verify-ghl.mjs                 dry run: config + read-only slot lookup
//   node scripts/verify-ghl.mjs --live          + contact upsert (WRITES to the CRM)
//   node scripts/verify-ghl.mjs --live --book   + calendar appointment (WRITES to the CRM)
//
// Every record it creates uses the email prefix `qs-test+` and the tag
// `qs-verification`, so they are trivial to find and delete afterwards. The
// script prints the exact ids it created.
//
// It never prints a token.
import { loadEnvFiles, describe } from "./env-file.mjs";

const BASE = "https://services.leadconnectorhq.com";

const args = new Set(process.argv.slice(2));
const LIVE = args.has("--live");
const BOOK = args.has("--book");

const files = loadEnvFiles();
const VERSION = process.env.GHL_API_VERSION || "2021-07-28";
const TOKEN = process.env.GHL_API_TOKEN;
const LOCATION_ID = process.env.GHL_LOCATION_ID;
const CALENDAR_ID = process.env.GHL_CALENDAR_ID;

const created = { contactId: null, appointmentId: null };
let failed = false;

function step(label) {
  console.log(`\n── ${label}`);
}
function ok(msg) {
  console.log(`   PASS  ${msg}`);
}
function bad(msg) {
  failed = true;
  console.log(`   FAIL  ${msg}`);
}

async function call(path, { method = "GET", body, query, timeoutMs = 10_000 } = {}) {
  const url = new URL(BASE + path);
  for (const [k, v] of Object.entries(query || {})) {
    if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
  }
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Version: VERSION,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
    signal: AbortSignal.timeout(timeoutMs),
  });
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    /* non-JSON body */
  }
  return { status: res.status, ok: res.ok, json, text: text.slice(0, 500) };
}

// --- 1. configuration ------------------------------------------------------
step("Configuration");
console.log(`   env files: ${files.length ? files.join(", ") : "(none)"}`);
for (const row of [
  describe("CRM_PROVIDER"),
  describe("GHL_API_TOKEN", { secret: true }),
  describe("GHL_LOCATION_ID", { secret: true }),
  describe("GHL_CALENDAR_ID", { secret: true }),
  describe("GHL_API_VERSION"),
]) {
  console.log(`   ${row.name.padEnd(17)} ${row.set ? row.hint : "MISSING"}`);
}

if (!TOKEN || !LOCATION_ID) {
  console.error(
    "\nCannot verify: GHL_API_TOKEN and GHL_LOCATION_ID are required.\n" +
      "Copy .env.example to .env.local and fill them in.\n",
  );
  process.exit(1);
}
ok(`API version header "${VERSION}"`);

// --- 2. token + location ---------------------------------------------------
step("Token and location (GET /locations/:id)");
{
  const res = await call(`/locations/${LOCATION_ID}`);
  if (res.ok) {
    const loc = res.json?.location || res.json;
    ok(`location reachable: ${loc?.name ?? "(unnamed)"}`);
  } else if (res.status === 401 || res.status === 403) {
    bad(`${res.status} — token rejected or missing scope. Detail: ${JSON.stringify(res.json ?? res.text)}`);
  } else if (res.status === 404) {
    bad("404 — GHL_LOCATION_ID does not match a location this token can see.");
  } else {
    // Some Private Integration tokens are not scoped to locations.readonly.
    // That is fine for the lead path; it is not fatal here.
    console.log(`   SKIP  ${res.status} — token likely lacks locations.readonly. Not required by the site.`);
  }
}

// --- 3. calendar availability (read-only) ---------------------------------
let firstSlot = null;
step("Calendar availability (GET /calendars/:id/free-slots)");
if (!CALENDAR_ID) {
  bad("GHL_CALENDAR_ID is not set — the booking half of the wizard cannot work.");
} else {
  const from = Date.now() + 4 * 3600_000; // matches MIN_LEAD_HOURS in app/api/slots/route.ts
  const to = Date.now() + 14 * 86400_000;
  const res = await call(`/calendars/${CALENDAR_ID}/free-slots`, {
    query: { startDate: from, endDate: to, timezone: "UTC" },
  });
  if (!res.ok) {
    bad(`${res.status} — ${JSON.stringify(res.json ?? res.text)}`);
  } else {
    const days = Object.entries(res.json || {}).filter(([k]) => /^\d{4}-\d{2}-\d{2}$/.test(k));
    let count = 0;
    for (const [day, value] of days) {
      const raw = Array.isArray(value) ? value : value?.slots;
      if (!Array.isArray(raw)) continue;
      for (const s of raw) {
        const iso = typeof s === "string" ? s : s?.startTime || s?.start;
        if (typeof iso === "string" && iso) {
          count += 1;
          if (!firstSlot) firstSlot = { iso, day };
        }
      }
    }
    if (count === 0) {
      bad("0 bookable slots in the next 14 days — the picker will show nothing. Check the calendar's availability windows.");
    } else {
      ok(`${count} slots across ${days.length} days; first is ${firstSlot.iso}`);
    }
  }
}

// --- 4. contact upsert (WRITE) --------------------------------------------
const stamp = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
const testEmail = `qs-test+${stamp}@quantsentry.com`;

step(`Contact upsert (POST /contacts/upsert)${LIVE ? "" : "  [skipped — pass --live]"}`);
if (LIVE) {
  const res = await call("/contacts/upsert", {
    method: "POST",
    body: {
      locationId: LOCATION_ID,
      firstName: "QS",
      lastName: "Verification",
      name: "QS Verification",
      email: testEmail,
      phone: "+10000000000",
      source: "quantsentry.com",
      tags: ["qs-verification", "website-lead", "demo-form"],
    },
  });
  if (!res.ok) {
    bad(`${res.status} — ${JSON.stringify(res.json ?? res.text)}`);
  } else {
    created.contactId = res.json?.contact?.id || (typeof res.json?.id === "string" ? res.json.id : null);
    if (created.contactId) ok(`contact ${created.contactId} (${testEmail})`);
    else bad(`upsert returned no contact id: ${JSON.stringify(res.json)}`);
  }
} else {
  console.log(`   would create ${testEmail}`);
}

// --- 5. appointment (WRITE) -----------------------------------------------
step(`Appointment (POST /calendars/events/appointments)${LIVE && BOOK ? "" : "  [skipped — pass --live --book]"}`);
if (LIVE && BOOK) {
  if (!created.contactId) bad("no contact id from the previous step; cannot book.");
  else if (!CALENDAR_ID) bad("GHL_CALENDAR_ID is not set.");
  else if (!firstSlot) bad("no free slot found to book into.");
  else {
    const res = await call("/calendars/events/appointments", {
      method: "POST",
      body: {
        calendarId: CALENDAR_ID,
        locationId: LOCATION_ID,
        contactId: created.contactId,
        startTime: firstSlot.iso,
        timezone: "UTC",
        title: "Demo — QS Verification (DELETE ME)",
        appointmentStatus: "confirmed",
        ignoreFreeSlotValidation: false,
      },
    });
    if (!res.ok) {
      bad(`${res.status} — ${JSON.stringify(res.json ?? res.text)}`);
    } else {
      created.appointmentId =
        (typeof res.json?.id === "string" ? res.json.id : null) || res.json?.event?.id || null;
      ok(`appointment ${created.appointmentId ?? "(id not returned)"} at ${firstSlot.iso}`);
    }
  }
}

// --- summary ---------------------------------------------------------------
console.log("\n" + "─".repeat(66));
if (created.contactId || created.appointmentId) {
  console.log("TEST RECORDS CREATED IN GOHIGHLEVEL — delete these:");
  if (created.contactId) console.log(`   contact      ${created.contactId}   ${testEmail}`);
  if (created.appointmentId) console.log(`   appointment  ${created.appointmentId}   ${firstSlot?.iso}`);
  console.log("   (search contacts for  qs-test+  or the tag  qs-verification )");
} else {
  console.log("No records created.");
}
console.log(failed ? "\nRESULT: FAILED\n" : "\nRESULT: PASSED\n");
process.exit(failed ? 1 : 0);
