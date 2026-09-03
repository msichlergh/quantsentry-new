"use client";

import { ArrowRightIcon as ArrowRight } from "@phosphor-icons/react/dist/csr/ArrowRight";
import { CrosshairIcon as Crosshair } from "@phosphor-icons/react/dist/csr/Crosshair";
import { DatabaseIcon as Database } from "@phosphor-icons/react/dist/csr/Database";
import { FileTextIcon as FileText } from "@phosphor-icons/react/dist/csr/FileText";
import { LightbulbIcon as Lightbulb } from "@phosphor-icons/react/dist/csr/Lightbulb";
import { SquaresFourIcon as SquaresFour } from "@phosphor-icons/react/dist/csr/SquaresFour";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ThinkingOrb, type OrbState } from "thinking-orbs";

import { HomeDataPattern } from "./HomeDataPattern";

const modes = [
  { id: "insight", label: "Insight", icon: Lightbulb, output: "Clear Answers", description: "Explains what changed and why" },
  { id: "task", label: "Task", icon: Crosshair, output: "Argus Tasks", description: "Checks your data on schedule" },
  { id: "report", label: "Report", icon: FileText, output: "Finished Reports", description: "Ready to review and share" },
  { id: "view", label: "View", icon: SquaresFour, output: "Custom Dashboards", description: "Built around your business" },
] as const;

const modeActivity: { state: OrbState; status: string }[] = [
  { state: "searching", status: "Analyzing" },
  { state: "working", status: "Monitoring" },
  { state: "composing", status: "Composing" },
  { state: "shaping", status: "Building" },
];

const industries = [
  {
    id: "prop-trading",
    label: "Prop Trading",
    sources: [
      {
        icon: Database,
        title: "Trading & Payments",
        tags: [
          { label: "MT4", logo: "/images/metatrader4-icon.png" },
          { label: "MT5", logo: "/images/metatrader5-icon.png" },
          { label: "DXtrade", logo: "/images/dxtrade-icon.png" },
          { label: "Stripe", logo: "/images/stripe.svg" },
        ],
      },
      {
        icon: FileText,
        title: "Customer & Identity",
        tags: [
          { label: "Intercom", logo: "/images/intercom.svg" },
          { label: "Sumsub", logo: "/images/sumsub.svg" },
          { label: "Veriff", logo: "/images/veriff.svg" },
        ],
      },
    ],
    queries: [
      "What changed in challenge conversion and payout risk this week?",
      "Every morning: review payout requests, investigate anomalies, and alert the risk team.",
      "Create a board-ready weekly performance and risk report with recommended actions.",
      "Build a live operating view for revenue, payouts, risk, and trader behaviour.",
    ],
  },
  {
    id: "brokerages",
    label: "Brokerages",
    sources: [
      {
        icon: Database,
        title: "Trading & CRM",
        tags: [
          { label: "DXtrade", logo: "/images/dxtrade-icon.png" },
          { label: "MatchTrader", logo: "/images/matchtrader-icon.png" },
          { label: "Intercom", logo: "/images/intercom.svg" },
        ],
      },
      {
        icon: FileText,
        title: "Growth & Identity",
        tags: [
          { label: "Google Ads", logo: "/images/google-ads.svg" },
          { label: "Meta", logo: "/images/meta.svg" },
          { label: "Sumsub", logo: "/images/sumsub.svg" },
        ],
      },
    ],
    queries: [
      "Why did funded-account activity and net deposits change this month?",
      "Monitor client activity, exposure, and acquisition efficiency every day.",
      "Generate the monthly brokerage performance pack with risk and margin drivers.",
      "Build a single view for client growth, trading activity, and operational risk.",
    ],
  },
  {
    id: "payments",
    label: "Payments",
    sources: [
      {
        icon: Database,
        title: "Payments & Customer",
        tags: [
          { label: "Stripe", logo: "/images/stripe.svg" },
          { label: "Intercom", logo: "/images/intercom.svg" },
          { label: "Veriff", logo: "/images/veriff.svg" },
        ],
      },
      {
        icon: FileText,
        title: "Growth & Compliance",
        tags: [
          { label: "Google Ads", logo: "/images/google-ads.svg" },
          { label: "Meta", logo: "/images/meta.svg" },
          { label: "Sumsub", logo: "/images/sumsub.svg" },
        ],
      },
    ],
    queries: [
      "Which payment routes are driving the increase in failures and refunds?",
      "Continuously monitor payment anomalies, customer risk, and margin leakage.",
      "Prepare a weekly payments briefing with failure drivers and recovery actions.",
      "Build a live view of payment performance, fraud risk, and customer impact.",
    ],
  },
  {
    id: "funds",
    label: "Funds",
    sources: [
      {
        icon: Database,
        title: "Trading & Operations",
        tags: [
          { label: "MT4", logo: "/images/metatrader4-icon.png" },
          { label: "ThinkTrader", logo: "/images/thinktrader-icon.png" },
          { label: "Sirix", logo: "/images/sirix-official.png" },
        ],
      },
      {
        icon: FileText,
        title: "Investor & Compliance",
        tags: [
          { label: "Intercom", logo: "/images/intercom.svg" },
          { label: "Sumsub", logo: "/images/sumsub.svg" },
          { label: "Veriff", logo: "/images/veriff.svg" },
        ],
      },
    ],
    queries: [
      "What drove this week’s change in portfolio risk and operational performance?",
      "Monitor exposure, concentration, and operational exceptions throughout the day.",
      "Generate the investor performance briefing with risk and attribution analysis.",
      "Build a portfolio operating view with exposure, performance, and compliance data.",
    ],
  },
] as const;

export function HomeAlwaysOnIntelligence() {
  const [activeIndustry, setActiveIndustry] = useState(0);
  const [activeMode, setActiveMode] = useState(0);
  const [typedQuery, setTypedQuery] = useState("");
  const [typing, setTyping] = useState(true);
  const userControlled = useRef(false);

  useEffect(() => {
    const query = industries[activeIndustry].queries[activeMode];
    let character = 0;

    const typeTimer = window.setInterval(() => {
      character += 1;
      setTypedQuery(query.slice(0, character));
      if (character >= query.length) {
        window.clearInterval(typeTimer);
        setTyping(false);
      }
    }, 24);

    return () => window.clearInterval(typeTimer);
  }, [activeIndustry, activeMode]);

  useEffect(() => {
    const cycleTimer = window.setInterval(() => {
      if (userControlled.current) return;
      setTypedQuery("");
      setTyping(true);
      setActiveMode((currentMode) => {
        if (currentMode === modes.length - 1) {
          setActiveIndustry((currentIndustry) => (currentIndustry + 1) % industries.length);
          return 0;
        }
        return currentMode + 1;
      });
    }, 6200);

    return () => window.clearInterval(cycleTimer);
  }, []);

  const selectMode = (index: number) => {
    if (index === activeMode) return;
    userControlled.current = true;
    setTypedQuery("");
    setTyping(true);
    setActiveMode(index);
  };

  const selectIndustry = (index: number) => {
    if (index === activeIndustry) return;
    userControlled.current = true;
    setTypedQuery("");
    setTyping(true);
    setActiveIndustry(index);
    setActiveMode(0);
  };

  const industry = industries[activeIndustry];

  return (
    <section className="home-always-on home-data-section dots" aria-labelledby="home-always-on-title">
      <HomeDataPattern tone="dark" />
      <div className="wrap">
        <div className="home-always-on-heading">
          <div className="kicker home-always-on-kicker"><span className="dot" /><span>Always-on Intelligence</span></div>
          <h2 id="home-always-on-title">Your Data Never Stops. <span className="c">Neither Does Argus.</span></h2>
          <p className="lede">
            Argus checks your connected data, explains important changes and delivers scheduled work automatically.
          </p>
          <div className="home-always-on-actions">
            <a className="btn solid" href="/demo"><span>See It in Action</span><ArrowRight size={15} /></a>
            <a className="btn ghost" href="/argus">Explore Argus</a>
          </div>
        </div>

        <div className="home-always-diagram">
          <svg className="home-always-connectors" viewBox="0 0 1200 350" preserveAspectRatio="none" aria-hidden="true">
            <path d="M226 112 C252 112 252 147 278 147" />
            <path d="M226 276 C252 276 252 147 278 147" />
            <path d="M920 147 C946 147 946 64 972 64" />
            <path d="M920 147 C946 147 946 134 972 134" />
            <path d="M920 147 C946 147 946 203 972 203" />
            <path d="M920 147 C946 147 946 272 972 272" />
          </svg>

          <div className="home-always-source-column">
            <span className="home-always-column-label">Connected Data</span>
            {industry.sources.map(({ icon: Icon, tags, title }) => (
              <article className="home-always-source-card" key={title}>
                <div className="home-always-source-title"><span><Icon size={15} /></span><strong>{title}</strong></div>
                <div className="home-always-source-tags">
                  {tags.map((tag) => (
                    <span key={tag.label}>
                      <Image src={tag.logo} width={16} height={16} alt="" />
                      {tag.label}
                    </span>
                  ))}
                  <span className="home-always-more">+</span>
                </div>
              </article>
            ))}
          </div>

          <div className="home-always-composer">
            <div className="home-always-input">
              <div className="home-always-query" aria-live="polite">
                <div className="home-always-agent" aria-hidden="true">
                  <span className="home-always-agent-orb">
                    <ThinkingOrb state={modeActivity[activeMode].state} size={20} theme="light" />
                  </span>
                  <strong>Argus AI</strong>
                  <span className="home-always-agent-status"><i />{modeActivity[activeMode].status}</span>
                </div>
                <p>{typedQuery}<i className={typing ? "is-visible" : ""} aria-hidden="true" /></p>
              </div>
              <div className="home-always-input-bar">
                <div className="home-always-modes" role="tablist" aria-label="Argus output type">
                  {modes.map(({ icon: Icon, id, label }, index) => (
                    <button
                      aria-selected={activeMode === index}
                      className={activeMode === index ? "is-active" : ""}
                      key={id}
                      onClick={() => selectMode(index)}
                      role="tab"
                      type="button"
                    >
                      <Icon size={13} />{label}
                    </button>
                  ))}
                </div>
                <a href="/argus">Send <ArrowRight size={13} /></a>
              </div>
            </div>
            <div className="home-always-industries" role="tablist" aria-label="Industry example">
              {industries.map(({ id, label }, index) => (
                <button
                  aria-selected={activeIndustry === index}
                  className={activeIndustry === index ? "is-active" : ""}
                  key={id}
                  onClick={() => selectIndustry(index)}
                  role="tab"
                  type="button"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="home-always-output-column">
            <span className="home-always-column-label">Outputs</span>
            {modes.map(({ description, icon: Icon, id, output }, index) => (
              <button
                aria-pressed={activeMode === index}
                className={activeMode === index ? "is-active" : ""}
                key={id}
                onClick={() => selectMode(index)}
                type="button"
              >
                <span><Icon size={17} /></span>
                <span><strong>{output}</strong><small>{description}</small></span>
                <i aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
