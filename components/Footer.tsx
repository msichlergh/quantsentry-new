import Image from "next/image";

import { Logo } from "./Logo";

const footerGroups = [
  {
    title: "Platform",
    links: [
      ["Platform overview", "/platform"],
      ["Seven detection engines", "/platform#engines"],
      ["Evidence kits", "/platform#evidence"],
      ["Argus AI", "/argus"],
      ["Custom business intelligence", "/custom-bi"],
      ["Connectors", "/platform#connect"],
    ],
  },
  {
    title: "Coming",
    links: [
      ["Risk Intelligence Network", "/network"],
      ["QuantSentry Futures", "/platform#futures"],
      ["Roadmap", "/platform#roadmap"],
    ],
  },
  {
    title: "Industries",
    links: [
      ["Prop Trading", "/industries-prop-trading"],
      ["Brokerages", "/industries-brokerages"],
      ["Funds and Asset Managers", "/industries-funds"],
      ["Payments and Fintech", "/industries-payments"],
      ["All industries", "/industries"],
    ],
  },
  {
    title: "Company",
    links: [
      ["How the market compares", "/compare"],
      ["Blind spot finder", "/diagnostic"],
      ["Managed Desk", "/managed-desk"],
      ["About", "/company"],
      ["Proof", "/proof"],
      ["Insights", "/insights"],
      ["Pricing", "/pricing"],
      ["Book a Demo", "/demo"],
    ],
  },
] as const;

export function Footer() {
  return (
    <footer>
      <div className="wrap">
        <div className="fcols">
          <div>
            <a className="brand" href="/" aria-label="QuantSentry home">
              <Logo compact />
              QuantSentry
            </a>
            <p className="footer-summary">
              Network based AI risk and business intelligence for prop firms.
            </p>
            <a
              aria-label="QuantSentry is part of Quant Technology Group"
              className="footer-group-badge"
              href="https://quanttechnology.com"
              rel="noreferrer"
              target="_blank"
            >
              <span>Part of</span>
              <Image
                alt="Quant Technology Group"
                height={30}
                src="/images/qtg-lockup-white.webp"
                width={113}
              />
            </a>
          </div>

          {footerGroups.map((group) => (
            <div key={group.title}>
              <h4>{group.title}</h4>
              <ul>
                {group.links.map(([label, href]) => (
                  <li key={href + label}>
                    <a href={href}>{label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="legal">
          <span>© 2026 QuantSentry, Quant Technology Group. All rights reserved.</span>
          <span>Never moves money, closes an account or clears a payout.</span>
        </div>
      </div>
    </footer>
  );
}
