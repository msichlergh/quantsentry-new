"use client";

import {
  ArrowRight,
  ChartBar,
  Clock,
  Export,
  FileText,
  Lightning,
  MagnifyingGlass,
  Monitor,
  PaperPlaneTilt,
  Play,
  PresentationChart,
  Warning,
} from "@phosphor-icons/react";
import { useState } from "react";
import { ThinkingOrb } from "thinking-orbs";

import { HomeDataPattern } from "./HomeDataPattern";

const proactiveFeatures = [
  { icon: Clock, label: "Scheduled briefings" },
  { icon: Warning, label: "Automatic anomaly detection" },
  { icon: FileText, label: "Board-ready reports" },
  { icon: PresentationChart, label: "Recurring KPI summaries" },
] as const;

const explorationFeatures = [
  { icon: MagnifyingGlass, label: "Natural language questions" },
  { icon: ChartBar, label: "Instant visualisations" },
  { icon: ArrowRight, label: "Follow-up drill-downs" },
  { icon: Export, label: "Share and export findings" },
] as const;

const tasks = [
  { name: "Weekly Performance Brief", schedule: "Every Monday at 07:00", status: "Last run: 2h ago", warning: false },
  { name: "Payout Risk Monitor", schedule: "Daily at 06:00", status: "3 alerts this week", warning: true },
  { name: "Acquisition Efficiency", schedule: "Every Friday at 16:00", status: "Next run: Tomorrow", warning: false },
] as const;

type Mode = "proactive" | "exploration";

export function HomeWaysToWork() {
  const [mode, setMode] = useState<Mode>("proactive");
  const proactive = mode === "proactive";
  const features = proactive ? proactiveFeatures : explorationFeatures;

  return (
    <section className="home-work-modes home-data-section theme-light" aria-labelledby="home-work-modes-title">
      <HomeDataPattern />
      <div className="wrap">
        <div className="home-work-modes-heading">
          <div className="kicker home-work-modes-kicker"><span className="dot" /><span>Two ways to work</span></div>
          <h2 id="home-work-modes-title">
            Intelligence on Schedule.
            <span className="c"> Answers on Demand.</span>
          </h2>
          <p className="lede">
            Schedule recurring intelligence or ask Argus whenever you need an answer.
          </p>
        </div>

        <div className="home-work-tabs" role="tablist" aria-label="Argus ways of working">
          <button
            aria-controls="home-work-panel"
            aria-selected={proactive}
            className={proactive ? "is-active" : ""}
            onClick={() => setMode("proactive")}
            role="tab"
            type="button"
          >
            <Lightning size={18} /> Proactive Tasks
          </button>
          <button
            aria-controls="home-work-panel"
            aria-selected={!proactive}
            className={!proactive ? "is-active" : ""}
            onClick={() => setMode("exploration")}
            role="tab"
            type="button"
          >
            <Monitor size={18} /> Exploration Mode
          </button>
        </div>

        <div className="home-work-content" id="home-work-panel" key={mode} role="tabpanel">
          <div className="home-work-copy">
            <div className="home-work-title-row">
              <span className="home-work-title-icon" aria-hidden="true">
                <ThinkingOrb state={proactive ? "working" : "searching"} size={64} theme="dark" />
              </span>
              <div>
                <span>{proactive ? "Set the task. Argus delivers." : "Ask in the moment. Explore further."}</span>
                <h3>{proactive ? "Argus Tasks" : "Ask Anything, Anytime"}</h3>
              </div>
            </div>
            <p>
              {proactive
                ? "Define the task once. Argus monitors connected data, investigates changes and delivers finished work on your schedule."
                : "Ask a question in natural language and get an immediate answer with evidence, visualisations and the ability to drill deeper."}
            </p>
            <div className="home-work-feature-grid">
              {features.map(({ icon: Icon, label }) => (
                <div className="home-work-feature" key={label}><Icon size={17} /><span>{label}</span></div>
              ))}
            </div>
            <a className="home-work-text-link" href="/argus">
              {proactive ? "Create your first Argus task" : "Explore with Argus"} <ArrowRight size={16} />
            </a>
          </div>

          {proactive ? (
            <div className="home-work-demo home-work-task-demo">
              <div className="home-work-demo-head">
                <span>Argus Tasks</span><b>3 Active</b>
              </div>
              <div className="home-work-task-list">
                {tasks.map((task) => (
                  <div className="home-work-task-row" key={task.name}>
                    <span className="home-work-task-play"><Play size={14} weight="fill" /></span>
                    <span><strong>{task.name}</strong><small>{task.schedule}</small></span>
                    <em className={task.warning ? "is-warning" : ""}>{task.status}</em>
                  </div>
                ))}
              </div>
              <div className="home-work-delivery">
                <span><Lightning size={15} /> Latest delivery</span>
                <strong>Performance briefing sent to leadership</strong>
                <small>12 insights · 3 recommendations · PDF + Email</small>
              </div>
            </div>
          ) : (
            <div className="home-work-demo home-work-chat-demo">
              <div className="home-work-question"><span>You</span><p>Why did conversion drop last week?</p></div>
              <div className="home-work-answer">
                <span>AI</span>
                <div>
                  <strong>3 drivers identified for the conversion decline:</strong>
                  <dl>
                    <div><dt>25K campaign conversion</dt><dd>−1.4 pts <small>52%</small></dd></div>
                    <div><dt>Acquisition cost increase</dt><dd>+18.2% <small>31%</small></dd></div>
                    <div><dt>Refund requests</dt><dd>+11.8% <small>17%</small></dd></div>
                  </dl>
                </div>
              </div>
              <div className="home-work-chat-actions">
                <button type="button">Review campaign</button>
                <button type="button">Show trend</button>
                <button type="button"><PaperPlaneTilt size={14} /> Create monitoring task</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
