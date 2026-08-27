"use client";

// Analytics stubs. The wizard is fully instrumented — every call site is in
// place — but nothing is wired to a provider yet.
// TODO: wire these to the analytics provider once one is chosen (e.g. Vercel
// Analytics, PostHog or GA4). Keep the event names and payloads stable.

export function trackBookDemo(event: string, props?: Record<string, unknown>): void {
  console.debug("[analytics] book-demo", event, props);
}

export function trackLeadSubmit(props?: Record<string, unknown>): void {
  console.debug("[analytics] lead-submit", props);
}
