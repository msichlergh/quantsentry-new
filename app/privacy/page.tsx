import type { Metadata } from "next";

import { LegalDocuments } from "@/components/LegalDocuments";

import { JsonLd, breadcrumbNode } from "../_seo/jsonld";
import { buildMetadata } from "../_seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Privacy Policy",
  description:
    "How Quant Technology Group collects, uses, and protects personal data across our platforms and services.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <main className="page-content legal-page">
      <JsonLd
        nodes={[
          breadcrumbNode([
            { name: "Home", path: "/" },
            { name: "Privacy Policy", path: "/privacy" },
          ]),
        ]}
      />
      <section className="legal-page-shell dots">
        <div className="wrap legal-page-wrap">
          <LegalDocuments document="privacy" />
        </div>
      </section>
    </main>
  );
}
