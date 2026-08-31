import type { Metadata } from "next";
import { Instrument_Sans } from "next/font/google";
import Script from "next/script";
import type { ReactNode } from "react";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

import "./globals.css";

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-instrument-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://quantsentry.com"),
  title: {
    default: "QuantSentry | The data intelligence layer for trading businesses",
    template: "%s | QuantSentry",
  },
  description:
    "Network based AI risk and business intelligence for prop firms.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en-GB">
      <head>
        {/* Preload the two faces used for above-the-fold text so `font-display: swap` never flashes. */}
        <link rel="preload" href="/fonts/general-sans-400.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/general-sans-500.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
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
