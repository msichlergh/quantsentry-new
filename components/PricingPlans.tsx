"use client";

import { ArrowRight, CaretDown, Check, ShareNetwork, SquaresFour, UsersThree, type Icon } from "@phosphor-icons/react";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";

import {
  BASE_CREDITS,
  CREDITS_PER_BLOCK,
  INCLUDED,
  NETWORK_PRICE,
  STEPS,
  billedPrice,
  blocksFor,
  count,
  euros,
  platformPrice,
} from "@/lib/pricing";

const stepLabel = (step: number) => (step === STEPS[STEPS.length - 1] ? `${count(step)}+` : `Up to ${count(step)}`);

type Tier = {
  key: string;
  name: string;
  icon: Icon;
  // The plan this one builds on, shown with that plan's icon above the bullets.
  includes?: { name: string; icon: Icon };
  sub: string;
  price: number | null;
  priceNote: string;
  cta: string;
  featured?: boolean;
  bullets: string[];
  foot?: string;
};

const BAND_ROWS = [
  ["First 250", "Included", "—"],
  ["251 – 1,000", "€250", "€1.00"],
  ["1,001 – 2,500", "€175", "€0.70"],
  ["2,501 – 5,000", "€125", "€0.50"],
  ["5,001 – 10,000", "€100", "€0.40"],
  ["10,001 +", "€75", "€0.30"],
] as const;

const FAQS = [
  [
    "Can I take the network on its own?",
    "Yes, that is Network. €750 a month at any size. You screen against what other firms have seen and contribute your own signals back.",
  ],
  [
    "What happens when I grow mid-month?",
    "The next block of 250 is added at the rate for that band. Nothing about your existing accounts reprices.",
  ],
  ["Do we have to share customer data?", "No. The network exchanges risk signals, not customer records."],
  [
    "More than 20,000 accounts?",
    "Talk to us. Above that size we quote directly and the per-account rate keeps falling.",
  ],
] as const;

// Listbox in place of a native <select>, so the open list matches the site
// instead of the OS menu. Each option shows the Platform price it lands on.
function AccountsPicker({
  value,
  onChange,
  priceFor,
}: {
  value: number;
  onChange: (next: number) => void;
  priceFor: (accounts: number) => number;
}) {
  const id = useId();
  const labelId = `${id}-label`;
  const buttonId = `${id}-button`;
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(() => STEPS.indexOf(value));
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // A press anywhere outside the picker closes it.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  useEffect(() => {
    if (open) listRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (open) listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  const show = () => {
    setActive(STEPS.indexOf(value));
    setOpen(true);
  };
  const close = () => {
    setOpen(false);
    buttonRef.current?.focus();
  };
  const choose = (index: number) => {
    onChange(STEPS[index]);
    close();
  };

  // Enter and Space reach the button as a click; only the arrows need handling.
  const onButtonKeyDown = (event: KeyboardEvent) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      show();
    }
  };

  const onListKeyDown = (event: KeyboardEvent) => {
    const last = STEPS.length - 1;
    const moves: Record<string, number> = {
      ArrowDown: Math.min(last, active + 1),
      ArrowUp: Math.max(0, active - 1),
      PageDown: Math.min(last, active + 5),
      PageUp: Math.max(0, active - 5),
      Home: 0,
      End: last,
    };
    if (event.key in moves) {
      event.preventDefault();
      setActive(moves[event.key]);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      choose(active);
    } else if (event.key === "Escape") {
      event.preventDefault();
      close();
    } else if (event.key === "Tab") {
      setOpen(false);
    }
  };

  return (
    <div className="pricing-accounts" ref={rootRef}>
      <span className="pricing-accounts-label" id={labelId}>
        Active accounts per month
      </span>
      <button
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-labelledby={`${labelId} ${buttonId}`}
        className="pricing-picker"
        id={buttonId}
        onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={onButtonKeyDown}
        ref={buttonRef}
        type="button"
      >
        <span>{stepLabel(value)}</span>
        <CaretDown aria-hidden="true" size={14} weight="bold" />
      </button>
      {open ? (
        <ul
          aria-activedescendant={`${id}-option-${active}`}
          aria-labelledby={labelId}
          className="pricing-picker-list"
          onKeyDown={onListKeyDown}
          ref={listRef}
          role="listbox"
          tabIndex={-1}
        >
          {STEPS.map((step, index) => (
            <li
              aria-selected={step === value}
              className={index === active ? "is-active" : undefined}
              data-index={index}
              id={`${id}-option-${index}`}
              key={step}
              onClick={() => choose(index)}
              onMouseMove={() => setActive(index)}
              role="option"
            >
              <span>{stepLabel(step)}</span>
              <span className="pricing-picker-price">{euros.format(priceFor(step))}/mo</span>
              <span className="pricing-picker-check">
                {step === value ? <Check aria-hidden="true" size={14} weight="bold" /> : null}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function PricingPlans() {
  const [accounts, setAccounts] = useState(INCLUDED);
  const [annual, setAnnual] = useState(true);

  const blocks = blocksFor(accounts);
  const platform = platformPrice(accounts);
  const credits = BASE_CREDITS + blocks * CREDITS_PER_BLOCK;
  const billed = (monthly: number) => billedPrice(monthly, annual);

  const tiers: Tier[] = [
    {
      key: "network",
      name: "Network",
      icon: ShareNetwork,
      sub: "Screening Across Firms",
      price: billed(NETWORK_PRICE),
      priceNote: "Flat. Same price at 200 accounts or 20,000.",
      cta: "Join the Network",
      // One line each, named like the Platform list.
      bullets: [
        "Funding and Payout Screening",
        "Cross-Firm Risk Alerts",
        "Contribute Your Own Signals",
        "Identity and Payment Connectors",
      ],
      foot: "No detection engine on your own trading data.",
    },
    {
      key: "platform",
      name: "Platform",
      icon: SquaresFour,
      includes: { name: "Network", icon: ShareNetwork },
      sub: "Detection on Your Own Data",
      price: billed(platform),
      priceNote: `Includes ${count(accounts)} active accounts and ${count(credits)} AI credits.`,
      cta: "Get Started",
      featured: true,
      // Capability names only; the Platform Capabilities section below explains each one.
      bullets: [
        "Trading Abuse Detection",
        "Business Intelligence",
        "Argus AI",
        "Industry Intelligence",
        "Data Connectivity",
      ],
    },
    {
      key: "desk",
      name: "Desk",
      icon: UsersThree,
      includes: { name: "Platform", icon: SquaresFour },
      sub: "Run by Our Analysts",
      price: null,
      priceNote: "From €1,500/mo on top of Platform, quoted on your revenue and payout ratio.",
      cta: "Talk to Us",
      bullets: [
        "Analyst Case and Payout Review",
        "Rules Tuned to Your Book",
        "Custom Dashboards and Reporting",
        "Monthly Business and Risk Review",
        "Incident Response",
      ],
    },
  ];

  return (
    <section className="theme-light pricing-plans" id="plans" aria-labelledby="pricing-plans-title">
      <div className="wrap">
        <div className="pricing-plans-head">
          <div>
            <div className="kicker"><span className="dot" /><span>Plans</span></div>
            <h2 id="pricing-plans-title">Simple pricing.<br /><span className="c">Built to pay for itself.</span></h2>
          </div>
          <div className="pricing-billing" role="group" aria-label="Billing period">
            <button aria-pressed={!annual} className={annual ? undefined : "is-on"} onClick={() => setAnnual(false)} type="button">
              Monthly
            </button>
            <button aria-pressed={annual} className={annual ? "is-on" : undefined} onClick={() => setAnnual(true)} type="button">
              Annual <span className="pricing-billing-save">Save 20%</span>
            </button>
          </div>
        </div>

        <div className="grid g3 pricing-tiers">
          {tiers.map((tier) => (
            <article
              aria-labelledby={`pricing-tier-${tier.key}`}
              className={`panel pricing-tier${tier.featured ? " cy is-featured" : ""}`}
              key={tier.key}
            >
              <div>
                <div className="pricing-tier-head">
                  <span className="pricing-tier-icon" aria-hidden="true">
                    <tier.icon size={21} />
                  </span>
                  <div className="pricing-tier-title">
                    <h3 id={`pricing-tier-${tier.key}`}>{tier.name}</h3>
                    <span className="eyebrow pricing-tier-sub">{tier.sub}</span>
                  </div>
                </div>

                {/* Price, account picker and what the price covers, boxed together. */}
                <div className={`pricing-box${tier.featured ? " is-featured" : ""}`}>
                  <div className="pricing-price" aria-live={tier.featured ? "polite" : undefined}>
                    {tier.price === null ? (
                      <span className="stat">Custom</span>
                    ) : (
                      <>
                        <span className="stat">{euros.format(tier.price)}</span>
                        <span className="pricing-per">/mo</span>
                      </>
                    )}
                  </div>
                  {tier.price !== null && annual ? (
                    <p className="pricing-billed">Billed annually · {euros.format(tier.price * 12)} a year</p>
                  ) : null}

                  {/* The account picker only exists where the price actually varies. */}
                  {tier.featured ? (
                    <AccountsPicker
                      onChange={setAccounts}
                      priceFor={(step) => billed(platformPrice(step))}
                      value={accounts}
                    />
                  ) : null}
                  <p className="pricing-note">{tier.priceNote}</p>
                  {tier.featured ? (
                    <a className="pricing-calc-link" href="/pricing/calculator">
                      Prop Firm Savings Calculator <ArrowRight aria-hidden="true" size={13} weight="bold" />
                    </a>
                  ) : null}
                </div>

                <a className="btn solid pricing-cta" href="/demo">
                  <span>{tier.cta}</span>
                </a>

                <ul className="pricing-bullets">
                  {tier.includes ? (
                    <li className="pricing-includes">
                      <tier.includes.icon aria-hidden="true" size={16} />
                      <span>Everything in {tier.includes.name}</span>
                    </li>
                  ) : null}
                  {tier.bullets.map((bullet) => (
                    <li key={bullet}>
                      <Check aria-hidden="true" size={15} weight="bold" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
                {tier.foot ? <p className="pricing-foot">{tier.foot}</p> : null}
              </div>
            </article>
          ))}
        </div>

        <div className="panel pricing-explainer-panel">
          <div>
            <details className="pricing-explainer">
              <summary>
                <span>What counts as an active account, and how the price scales</span>
              </summary>
              <div className="pricing-explainer-body">
                <p>
                  An account is active in a month if it is funded and places at least one trade. Dormant accounts cost you
                  nothing.
                </p>
                <p>
                  Platform starts at €1,500 with the first 250 active accounts included. Above that you pay per block of
                  250, and the blocks get cheaper as you grow. Blocks are cumulative, so crossing a threshold reprices only
                  the next block, never your whole account base. Annual billing takes 20% off.
                </p>
                <table className="pricing-bands">
                  <thead>
                    <tr>
                      <th scope="col">Active accounts</th>
                      <th scope="col">Per 250</th>
                      <th scope="col">Per account</th>
                    </tr>
                  </thead>
                  <tbody>
                    {BAND_ROWS.map(([range, block, perAccount]) => (
                      <tr key={range}>
                        <th scope="row">{range}</th>
                        <td>{block}</td>
                        <td>{perAccount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p>
                  Each block adds 500 AI credits for Argus and case work, on top of the 1,500 included at base. Extra
                  credits are €25 per 1,000 if you ever need them.
                </p>
              </div>
            </details>
          </div>
        </div>
      </div>
    </section>
  );
}

export function PricingFaq() {
  return (
    <section className="theme-light pricing-faq" aria-labelledby="pricing-faq-title">
      <div className="wrap">
        <div className="kicker"><span className="dot" /><span>Questions</span></div>
        <h2 id="pricing-faq-title">Questions we<br /><span className="c">get asked.</span></h2>
        <div className="grid g2 pricing-faq-grid">
          {FAQS.map(([question, answer]) => (
            <div className="panel" key={question}>
              <div>
                <h3>{question}</h3>
                <p>{answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
