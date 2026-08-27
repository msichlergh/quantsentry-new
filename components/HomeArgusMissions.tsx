import {
  ArrowRight,
  ChartLineUp,
  FileText,
  IdentificationCard,
  ShareNetwork,
  ShieldWarning,
  Target,
} from "@phosphor-icons/react/dist/ssr";

import { HomeDataPattern } from "./HomeDataPattern";

const missions = [
  {
    description: "Watches revenue streams and surfaces unexpected changes before close.",
    icon: ChartLineUp,
    name: "Revenue Anomaly Monitor",
    status: "Running",
    tone: "positive",
  },
  {
    description: "Detects and prioritises high-risk payout requests for review.",
    icon: ShieldWarning,
    name: "Payout Risk Investigator",
    status: "Running",
    tone: "positive",
  },
  {
    description: "Finds coordinated abuse across identities, devices and transactions.",
    icon: ShareNetwork,
    name: "Fraud Network Watch",
    status: "4 networks open",
    tone: "warning",
  },
  {
    description: "Tracks channel cost, conversion and contribution margin together.",
    icon: Target,
    name: "Acquisition Efficiency",
    status: "Running",
    tone: "positive",
  },
  {
    description: "Monitors KYC and compliance thresholds and flags exceptions.",
    icon: IdentificationCard,
    name: "Compliance Monitor",
    status: "All clear",
    tone: "positive",
  },
  {
    description: "Researches competitor conditions and reports when material rules or pricing change.",
    icon: FileText,
    name: "Competitive Intelligence Monitor",
    status: "Next scan Monday",
    tone: "neutral",
  },
] as const;

export function HomeArgusMissions() {
  return (
    <section className="home-argus-missions home-data-section" aria-labelledby="home-argus-missions-title">
      <HomeDataPattern tone="dark" />
      <div className="wrap">
        <div className="home-argus-missions-layout">
          <div className="home-argus-missions-copy">
            <div className="kicker"><span className="dot" /><span>Specialized AI missions</span></div>
            <h2 id="home-argus-missions-title">
              An Argus Mission for <span className="c">Every Outcome You Define.</span>
            </h2>
            <p>
              Configure recurring intelligence for revenue, risk, fraud, compliance, operations and market changes.
              Every mission works from your metrics, thresholds and preferred outputs.
            </p>
            <div className="home-argus-missions-actions">
              <a className="btn solid" href="/argus"><span>Explore Argus AI</span><ArrowRight size={15} /></a>
              <a className="btn ghost" href="/platform">View Platform</a>
            </div>
          </div>

          <div className="home-argus-mission-grid">
            {missions.map(({ description, icon: Icon, name, status, tone }) => (
              <article className="home-argus-mission-card" key={name}>
                <span className="home-argus-mission-icon" aria-hidden="true"><Icon size={20} /></span>
                <div>
                  <h3>{name}</h3>
                  <p>{description}</p>
                  <span className={`home-argus-mission-status${tone ? ` is-${tone}` : ""}`}><i />{status}</span>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="home-argus-missions-cta footer-cta-aurora-target">
          <div><strong>See how Argus works for your business</strong><span>Explore a workflow built around your data and priorities.</span></div>
          <a href="/demo">Book a Demo <ArrowRight size={15} /></a>
        </div>
      </div>
    </section>
  );
}
