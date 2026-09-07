import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    // AVIF first, WebP as the fallback for browsers that do not accept it.
    // Order matters: the first entry matching the request's `Accept` header
    // wins. The capabilities screenshots are the bulk of the image weight and
    // AVIF is roughly 20% smaller than the WebP they ship as today.
    formats: ["image/avif", "image/webp"],
  },
  // Applied to every response, including API routes and static assets. Cheap,
  // and none of them change what the page can do — a CSP would, see the note.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            // Two years, subdomains included, and preload-eligible.
            //
            // Preload is a ONE-WAY DOOR: submitting the domain to the browser
            // preload list means every browser refuses plain HTTP to
            // quantsentry.com and every subdomain, before it ever contacts us.
            // Removal takes months to propagate. This is correct here because
            // the site is HTTPS-only on Vercel — but any future subdomain
            // (status page, docs, a partner's CNAME) must be HTTPS from its
            // first day or it will be unreachable.
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            // Stops a browser second-guessing Content-Type. Relevant here
            // because /api/* returns caller-influenced JSON: without this, a
            // response a browser decides to sniff as HTML is an XSS vector.
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            // Full URL to same-origin, origin-only cross-origin, nothing over
            // a downgrade to HTTP.
            //
            // NOT no-referrer, deliberately. The customer's inbound attribution
            // is built on the Referer their traffic sources see; no-referrer
            // hides quantsentry.com from every site they link out to and blinds
            // their own referral reporting. This is the strictest value that
            // does not cost them that.
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            // Clickjacking. The demo wizard is the conversion path and it is a
            // form — framing it is how you overlay a fake submit button.
            // SAMEORIGIN rather than DENY so the site can still frame itself.
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            // Nothing on this site uses these. Denying them means an injected
            // script cannot silently ask for them either, and interest-cohort
            // opts out of topic-based ad profiling of our visitors.
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
        ],
      },
    ];
  },
  // --- Content-Security-Policy: deliberately NOT set here -------------------
  //
  // A CSP is the one header on this list that can break the site, and it cannot
  // be added from this file. Two things on every page need a per-request nonce:
  //
  //   * the inline JSON-LD in app/_seo/jsonld.tsx (a <script type=
  //     "application/ld+json"> whose content is generated per route)
  //   * next/script and Next's own inline bootstrap/hydration scripts
  //
  // A nonce has to be unique per response, so it cannot live in a static config
  // header. Shipping it means:
  //
  //   1. a proxy.ts (Next 16 renamed middleware -> proxy) that generates a
  //      nonce per request, sets it on a request header, and emits the CSP
  //      header referencing it
  //   2. every inline <script> reading that nonce and setting nonce={...} —
  //      next/script forwards it automatically, the JSON-LD tags do not
  //   3. `style-src` allowing the styles next/font and the three.js canvases
  //      inject, which in practice means 'unsafe-inline' for styles unless the
  //      component work is done to remove them
  //   4. a Report-Only rollout first. A CSP shipped straight to enforce on a
  //      site with a WebGL hero and a third-party CRM form breaks something,
  //      and it breaks it for visitors, silently.
  //
  // That is a day of work with a real regression surface, on a site launching
  // this week. It belongs in its own ticket, staged Report-Only, not bundled
  // into a security fix that has to land now.
  async redirects() {
    return [
      {
        source: "/risk-intelligence-network",
        destination: "/network",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
