# GoHighLevel setup

What has to exist in the GHL location before the demo wizard and contact form
can sync. Everything below is addressed **by key**, so the key has to match
exactly — GHL rejects a custom field write for a key the location does not have.

## 1. Environment variables (Vercel → Project → Settings → Environment Variables)

| Variable | Where to find it |
|---|---|
| `GHL_API_TOKEN` | Private Integration token (Settings → Private Integrations). Needs contacts write + calendars write. |
| `GHL_LOCATION_ID` | Settings → Business Profile, or the `location/<id>` segment in the CRM URL. |
| `GHL_CALENDAR_ID` | Calendars → the calendar the demo should book into → its id. |
| `GHL_API_VERSION` | Optional. Defaults to the version pinned in `lib/crm/ghl.ts`. |
| `CRM_PROVIDER` | Optional. Defaults to `ghl`. |
| `LEAD_FALLBACK_WEBHOOK_URL` | Optional but recommended — an n8n/Slack/Zapier webhook that takes JSON. If GHL is down, the lead goes here instead of being lost. |

Without the token and location id a **production** build now fails deliberately,
rather than silently accepting leads and dropping them. Set them before pointing
the domain at this deployment.

## 2. Standard contact fields — nothing to create

These map onto GHL's built-in contact fields automatically:

`firstName`, `lastName`, `name`, `email`, `phone`, `website`, `source`
(source is always the string `quantsentry.com`).

Contacts are **upserted**, not created, so a repeat enquiry updates the existing
record instead of duplicating it. That honours the location's duplicate-contact
setting, which must be on for matching by email/phone.

## 3. Custom fields to create

Settings → Custom Fields → Contact. Type **Single line text** for all of them
(the values arrive as strings; a dropdown would reject anything not on its list).

| Key | Label suggestion | Example values |
|---|---|---|
| `qs_intent` | Business type | Prop Trading Firm, Brokerage, Fund or Asset Manager, Payments or Fintech |
| `qs_role` | Role | Founder / CEO, Risk / Operations, CTO / Tech Lead, Other |
| `qs_risk_today` | How risk is handled today | In House Team, One Person Part Time, Outsourced, Nobody Dedicated Yet |
| `qs_timeline` | Timeline | free text from the wizard |
| `qs_telegram` | Telegram | `@handle` |
| `qs_notes` | Notes | free text; also carries the message body from the short contact form |
| `qs_page` | Source page | e.g. `/demo`, `/pricing` |

Empty answers are omitted from the payload, so an optional question the visitor
skipped never overwrites an existing value with a blank.

## 4. Tags — created automatically, nothing to set up

GHL creates tags on write, so these need no configuration, but they are what
workflows should trigger on rather than parsing custom fields:

- `website-lead` — on every submission
- `demo-form` / `contact-form` — which form it came from
- `demo-booked` — a calendar slot was chosen
- `personal-email` — a free email domain (gmail, outlook…). Flagged, never rejected.
- `intent:<slug>` — e.g. `intent:prop-trading-firm`
- `timeline:<slug>`

## 5. Booking

When a slot is picked, the route does a contact upsert **then** creates the
appointment on `GHL_CALENDAR_ID`. The two calls share one wall-clock deadline
(6s + 6s, inside a 20s function limit). If the contact lands but the appointment
fails, the error carries the contact id so the half-finished booking is findable.

## 6. Verify

```
node scripts/verify-ghl.mjs              # config + read-only free-slots check
node scripts/verify-ghl.mjs --live --book  # + contact upsert + appointment
```

Test records are tagged `qs-verification` with a `qs-test+…` email so they are
easy to find and delete. The script never prints a token.
