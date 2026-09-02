import type { Metadata } from "next";

import { LegalDocuments } from "@/components/LegalDocuments";

export const metadata: Metadata = {
  title: "Legal",
  description:
    "Read the Privacy Policy and Terms of Service that apply to QuantSentry and Quant Technology Group services.",
};

export default function LegalPage() {
  return (
    <main className="page-content legal-page">
      <section className="legal-page-shell dots">
        <div className="wrap legal-page-wrap">
          <div className="legal-page-heading">
            <div className="kicker">
              <span className="dot" />
              <span>Legal</span>
            </div>
            <h1>Privacy and Terms</h1>
            <p>
              The policies for QuantSentry, provided by Quant Technology Group.
            </p>
          </div>

          <LegalDocuments />
        </div>
      </section>
    </main>
  );
}
