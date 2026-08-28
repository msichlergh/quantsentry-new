"use client";

import {
  ChartLineUp,
  CheckCircle,
  CurrencyDollar,
  Megaphone,
  ShieldWarning,
  Sparkle,
  type Icon,
} from "@phosphor-icons/react";
import Image from "next/image";
import { useState } from "react";

import { HomeDataPattern } from "./HomeDataPattern";

type TeamInsight = {
  id: string;
  label: string;
  portrait?: string;
  icon: Icon;
  prompt: string;
  headline: string;
  summary: string;
  metrics: readonly {
    label: string;
    value: string;
    detail: string;
    tone?: "positive" | "negative";
  }[];
  evidence: string;
  action: string;
};

const teamInsights: readonly TeamInsight[] = [
  {
    id: "finance",
    label: "Finance",
    portrait: "/images/personas/finance.jpg",
    icon: CurrencyDollar,
    prompt: "Where did margin move, and what caused it?",
    headline: "Contribution margin improved despite higher acquisition cost.",
    summary: "Better payment completion and fewer avoidable refunds more than offset the increase in paid acquisition spend.",
    metrics: [
      { label: "Contribution margin", value: "+2.1 pts", detail: "week over week", tone: "positive" },
      { label: "Payment completion", value: "+4.8%", detail: "across 3 routes", tone: "positive" },
      { label: "Acquisition cost", value: "+8.6%", detail: "paid channels", tone: "negative" },
    ],
    evidence: "Revenue, payment, refund and campaign data reconciled across six sources.",
    action: "Review the two payment routes driving 71% of the improvement.",
  },
  {
    id: "growth",
    label: "Growth",
    portrait: "/images/personas/growth.jpg",
    icon: ChartLineUp,
    prompt: "Which channels are bringing us profitable customers?",
    headline: "Organic and referral traffic produced the strongest customer value.",
    summary: "Paid registrations increased, but organic and referral cohorts retained more revenue and generated fewer refunds after funding.",
    metrics: [
      { label: "Organic conversion", value: "+18.4%", detail: "month over month", tone: "positive" },
      { label: "Referral LTV", value: "+12.7%", detail: "vs portfolio average", tone: "positive" },
      { label: "Paid CAC", value: "+8.6%", detail: "needs attention", tone: "negative" },
    ],
    evidence: "Campaign, CRM, payment and customer activity joined at cohort level.",
    action: "Move 12% of underperforming paid spend into the referral programme.",
  },
  {
    id: "marketing",
    label: "Marketing",
    portrait: "/images/personas/marketing.jpg",
    icon: Megaphone,
    prompt: "Which campaigns are creating qualified demand?",
    headline: "Partner campaigns produced the strongest qualified pipeline.",
    summary: "Paid reach increased, but partner-led campaigns converted more qualified prospects at a lower cost per funded customer.",
    metrics: [
      { label: "Qualified pipeline", value: "+22.8%", detail: "month over month", tone: "positive" },
      { label: "Cost per lead", value: "−11.3%", detail: "partner campaigns", tone: "positive" },
      { label: "Paid conversion", value: "−6.4%", detail: "needs attention", tone: "negative" },
    ],
    evidence: "Campaign, CRM, payment and account-activation data joined at cohort level.",
    action: "Shift budget toward the two partner campaigns producing 61% of qualified pipeline.",
  },
  {
    id: "risk",
    label: "Risk",
    portrait: "/images/personas/risk.jpg",
    icon: ShieldWarning,
    prompt: "Where is coordinated abuse creating the most exposure?",
    headline: "One account cluster now represents 64% of open abuse exposure.",
    summary: "The cluster spans 17 accounts, three devices and two payout requests. Matching behaviour is visible across trading and identity data.",
    metrics: [
      { label: "Open exposure", value: "$18.4K", detail: "across 17 accounts", tone: "negative" },
      { label: "Matched trades", value: "142", detail: "97.4% similarity", tone: "negative" },
      { label: "Protected capital", value: "$9.7K", detail: "this week", tone: "positive" },
    ],
    evidence: "Trading, identity, device, session and payout evidence verified together.",
    action: "Review the cluster before either linked payout request clears.",
  },
];

export function TeamInsightsSection() {
  const [activeId, setActiveId] = useState(teamInsights[0].id);
  const active = teamInsights.find((team) => team.id === activeId) ?? teamInsights[0];

  return (
    <section className="team-insights-section home-data-section theme-light" aria-labelledby="team-insights-title">
      <HomeDataPattern />
      <div className="wrap">
        <div className="team-insights-heading">
          <div className="kicker team-insights-kicker"><span className="dot" /><span>Intelligence for Every Team</span></div>
          <h2 id="team-insights-title">One Data Layer. <span className="c">Answers for Every Team.</span></h2>
          <p className="lede">Finance, growth, marketing and risk ask different questions.<br /> Argus answers all of them from the same verified numbers.</p>
        </div>

        <div className="team-insights-stage">
          <div className="team-insights-prompts" aria-label="Choose a team perspective" role="tablist">
            {teamInsights.map(({ id, label, portrait, icon: TeamIcon, prompt }) => (
              <button
                aria-controls="team-insights-panel"
                aria-selected={active.id === id}
                className={`team-insights-prompt team-insights-prompt-${id}${active.id === id ? " is-active" : ""}`}
                key={id}
                onClick={() => setActiveId(id)}
                role="tab"
                type="button"
              >
                <span className={`team-insights-prompt-label${portrait ? " has-portrait" : ""}`}>
                  {portrait ? <Image alt="" aria-hidden="true" height={38} src={portrait} width={38} /> : null}
                  <i><TeamIcon size={16} weight="bold" /></i>
                  <strong>{label}</strong>
                </span>
                <span>{prompt}</span>
              </button>
            ))}
          </div>

          <div className="team-insights-window is-light" id="team-insights-panel" role="tabpanel">
            <div className="team-insights-windowbar">
              <span className="team-insights-agent"><i><Image alt="" aria-hidden="true" className="team-insights-brand-icon" height={24} src="/images/quantsentry-icon-teal-coil-v2.png" width={24} /></i><span><strong>Business Intelligence</strong><small>Shared operating view</small></span></span>
              <span className="team-insights-verified"><CheckCircle size={15} weight="fill" />Verified across 8 sources</span>
            </div>

            <div className="team-insights-windowbody" key={active.id}>
              <aside className="team-insights-dashboard-nav" aria-label="Dashboard sections">
                <small>Workspace</small>
                <span className="is-active"><ChartLineUp size={14} />Overview</span>
                <span><Sparkle size={14} />Insight</span>
                <span><CheckCircle size={14} />Sources</span>
              </aside>

              <div className="team-insights-dashboard-main">
                <div className="team-insights-dashboard-toolbar">
                  <span><b>{active.label} Dashboard</b><small>Live operating view</small></span>
                </div>

                <div className="team-insights-answer">
                  <span className="team-insights-answer-label"><ChartLineUp size={16} />Team insight</span>
                  <h3>{active.headline}</h3>
                  <p>{active.summary}</p>

                  <div className="team-insights-metrics">
                    {active.metrics.map((metric) => (
                      <div className={metric.tone === "negative" ? "is-negative" : "is-positive"} key={metric.label}>
                        <span>{metric.label}</span>
                        <strong className={metric.tone === "negative" ? "is-negative" : ""}>{metric.value}</strong>
                        <small>{metric.detail}</small>
                      </div>
                    ))}
                  </div>

                  <div className="team-insights-evidence">
                    <span><b>Evidence</b>{active.evidence}</span>
                    <span><b>Recommended action</b>{active.action}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
