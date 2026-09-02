import type { Metadata } from "next";

import { LegalDocuments } from "@/components/LegalDocuments";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms governing your access to and use of QTG’s websites, products, and services.",
};

export default function TermsPage() {
  return (
    <main className="page-content legal-page">
      <section className="legal-page-shell dots">
        <div className="wrap legal-page-wrap">
          <LegalDocuments document="terms" />
        </div>
      </section>
    </main>
  );
}
