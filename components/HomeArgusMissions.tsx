import {
  ArrowRight,
  Target,
} from "@phosphor-icons/react/dist/ssr";
import type { CSSProperties } from "react";

import { HomeDataPattern } from "./HomeDataPattern";

const missions = [
  {
    current: "+3.2%",
    description: "Grow revenue by 5%.",
    goal: "Revenue Growth",
    period: "MoM",
    progress: "64%",
    target: "+5%",
  },
  {
    current: "−12.8%",
    description: "Reduce payout fraud by 20%.",
    goal: "Payout Fraud Detection",
    period: "Monthly",
    progress: "64%",
    target: "−20%",
  },
  {
    current: "−18%",
    description: "Reduce coordinated abuse by 30%.",
    goal: "Coordinated Abuse Reduction",
    period: "QoQ",
    progress: "60%",
    target: "−30%",
  },
  {
    current: "−7.4%",
    description: "Reduce acquisition costs by 12%.",
    goal: "Acquisition Cost Reduction",
    period: "MoM",
    progress: "62%",
    target: "−12%",
  },
  {
    current: "96.4%",
    description: "Meet 100% of the KYC SLA.",
    goal: "KYC SLA",
    period: "Rolling 30 Days",
    progress: "96.4%",
    target: "100%",
  },
  {
    current: "82%",
    description: "Cover 100% of priority markets.",
    goal: "Priority Market Coverage",
    period: "Quarterly",
    progress: "82%",
    target: "100%",
  },
] as const;

export function HomeArgusMissions() {
  return (
    <section className="home-argus-missions home-data-section" aria-labelledby="home-argus-missions-title">
      <HomeDataPattern tone="dark" />
      <div className="wrap">
        <div className="home-argus-missions-layout">
          <div className="home-argus-missions-copy">
            <div className="kicker"><span className="dot" /><span>Purpose-Built AI Missions</span></div>
            <h2 id="home-argus-missions-title">
              One Mission for <span className="c">Each Outcome You Need.</span>
            </h2>
            <p>
              Each Mission is configured around one business outcome across revenue, risk, fraud, compliance,
              operations or market intelligence. It applies your metrics and thresholds continuously.
            </p>
            <div className="home-argus-missions-actions">
              <a className="btn solid" href="/argus"><span>Explore Argus AI</span><ArrowRight size={15} /></a>
              <a className="btn ghost" href="/platform">View Platform</a>
            </div>
          </div>

          <div className="home-argus-mission-grid">
            {missions.map(({ current, description, goal, period, progress, target }) => (
              <article className="home-argus-mission-card" key={goal}>
                <div className="home-argus-mission-body">
                  <div className="home-argus-mission-head"><h3>{goal}</h3><span>{period}</span></div>
                  <p>{description}</p>
                  <div className="home-argus-mission-progress">
                    <div className="home-argus-mission-progress-labels">
                      <span><small>Now</small><strong>{current}</strong></span>
                      <span className="home-argus-mission-goal"><Target size={12} weight="bold" /><small>Goal</small><strong>{target}</strong></span>
                    </div>
                    <span
                      aria-label={`${progress} of the goal reached`}
                      className="home-argus-mission-progress-track"
                      role="img"
                      style={{ "--mission-progress": progress } as CSSProperties}
                    ><i /></span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
