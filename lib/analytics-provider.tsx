"use client";

import { Analytics, type BeforeSendEvent } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

// Mount point for the two Vercel scripts. Both components render `null` and
// inject a same-origin script under /_vercel/, so there is no third-party
// origin, no cookie, and nothing for a CSP allowlist to learn about later.
//
// This lives in its own client module for one reason: `beforeSend` is a
// function, and a function prop cannot cross the server/client boundary from
// app/layout.tsx. Keeping the wrapper here leaves the root layout a server
// component.

// Analytics records the URL of every pageview and custom event. Query strings
// are visitor-controlled — a mistyped link, a campaign tag, a value someone
// pastes into an address bar — so the path is kept and the query and hash are
// dropped before the event leaves the browser. Same reasoning as the redaction
// already applied to the server-side lead logs.
function stripQuery(event: BeforeSendEvent): BeforeSendEvent {
  try {
    const url = new URL(event.url);
    return { ...event, url: `${url.origin}${url.pathname}` };
  } catch {
    return event;
  }
}

// Static reference so Next inlines it. Unset means ON — see lib/analytics.ts.
const DISABLED = process.env.NEXT_PUBLIC_ANALYTICS_DISABLED === "1";

export function SiteAnalytics() {
  if (DISABLED) return null;
  return (
    <>
      <Analytics beforeSend={stripQuery} />
      <SpeedInsights />
    </>
  );
}
