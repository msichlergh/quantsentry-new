import type { Metadata } from "next";

import { FooterCtaAurora } from "@/components/FooterCtaAurora";
import { HeroPixelBlast } from "@/components/HeroPixelBlast";
import { PlatformCalculator } from "@/components/PlatformCalculator";

import { JsonLd, breadcrumbNode } from "../../_seo/jsonld";
import { buildMetadata } from "../../_seo/metadata";

const PATH = "/pricing/calculator";
// HeroPixelBlast looks for the hero as the first child of this element, so the
// JSON-LD script stays outside <main>.
const CONTENT_ID = "page-content-calculator";

export const metadata: Metadata = buildMetadata({
  title: "Prop Firm Savings Calculator",
  description:
    "Estimate what QuantSentry Platform saves your prop firm. Enter monthly challenge revenue, average challenge fee, payout ratio and expected cost savings, and compare them with Platform pricing.",
  path: PATH,
});

export default function CalculatorPage() {
  return (
    <>
      <JsonLd
        nodes={[
          breadcrumbNode([
            { name: "Home", path: "/" },
            { name: "Pricing", path: "/pricing" },
            { name: "Prop Firm Savings Calculator", path: PATH },
          ]),
        ]}
      />
      <main className="page-content" id={CONTENT_ID}>
        <section className="hero dots">
          <div className="wrap">
            <div className="kicker">
              <span className="dot" />
              <span>Prop Firm Savings Calculator</span>
            </div>
            <h1>
              Built for prop firms.
              <br />
              <span className="c">See what Platform saves you.</span>
            </h1>
            <p className="lede" style={{ marginTop: 20 }}>
              Enter your challenge revenue, average challenge fee and payout ratio, and compare expected cost savings
              with what Platform costs. Prices come straight from the pricing page.
            </p>
            <div className="row" style={{ marginTop: 26 }}>
              <a className="btn solid" href="/demo">
                <span>Book a Demo</span>
              </a>
              <a className="btn ghost" href="/pricing">
                <span>Back to Pricing</span>
              </a>
            </div>
          </div>
        </section>
        <PlatformCalculator />
      </main>
      <HeroPixelBlast targetId={CONTENT_ID} />
      <FooterCtaAurora routeKey="calculator" />
    </>
  );
}
