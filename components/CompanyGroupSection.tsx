import { ArrowDown, CheckCircle } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";

import { BrandLockup } from "./BrandLockup";

const groupBenefits = [
  "Shared engineering and technology infrastructure",
  "Group-level governance and long-term product investment",
  "Aligned products across the modern trading ecosystem",
] as const;

export function CompanyGroupSection() {
  return (
    <section className="company-group-section theme-light" aria-labelledby="company-group-title">
      <div className="wrap company-group-layout">
        <div className="company-group-copy">
          <div className="kicker"><span className="dot" /><span>Part of Quant Technology Group</span></div>
          <h2 id="company-group-title">Built for the <span className="c">long term.</span></h2>
          <p>
            QuantSentry is part of Quant Technology Group, a technology group building infrastructure for modern trading businesses.
          </p>
          <p>
            The group provides shared governance, technical infrastructure and a long-term operating horizon, while QuantSentry remains focused on connected intelligence and risk.
          </p>
          <ul className="company-group-benefits">
            {groupBenefits.map((benefit) => (
              <li key={benefit}><CheckCircle aria-hidden="true" size={20} weight="fill" /><span>{benefit}</span></li>
            ))}
          </ul>
        </div>

        <div className="company-group-diagram" aria-label="QuantSentry is a product of Quant Technology Group">
          <a className="company-group-parent" href="https://quanttechnology.com" rel="noreferrer" target="_blank">
            <span>Technology Group</span>
            <Image
              alt="Quant Technology Group"
              height={100}
              src="/images/qtg-lockup-white.webp"
              width={384}
            />
          </a>
          <span className="company-group-connector" aria-hidden="true"><ArrowDown size={22} /></span>
          <div className="company-group-product">
            <span>Product</span>
            <a className="brand company-group-brand" href="/" aria-label="QuantSentry home"><BrandLockup /></a>
            <p>Connected intelligence for better decisions.</p>
            <div className="company-group-tags" aria-label="QuantSentry capabilities">
              <span>Platform</span><span>Intelligence</span><span>Services</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
