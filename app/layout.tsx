import type { Metadata } from "next";
import Script from "next/script";
import type { ReactNode } from "react";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

import "./globals.css";

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
      <body>
        <Header />
        {children}
        <Footer />
        <Script src="/site.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
