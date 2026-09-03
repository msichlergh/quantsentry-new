"use client";

import { useEffect, useImperativeHandle, useRef, type Ref } from "react";

// Cloudflare Turnstile, browser half.
//
// The server half is app/api/lead/route.ts. It only switches on when BOTH
// TURNSTILE_SECRET_KEY and TURNSTILE_SITE_KEY are set, and a submission that
// fails verification is dropped SILENTLY with a 200. That makes two things
// non-negotiable here:
//
//   1. With no site key configured this component renders nothing at all and
//      makes no network request. That is the state the site ships in today.
//   2. Turnstile's own failure never blocks a submit. A blocked script, an ad
//      blocker, a Cloudflare outage — the form still posts, with no token, and
//      the server decides. Losing a real lead to a third-party script is worse
//      than the bots the honeypot, the timing check and the rate limiter still
//      have to get past.

// Inlined at build time by Next. Must be the SAME value as the server's
// TURNSTILE_SITE_KEY — see .env.example.
export const TURNSTILE_SITE_KEY = (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "").trim();

export const turnstileEnabled = Boolean(TURNSTILE_SITE_KEY);

// Explicit render: without it api.js scans the document for .cf-turnstile and
// mounts widgets we did not ask for. No &onload= — api.js warns in the console
// if the named global is gone by the time it looks for it, and installing a
// global we then have to keep alive buys nothing over the load event.
const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
// Past this the script is treated as never arriving. Long enough for a slow
// mobile connection, short enough that nobody waits on it at submit time.
const SCRIPT_TIMEOUT_MS = 6000;
// api.js installs window.turnstile as it executes, so the load event is
// normally enough. This is the safety net for a build that ever defers it.
const GLOBAL_POLL_MS = 50;
// How long a submit will wait for a challenge that is still running.
const TOKEN_WAIT_MS = 4000;

type TurnstileRenderOptions = {
  sitekey: string;
  action?: string;
  theme?: "auto" | "light" | "dark";
  appearance?: "always" | "execute" | "interaction-only";
  "response-field"?: boolean;
  "refresh-expired"?: "auto" | "manual" | "never";
  callback?: (token: string) => void;
  "error-callback"?: (code?: string) => boolean;
  "expired-callback"?: () => void;
  "timeout-callback"?: () => void;
};

type TurnstileApi = {
  render: (el: HTMLElement, options: TurnstileRenderOptions) => string | undefined;
  reset: (widgetId?: string) => void;
  remove: (widgetId?: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

// One script tag per document, one in-flight promise per document. Resolves
// null — never rejects — on error or timeout, so every caller fails open.
let loader: Promise<TurnstileApi | null> | null = null;

function loadTurnstile(): Promise<TurnstileApi | null> {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (loader) return loader;

  loader = new Promise<TurnstileApi | null>((resolve) => {
    const el = document.createElement("script");
    let timeout = 0;
    let poll = 0;
    let settled = false;

    const finish = (api: TurnstileApi | null) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeout);
      window.clearInterval(poll);
      el.removeEventListener("load", onLoad);
      el.removeEventListener("error", onError);
      if (!api) {
        // Take the dead tag back out and drop the memoised failure, so a later
        // mount (or a visitor who disabled their blocker) can try again.
        loader = null;
        el.remove();
      }
      resolve(api);
    };
    const onLoad = () => {
      if (window.turnstile) {
        finish(window.turnstile);
        return;
      }
      // Executed but no global yet. Watch for it until the timeout fires.
      poll = window.setInterval(() => {
        if (window.turnstile) finish(window.turnstile);
      }, GLOBAL_POLL_MS);
    };
    const onError = () => finish(null);

    timeout = window.setTimeout(() => finish(null), SCRIPT_TIMEOUT_MS);

    el.src = SCRIPT_SRC;
    el.async = true;
    el.defer = true;
    el.addEventListener("load", onLoad);
    el.addEventListener("error", onError);
    document.head.appendChild(el);
  });

  return loader;
}

// The one legitimate use of useEffect: mounting a third-party widget.
function useOnMountEffect(fn: () => void | (() => void)) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(fn, []);
}

export type TurnstileHandle = {
  // Best-effort token. Resolves "" when Turnstile is off, blocked, slow or
  // broken. Never rejects, never waits longer than TOKEN_WAIT_MS.
  getToken: () => Promise<string>;
  // Tokens are single-use and expire after ~300s. Call this after a rejected
  // submit so the retry carries a fresh one.
  reset: () => void;
};

export function Turnstile({
  ref,
  action,
}: {
  ref?: Ref<TurnstileHandle>;
  // Labels the challenge in Cloudflare's analytics; not a security boundary.
  action?: string;
}) {
  const host = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const token = useRef("");
  // Set once the script or the render is known to have failed, so a submit
  // returns immediately instead of sitting out the full token wait.
  const dead = useRef(false);
  const waiting = useRef<((value: string) => void)[]>([]);

  // Nothing in here re-renders: the widget owns its own DOM, and the token is
  // read imperatively at submit time.
  const flush = (value: string) => {
    const queued = waiting.current;
    waiting.current = [];
    for (const resolve of queued) resolve(value);
  };

  const onToken = (value: string) => {
    token.current = value;
    flush(value);
  };

  const giveUp = () => {
    dead.current = true;
    token.current = "";
    flush("");
  };

  const resetWidget = () => {
    token.current = "";
    const api = window.turnstile;
    if (!api || !widgetId.current) return;
    try {
      api.reset(widgetId.current);
    } catch {
      // A widget Cloudflare has already torn down. Nothing to recover.
      giveUp();
    }
  };

  useImperativeHandle(
    ref,
    () => ({
      getToken: () => {
        if (!turnstileEnabled || dead.current) return Promise.resolve("");
        if (token.current) return Promise.resolve(token.current);
        // A challenge is still running. Wait for it, but not for long.
        return new Promise<string>((resolve) => {
          let done = false;
          const settle = (value: string) => {
            if (done) return;
            done = true;
            resolve(value);
          };
          waiting.current.push(settle);
          window.setTimeout(() => settle(""), TOKEN_WAIT_MS);
        });
      },
      reset: resetWidget,
    }),
    // Every value it closes over is a ref.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useOnMountEffect(() => {
    if (!turnstileEnabled) return;
    let alive = true;

    loadTurnstile().then((api) => {
      if (!alive) return;
      if (!api || !host.current) {
        giveUp();
        return;
      }
      try {
        widgetId.current =
          api.render(host.current, {
            sitekey: TURNSTILE_SITE_KEY,
            action,
            // The card and the form are dark; "auto" would follow the OS and
            // drop a light widget onto a graphite panel.
            theme: "dark",
            // Managed: the visitor sees nothing unless Cloudflare decides they
            // have to interact.
            appearance: "interaction-only",
            // No hidden <input> injected into the form — the token is sent as
            // JSON by lib/lead-client.
            "response-field": false,
            // Cloudflare re-runs the challenge itself when a token expires and
            // calls back with a fresh one.
            "refresh-expired": "auto",
            callback: onToken,
            "error-callback": () => {
              giveUp();
              // Handled: suppresses Cloudflare's own error UI. We fail open
              // rather than telling the visitor about a problem that is not
              // theirs and that they cannot act on.
              return true;
            },
            "expired-callback": () => {
              token.current = "";
            },
            "timeout-callback": resetWidget,
          }) || null;
        if (!widgetId.current) giveUp();
      } catch {
        giveUp();
      }
    });

    return () => {
      alive = false;
      const api = window.turnstile;
      if (api && widgetId.current) {
        try {
          api.remove(widgetId.current);
        } catch {
          // Already gone.
        }
      }
      widgetId.current = null;
      // A submit that was waiting on a form being torn down must not hang.
      flush("");
    };
  });

  // The state the site ships in today: no key, no widget, no container, no
  // request, no layout shift.
  if (!turnstileEnabled) return null;

  return <div className="bd-turnstile" ref={host} />;
}
