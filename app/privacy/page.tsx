import type { Metadata } from "next";

import { LegalDocuments } from "@/components/LegalDocuments";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Quant Technology Group collects, uses, and protects personal data across our platforms and services.",
};

export default function PrivacyPage() {
  return (
    <main className="page-content legal-page">
      <section className="legal-page-shell dots">
        <div className="wrap legal-page-wrap">
          <LegalDocuments document="privacy" />
        </div>
      </section>
    </main>
  );
}
