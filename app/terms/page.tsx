import type { Metadata } from "next";

import { LegalDocuments } from "@/components/LegalDocuments";

import { JsonLd, breadcrumbNode } from "../_seo/jsonld";
import { buildMetadata } from "../_seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Terms of Service",
  description:
    "The terms governing your access to and use of QTG’s websites, products, and services.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <main className="page-content legal-page">
      <JsonLd
        nodes={[
          breadcrumbNode([
            { name: "Home", path: "/" },
            { name: "Terms of Service", path: "/terms" },
          ]),
        ]}
      />
      <section className="legal-page-shell dots">
        <div className="wrap legal-page-wrap">
          <LegalDocuments document="terms" />
        </div>
      </section>
    </main>
  );
}
