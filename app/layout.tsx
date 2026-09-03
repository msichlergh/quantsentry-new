import type { Metadata } from "next";
import { Instrument_Sans } from "next/font/google";
import Script from "next/script";
import type { ReactNode } from "react";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

import { JsonLd, organizationNode, webSiteNode } from "./_seo/jsonld";
import {
  HTML_LANG,
  OG_IMAGE,
  OG_LOCALE,
  SITE_NAME,
  SITE_URL,
  TWITTER_SITE,
  clampMetaDescription,
  clampOgDescription,
  clampTitle,
} from "./_seo/site";

import "./globals.css";

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-instrument-sans",
});

// 54 chars. The previous default was 64 — over Google's ~60-char SERP cut, so
// the tail was being truncated on every route that fell through to it.
const DEFAULT_TITLE = "QuantSentry | Data Intelligence for Trading Businesses";
const DEFAULT_DESCRIPTION =
  "Network based AI risk and business intelligence for modern trading businesses.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: clampTitle(DEFAULT_TITLE),
    // Pages route their titles through `buildMetadata`, which sets an absolute
    // title and applies the suffix itself only when it fits the budget. This
    // template is the fallback for any route that sets a bare string title.
    template: `%s | ${SITE_NAME}`,
  },
  description: clampMetaDescription(DEFAULT_DESCRIPTION),
  alternates: { canonical: "/" },
  openGraph: {
    title: clampTitle(DEFAULT_TITLE),
    description: clampOgDescription(DEFAULT_DESCRIPTION),
    url: "/",
    siteName: SITE_NAME,
    locale: OG_LOCALE,
    type: "website",
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: clampTitle(DEFAULT_TITLE),
    description: clampOgDescription(DEFAULT_DESCRIPTION),
    images: [OG_IMAGE],
    ...(TWITTER_SITE ? { site: TWITTER_SITE } : {}),
  },
  // No `robots` block here on purpose. A directive set on the root layout is
  // inherited by app/not-found.tsx too, which put `index, follow` on the 404
  // page next to its `noindex`. The indexing directives live in
  // `buildMetadata` instead, so only real pages carry them.
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang={HTML_LANG}>
      <head>
        {/* Preload the two faces used for above-the-fold text so `font-display: swap` never flashes. */}
        <link rel="preload" href="/fonts/general-sans-400.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/general-sans-500.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        {/* Site-wide entity graph. Every page inherits it, and the `@id`s here
            are what the per-page BlogPosting / BreadcrumbList nodes point at. */}
        <JsonLd nodes={[organizationNode(), webSiteNode()]} />
      </head>
      <body className={instrumentSans.variable}>
        <Header />
        {children}
        <Footer />
        <Script src="/site.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
