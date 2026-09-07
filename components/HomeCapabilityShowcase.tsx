import { ArrowRightIcon as ArrowRight } from "@phosphor-icons/react/dist/ssr/ArrowRight";
import Image from "next/image";
import Link from "next/link";

import { HomeDataPattern } from "./HomeDataPattern";

type Capability = {
  id: string;
  label: string;
  description: string;
  href: string;
  imageAlt: string;
  imageSrc: string;
};

const capabilities: readonly Capability[] = [
  {
    id: "connectivity",
    label: "Data Connectivity",
    description: "Connect supported trading, payment, identity, CRM and operations data in one place.",
    href: "/platform#sources",
    imageAlt: "Connected business data flowing into one shared view",
    imageSrc: "/images/capabilities/data-connectivity.jpg",
  },
  {
    id: "argus",
    label: "Argus AI",
    description: "Ask questions, investigate changes and schedule ongoing work using trusted company data.",
    href: "/argus",
    imageAlt: "Layered Argus AI analysis and verified insight cards",
    imageSrc: "/images/capabilities/argus-ai.jpg",
  },
  {
    id: "business",
    label: "Business Intelligence",
    description: "See revenue, acquisition and operational performance from the same verified numbers.",
    href: "/custom-bi",
    imageAlt: "Floating business performance cards with positive trend charts",
    imageSrc: "/images/capabilities/business-intelligence.jpg",
  },
  {
    id: "industry",
    label: "Industry Intelligence",
    description: "Track competitor rules, pricing and market changes with their sources attached.",
    href: "/industry-intelligence",
    imageAlt: "Competitor monitoring cards, comparison timeline and verified sources",
    imageSrc: "/images/capabilities/industry-intelligence.jpg",
  },
  {
    id: "abuse",
    label: "Trading Abuse Detection",
    description: "Detect coordinated trading, account sharing and payout fraud before losses are approved.",
    href: "/industries-prop-trading",
    imageAlt: "Trading abuse alert with linked accounts and protected payout signals",
    imageSrc: "/images/capabilities/trading-abuse-detection.jpg",
  },
  {
    id: "network",
    label: "Sentry Risk Network",
    description: "Share opt-in risk signals across firms without exchanging customer data.",
    href: "/network",
    imageAlt: "Firms checking shared risk signals without sharing customer data",
    imageSrc: "/images/capabilities/sentry-risk-network.jpg",
  },
];

export function HomeCapabilityShowcase({ sectionId = "capabilities" }: { sectionId?: string }) {
  return (
    <section className="home-capabilities home-data-section theme-light" id={sectionId}>
      <HomeDataPattern />
      <div className="wrap">
        <div className="home-capabilities-heading">
          <div>
            <div className="kicker"><span className="dot" /><span>Platform Capabilities</span></div>
            <h2>One Platform.<br /><span className="c">Clear Answers Across Your Business.</span></h2>
          </div>
          <p className="lede">
            Connect your data, understand what changed and decide what to do next.
          </p>
        </div>

        <div className="home-capability-explorer">
          <div className="home-capability-directory">
            <div className="home-capability-directory-grid">
              {capabilities.map(({ description, href, id, imageAlt, imageSrc, label }) => (
                <article className="home-capability-card" id={`capability-${id}`} key={id}>
                  <div className="home-capability-card-copy">
                    <h3>{label}</h3>
                    <p>{description}</p>
                    <Link className="home-capability-card-link" href={href}>Explore {label} <ArrowRight size={14} /></Link>
                  </div>

                  <div className="home-capability-card-preview">
                    <Image alt={imageAlt} fill sizes="(max-width: 420px) 90vw, (max-width: 1040px) 42vw, 24vw" src={imageSrc} />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
