"use client";

import {
  ChartLineUp,
  CheckSquare,
  Database,
  Gauge,
  ShareNetwork,
  Sparkle,
  SquaresFour,
  Warning,
} from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

import { HomeDataPattern } from "./HomeDataPattern";

const capabilities = [
  { id: "data", label: "Data Intelligence", description: "Connect and govern every source." },
  { id: "risk", label: "Risk Management", description: "Find issues before they become losses." },
  { id: "business", label: "Business Intelligence", description: "See performance and opportunity clearly." },
  { id: "network", label: "Network Intelligence", description: "Expose hidden relationships and abuse." },
  { id: "benchmarks", label: "Industry Benchmarks", description: "Know where performance stands." },
  { id: "argus", label: "Argus AI", description: "Investigate, report and assign work." },
  { id: "desk", label: "Managed Desk", description: "Add an analyst to daily operations." },
] as const;

type CapabilityId = (typeof capabilities)[number]["id"];

function SimpleMetricCard({
  detail,
  icon,
  label,
  tone,
  value,
}: {
  detail: string;
  icon: ReactNode;
  label: string;
  tone?: "positive" | "warning";
  value: string;
}) {
  return (
    <div className={`home-capability-simple-card${tone ? ` is-${tone}` : ""}`}>
      <span className="home-capability-simple-icon">{icon}</span>
      <span className="home-capability-simple-copy">
        <small>{label}</small>
        <strong>{value}</strong>
        <em>{detail}</em>
      </span>
    </div>
  );
}

export function HomeCapabilityShowcase() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Record<CapabilityId, HTMLElement | null>>({
    data: null,
    risk: null,
    business: null,
    network: null,
    benchmarks: null,
    argus: null,
    desk: null,
  });
  const [active, setActive] = useState<CapabilityId>("data");
  const activeLabel = capabilities.find((capability) => capability.id === active)?.label;

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    scroller.scrollTop = 0;
  }, []);

  const getSectionTop = (scroller: HTMLDivElement, section: HTMLElement) =>
    section.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop;

  const selectCapability = (id: CapabilityId) => {
    const scroller = scrollerRef.current;
    const target = sectionRefs.current[id];

    if (!scroller || !target) return;
    setActive(id);
    scroller.scrollTo({ top: Math.max(0, getSectionTop(scroller, target) - 18), behavior: "auto" });
  };

  const syncActiveCapability = () => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const marker = scroller.scrollTop + scroller.clientHeight * 0.28;
    let next: CapabilityId = "data";

    for (const capability of capabilities) {
      const section = sectionRefs.current[capability.id];
      if (section && getSectionTop(scroller, section) <= marker) next = capability.id;
    }

    setActive(next);
  };

  return (
    <section className="home-capabilities home-data-section theme-light" id="capabilities">
      <HomeDataPattern />
      <div className="wrap">
        <div className="home-capabilities-heading">
          <div>
            <div className="kicker"><span className="dot" /><span>Platform capabilities</span></div>
            <h2>One platform.<br /><span className="c">Every operating question.</span></h2>
          </div>
          <p className="lede">
            Explore how QuantSentry turns connected company data into clearer decisions,
            stronger controls and profitable action.
          </p>
        </div>

        <div className="home-capability-explorer">
          <nav className="home-capability-index" aria-label="QuantSentry capabilities">
            {capabilities.map((capability) => (
              <button
                className={active === capability.id ? "is-active" : ""}
                aria-current={active === capability.id ? "true" : undefined}
                key={capability.id}
                onClick={() => selectCapability(capability.id)}
                type="button"
              >
                <span>{capability.label}</span>
                <small>{capability.description}</small>
              </button>
            ))}
          </nav>

          <div className="home-capability-window" data-active-capability={active}>
            <div className="home-capability-windowbar">
              <span className="home-capability-windowmark"><SquaresFour size={16} /> QuantSentry</span>
              <span className="home-capability-active-label" key={active}>{activeLabel}</span>
              <span className="home-capability-live"><i />Live</span>
            </div>
            <div className="home-capability-app">
              <div className="home-capability-scroll" onScroll={syncActiveCapability} ref={scrollerRef}>
                <article
                  className={`home-capability-panel${active === "data" ? " is-active" : ""}`}
                  ref={(element) => { sectionRefs.current.data = element; }}
                >
                  <div className="home-capability-panel-head">
                    <div><span>Data Intelligence</span><h3>Bring every source into one governed layer.</h3></div>
                    <span className="home-capability-state"><i />7 sources live</span>
                  </div>
                  <p>Ingest trading, payments, customer, identity, marketing and operational data without forcing teams into another disconnected tool.</p>
                  <div className="home-capability-simple-grid">
                    <SimpleMetricCard detail="All governed and live" icon={<Database size={19} />} label="Sources connected" value="7" />
                    <SimpleMetricCard detail="+18% this month" icon={<ChartLineUp size={19} />} label="Events processed" tone="positive" value="24.8M" />
                  </div>
                </article>

                <article
                  className={`home-capability-panel${active === "risk" ? " is-active" : ""}`}
                  ref={(element) => { sectionRefs.current.risk = element; }}
                >
                  <div className="home-capability-panel-head">
                    <div><span>Risk Management</span><h3>Prioritise the issues that need a decision.</h3></div>
                    <span className="home-capability-state home-capability-state-warning">3 require review</span>
                  </div>
                  <p>Continuous monitoring surfaces anomalies, payout risk and coordinated behaviour while keeping final decisions with your team.</p>
                  <div className="home-capability-simple-grid">
                    <SimpleMetricCard detail="3 require review" icon={<Warning size={19} />} label="Open alerts" tone="warning" value="7" />
                    <SimpleMetricCard detail="This quarter" icon={<CheckSquare size={19} />} label="Capital protected" tone="positive" value="$60.8K" />
                  </div>
                </article>

                <article
                  className={`home-capability-panel${active === "business" ? " is-active" : ""}`}
                  ref={(element) => { sectionRefs.current.business = element; }}
                >
                  <div className="home-capability-panel-head">
                    <div><span>Business Intelligence</span><h3>Build the operating view around your business.</h3></div>
                    <span className="home-capability-state"><i />Updated live</span>
                  </div>
                  <p>Combine risk, revenue, acquisition and operational metrics into custom views that reveal what changed and where margin can improve.</p>
                  <div className="home-capability-simple-grid">
                    <SimpleMetricCard detail="+19.4% vs prior period" icon={<ChartLineUp size={19} />} label="Net revenue" tone="positive" value="$126.1K" />
                    <SimpleMetricCard detail="+1.2 percentage points" icon={<Gauge size={19} />} label="Conversion" tone="positive" value="8.7%" />
                  </div>
                </article>

                <article
                  className={`home-capability-panel${active === "network" ? " is-active" : ""}`}
                  ref={(element) => { sectionRefs.current.network = element; }}
                >
                  <div className="home-capability-panel-head">
                    <div><span>Network Intelligence</span><h3>See the relationships isolated systems miss.</h3></div>
                    <span className="home-capability-state home-capability-state-warning">4 networks open</span>
                  </div>
                  <p>Resolve accounts, identities, devices and transactions into a shared network that reveals coordinated fraud across organisations.</p>
                  <div className="home-capability-simple-grid">
                    <SimpleMetricCard detail="Across 4 open networks" icon={<ShareNetwork size={19} />} label="Linked accounts" value="53" />
                    <SimpleMetricCard detail="Prioritised for review" icon={<Gauge size={19} />} label="Highest risk score" tone="warning" value="941" />
                  </div>
                </article>

                <article
                  className={`home-capability-panel${active === "benchmarks" ? " is-active" : ""}`}
                  ref={(element) => { sectionRefs.current.benchmarks = element; }}
                >
                  <div className="home-capability-panel-head">
                    <div><span>Industry Benchmarks</span><h3>Know what good performance looks like.</h3></div>
                    <span className="home-capability-state"><i />Cohort current</span>
                  </div>
                  <p>Compare the metrics that matter against a relevant peer cohort without exposing customer-level information.</p>
                  <div className="home-capability-simple-grid">
                    <SimpleMetricCard detail="Peer median 2.6%" icon={<Gauge size={19} />} label="Payout loss rate" tone="positive" value="1.8%" />
                    <SimpleMetricCard detail="Peer median 11.2h" icon={<CheckSquare size={19} />} label="Review resolution" tone="positive" value="6.4h" />
                  </div>
                </article>

                <article
                  className={`home-capability-panel${active === "argus" ? " is-active" : ""}`}
                  ref={(element) => { sectionRefs.current.argus = element; }}
                >
                  <div className="home-capability-panel-head">
                    <div><span>Argus AI</span><h3>Ask, investigate and assign the next action.</h3></div>
                    <span className="home-capability-state"><i />Analyzing</span>
                  </div>
                  <p>Argus works from verified company data, explains what changed and can take on recurring monitoring, analysis and reporting tasks.</p>
                  <div className="home-capability-chat">
                    <div className="is-user">What changed in performance this week?</div>
                    <div className="is-argus"><Sparkle size={16} weight="fill" /><span><b>Revenue improved 12%, but one acquisition channel is now below target.</b><small>I found a 19% increase in cost per qualified customer since Monday. I can monitor it daily and alert you if it moves another 5%.</small></span></div>
                    <div className="home-capability-chat-actions"><button type="button">Create monitoring task</button><button type="button">Show the evidence</button></div>
                  </div>
                </article>

                <article
                  className={`home-capability-panel${active === "desk" ? " is-active" : ""}`}
                  ref={(element) => { sectionRefs.current.desk = element; }}
                >
                  <div className="home-capability-panel-head">
                    <div><span>Managed Desk</span><h3>Add an analyst without giving up control.</h3></div>
                    <span className="home-capability-state"><i />Desk online</span>
                  </div>
                  <p>A dedicated analyst works your queue in QuantSentry, prepares the evidence and gives your team a clear recommendation.</p>
                  <div className="home-capability-simple-grid">
                    <SimpleMetricCard detail="3 recommendations ready" icon={<CheckSquare size={19} />} label="Cases prioritised" tone="positive" value="7" />
                    <SimpleMetricCard detail="4 escalated for review" icon={<Database size={19} />} label="Payouts reviewed" value="21" />
                  </div>
                </article>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
