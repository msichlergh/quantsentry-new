"use client";

import { CheckCircle, CaretDown } from "@phosphor-icons/react";
import { useCallback, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

const vendors = ["QuantSentry", "Axcera RiskGuard", "Centroid PropShield", "PropForge"] as const;

const capabilities = [
  ["How detection works", "Behavioural distance across roughly 130 variables per trade, scored 0 to 1000", "Described as an adaptive risk engine with behavioural intelligence. Method not published", "Machine learning over shared signals from member firms", "Rules with statistical thresholds, stated plainly by the vendor"],
  ["Rings found as groups", "Yes. Accounts are clustered into the operator behind them", "Copy trading and reverse hedging patterns detected. Group level output not published", "Cross firm hedging, copy trading and multi account abuse", "Copy correlation and hedge timing at account level"],
  ["Works across platforms", "Supported platforms connected in read-only mode", "Eleven platforms listed, including MT4, MT5, cTrader, DXtrade and Match-Trader", "Sits inside a broker infrastructure suite", "Platform coverage varies by deployment"],
  ["Links separate registrations", "Device, payment method, session and behaviour", "Matching IPs and account cloning, plus a bad actor database", "Device fingerprints, behavioural patterns and P&L deltas", "KYC duplication, IP and device matching"],
  ["Written evidence for a dispute", "Evidence kit cited to the firm's own Terms of Service", "Not published", "Not published", "Alert feed, account context and audit log"],
  ["Catches it before the payout", "Scored as the trade lands, actionable in the challenge phase", "Real time detection and alerts", "Contributed and queried continuously", "Real time rule enforcement"],
  ["Signal between firms", "Optional, private and live", "Shared database of 10,000 plus bad actor records", "Shared intelligence layer across member firms", "None published"],
  ["Business intelligence on the same data", "Revenue, products, payouts and orders beside each risk finding", "Dashboards inside the CRM, including pass rates and revenue to payout", "Exposure and P&L analysis across the broker suite", "Not published"],
  ["Managed analyst service", "Named analyst embedded with your team", "Not published", "Not published", "Not published"],
  ["Pricing you can read", "Pricing model published, figures on a call", "Demo gated, no published pricing", "Not published", "Not published"],
] as const;

// The host never moves once the page is committed, so there is nothing to
// subscribe to; the store exists purely to keep the DOM read out of render.
const subscribeToNothing = () => () => undefined;
const readServerTarget = () => null;

function evidenceType(vendorIndex: number, capability: string, value: string) {
  if (vendorIndex === 1 && capability === "Pricing you can read") return "Independent";
  if (/not published|none published|varies by deployment/i.test(value)) return "Not published";
  return "Vendor claim";
}

export function MobileComparison({ targetId }: { targetId: string }) {
  const [vendorIndex, setVendorIndex] = useState(0);
  // The portal host is part of the HTML SitePage injects, so it does not exist
  // during the server render. Reading it through the store directly — rather
  // than through a separate boolean "mounted" flag — means the client snapshot
  // IS the element, so hydration resolves the host in the same pass instead of
  // depending on a second render to go looking for it.
  const readTarget = useCallback(() => document.getElementById(targetId), [targetId]);
  const target = useSyncExternalStore(subscribeToNothing, readTarget, readServerTarget);

  if (!target) return null;

  return createPortal(
    <div className="mobile-comparison" aria-label="Mobile vendor comparison">
      <label className="mobile-comparison-select">
        <span>Compare capabilities for</span>
        <span className="mobile-comparison-select-control">
          <select value={vendorIndex} onChange={(event) => setVendorIndex(Number(event.target.value))}>
            {vendors.map((name, index) => <option key={name} value={index}>{name}</option>)}
          </select>
          <CaretDown aria-hidden="true" size={15} weight="bold" />
        </span>
      </label>

      <div className="mobile-comparison-cards" aria-live="polite">
        {capabilities.map(([capability, ...values]) => {
          const value = values[vendorIndex];
          const evidence = evidenceType(vendorIndex, capability, value);

          return (
            <article className={vendorIndex === 0 ? "is-quantsentry" : undefined} key={capability}>
              <div className="mobile-comparison-card-heading">
                <span>{capability}</span>
                {vendorIndex === 0 ? <CheckCircle aria-label="QuantSentry" size={16} weight="fill" /> : null}
              </div>
              <p>{value}</p>
              <small data-evidence={evidence}>{evidence}</small>
            </article>
          );
        })}
      </div>
    </div>,
    target,
  );
}
