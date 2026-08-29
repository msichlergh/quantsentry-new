"use client";

import { ArrowUpRight, MagnifyingGlass } from "@phosphor-icons/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const categories = [
  "All",
  "Trading Platforms",
  "Payments & Commerce",
  "Customer & Identity",
  "Acquisition",
  "Delivery",
] as const;

type Category = (typeof categories)[number];
type IntegrationCategory = Exclude<Category, "All">;

const integrations: ReadonlyArray<{
  name: string;
  description: string;
  category: IntegrationCategory;
  logo: string;
  logoFill?: boolean;
  logoScaleUp?: boolean;
  logoSoftFill?: boolean;
  logoTreatment?: "dark" | "wide";
  website: string;
}> = [
  { name: "MetaTrader 5", description: "Trades · Positions · Account Data", category: "Trading Platforms", logo: "/images/metatrader5-icon.png", logoFill: true, website: "https://www.metatrader5.com/" },
  { name: "MetaTrader 4", description: "Trades · Positions · Account Data", category: "Trading Platforms", logo: "/images/metatrader4-icon.png", logoFill: true, website: "https://www.metatrader4.com/" },
  { name: "cTrader", description: "Trades · Positions · Account Data", category: "Trading Platforms", logo: "/images/ctrader-official.png", website: "https://ctrader.com/" },
  { name: "DXtrade", description: "Trades · Positions · Account Data", category: "Trading Platforms", logo: "/images/dxtrade-icon.png", logoFill: true, website: "https://devexperts.com/" },
  { name: "TradeLocker", description: "Trades · Positions · Account Data", category: "Trading Platforms", logo: "/images/tradelocker-icon.png", logoTreatment: "dark", website: "https://tradelocker.com/" },
  { name: "Match-Trader", description: "Trades · Positions · Account Data", category: "Trading Platforms", logo: "/images/matchtrader-icon.png", website: "https://match-trader.com/" },
  { name: "ThinkTrader", description: "Trades · Positions · Account Data", category: "Trading Platforms", logo: "/images/thinktrader-icon.png", website: "https://www.thinkmarkets.com/" },
  { name: "Sirix", description: "Trades · Positions · Account Data", category: "Trading Platforms", logo: "/images/sirix-official.png", website: "https://leverate.com/" },
  { name: "Stripe", description: "Payments · Refunds · Transactions", category: "Payments & Commerce", logo: "/images/stripe.svg", website: "https://stripe.com/" },
  { name: "WooCommerce", description: "Orders · Refunds · Customer Data", category: "Payments & Commerce", logo: "/images/how-it-works/tools/woocommerce.webp", logoScaleUp: true, website: "https://woocommerce.com/" },
  { name: "Intercom", description: "Conversations · Tickets · Support", category: "Customer & Identity", logo: "/images/intercom.svg", logoFill: true, logoSoftFill: true, website: "https://www.intercom.com/" },
  { name: "Sumsub", description: "Identity · Verification · Risk Signals", category: "Customer & Identity", logo: "/images/sumsub.svg", website: "https://sumsub.com/" },
  { name: "Veriff", description: "Identity · Verification · Risk Signals", category: "Customer & Identity", logo: "/images/veriff.svg", website: "https://www.veriff.com/" },
  { name: "Google Ads", description: "Campaigns · Spend · Performance", category: "Acquisition", logo: "/images/google-ads.svg", website: "https://ads.google.com/" },
  { name: "Meta", description: "Campaigns · Spend · Performance", category: "Acquisition", logo: "/images/meta.svg", website: "https://www.facebook.com/business/" },
  { name: "Klaviyo", description: "Profiles · Campaigns · Revenue", category: "Acquisition", logo: "/images/klaviyo.png", logoFill: true, website: "https://www.klaviyo.com/" },
  { name: "Brevo", description: "Contacts · Campaigns · Engagement", category: "Acquisition", logo: "/images/brevo.png", logoFill: true, website: "https://www.brevo.com/" },
  { name: "ActiveCampaign", description: "Contacts · Automations · Campaigns", category: "Acquisition", logo: "/images/activecampaign.png", logoFill: true, website: "https://www.activecampaign.com/" },
  { name: "Slack", description: "Alerts · Answers · Scheduled Reports", category: "Delivery", logo: "/images/slack.png", logoFill: true, website: "https://slack.com/" },
  { name: "Gmail", description: "Alerts · Reports · Email Delivery", category: "Delivery", logo: "/images/gmail.svg", website: "https://workspace.google.com/products/gmail/" },
];

function categoryCount(category: Category) {
  return category === "All"
    ? integrations.length
    : integrations.filter((integration) => integration.category === category).length;
}

export function IntegrationsDirectory() {
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const filtersRef = useRef<HTMLDivElement>(null);
  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const visibleIntegrations = integrations.filter((integration) => {
    const matchesCategory = activeCategory === "All" || integration.category === activeCategory;
    const matchesSearch = normalizedSearchQuery.length === 0 || [integration.name, integration.description, integration.category]
      .some((value) => value.toLowerCase().includes(normalizedSearchQuery));

    return matchesCategory && matchesSearch;
  });

  useEffect(() => {
    const filters = filtersRef.current;
    const activeFilter = filters?.querySelector<HTMLElement>(".is-active");
    if (!filters || !activeFilter) return;

    const filtersRect = filters.getBoundingClientRect();
    const activeFilterRect = activeFilter.getBoundingClientRect();
    filters.scrollTo({
      behavior: "smooth",
      left: filters.scrollLeft + activeFilterRect.left - filtersRect.left - (filtersRect.width - activeFilterRect.width) / 2,
    });
  }, [activeCategory]);

  return (
    <section className="theme-light integrations-directory">
      <div className="wrap">
        <div className="integrations-directory-heading">
          <div className="kicker"><span className="dot" /><span>Every Integration</span></div>
          <h2>Find Your Platform.</h2>
          <p className="lede">Filter by category to see every active connection and where it fits in your operation.</p>
        </div>

        <div className="integrations-directory-layout">
          <aside className="integrations-filter" aria-label="Integration categories">
            <span className="integrations-filter-label">Categories</span>
            <div className="horizontal-control-shell">
              <div className="integrations-filter-list" ref={filtersRef}>
                {categories.map((category) => (
                  <button
                    aria-pressed={activeCategory === category}
                    className={activeCategory === category ? "is-active" : undefined}
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    type="button"
                  >
                    <span>{category}</span>
                    <small>{categoryCount(category)}</small>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <div className="integrations-results-column">
            <label className="integrations-search">
              <MagnifyingGlass aria-hidden="true" size={18} weight="regular" />
              <input
                aria-label="Search integrations"
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search integrations"
                type="search"
                value={searchQuery}
              />
            </label>

            <div className="integrations-results" aria-live="polite">
              {visibleIntegrations.map((integration) => (
                <article className="integration-directory-card" key={integration.name}>
                  <span className={`connector-logo-shell${integration.logoTreatment === "dark" ? " connector-logo-shell-dark" : ""}${integration.logoTreatment === "wide" ? " connector-logo-shell-wide" : ""}${integration.logoFill ? " connector-logo-shell-fill" : ""}${integration.logoSoftFill ? " connector-logo-shell-soft-fill" : ""}${integration.logoScaleUp ? " connector-logo-shell-scale-up" : ""}`}>
                    <Image alt={`${integration.name} logo`} height={48} src={integration.logo} width={76} />
                  </span>
                  <div className="integration-directory-card-copy">
                    <div className="integration-directory-card-heading">
                      <h3>{integration.name}</h3>
                      <span className="integration-card-category">{integration.category}</span>
                    </div>
                    <p><span>{integration.description}</span></p>
                    <a aria-label={`${integration.name} website`} className="integration-website-link" href={integration.website} rel="noreferrer" target="_blank">
                      <ArrowUpRight aria-hidden="true" size={12} weight="bold" />
                    </a>
                  </div>
                </article>
              ))}
              {visibleIntegrations.length === 0 && (
                <div className="integrations-empty">
                  <strong>No integrations found.</strong>
                  <p>Try another search or category.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
