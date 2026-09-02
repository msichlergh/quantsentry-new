import {
  ArrowRight,
  ChartLineDown,
  IdentificationCard,
  ShieldCheck,
  Target,
  TrendUp,
} from "@phosphor-icons/react/dist/ssr";
import type { CSSProperties } from "react";

import { HomeDataPattern } from "./HomeDataPattern";

const missions = [
  {
    description: "Grow revenue by 5%.",
    goal: "Revenue Growth",
    icon: TrendUp,
    period: "MoM",
    progress: "64%",
    target: "+5%",
  },
  {
    description: "Reduce payout fraud by 20%.",
    goal: "Payout Fraud Detection",
    icon: ShieldCheck,
    period: "Monthly",
    progress: "64%",
    target: "−20%",
  },
  {
    description: "Reduce acquisition costs by 12%.",
    goal: "Acquisition Cost Reduction",
    icon: ChartLineDown,
    period: "MoM",
    progress: "62%",
    target: "−12%",
  },
  {
    description: "Meet 100% of the KYC SLA.",
    goal: "KYC SLA",
    icon: IdentificationCard,
    period: "Rolling 30 Days",
    progress: "96.4%",
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
            <div className="kicker"><span className="dot" /><span>Goal-Based AI Tasks</span></div>
            <h2 id="home-argus-missions-title">
              Give Argus a Goal. <span className="c">Track the Result.</span>
            </h2>
            <p>
              Set a clear business goal for revenue, risk, compliance or operations. Argus monitors progress and reports what changes.
            </p>
            <div className="home-argus-missions-actions">
              <a className="btn solid" href="/argus"><span>Explore Argus AI</span><ArrowRight size={15} /></a>
              <a className="btn ghost" href="/platform">View Platform</a>
            </div>
          </div>

          <div className="home-argus-mission-grid">
            {missions.map(({ description, goal, icon: Icon, period, progress, target }) => (
              <article className="home-argus-mission-card" key={goal}>
                <div className="home-argus-mission-body">
                  <div className="home-argus-mission-head">
                    <span className="home-argus-mission-icon" aria-hidden="true"><Icon size={16} /></span>
                    <span className="home-argus-mission-type">Mission Goal</span>
                    <span className="home-argus-mission-period">{period}</span>
                  </div>
                  <h3>{goal}</h3>
                  <p>{description}</p>
                  <div className="home-argus-mission-progress">
                    <div className="home-argus-mission-progress-labels">
                      <span><small>Progress</small><strong>{progress}</strong></span>
                      <span className="home-argus-mission-goal"><Target size={12} weight="bold" /><small>Target</small><strong>{target}</strong></span>
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
