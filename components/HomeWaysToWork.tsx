"use client";

import {
  ArrowCounterClockwise,
  ArrowRight,
  ChartBar,
  Clock,
  CurrencyDollar,
  Export,
  FileText,
  Lightning,
  MagnifyingGlass,
  Monitor,
  PaperPlaneTilt,
  PresentationChart,
  TrendUp,
  Warning,
} from "@phosphor-icons/react";
import Image from "next/image";
import { useState } from "react";
import { ThinkingOrb } from "thinking-orbs";

import { HomeDataPattern } from "./HomeDataPattern";

const proactiveFeatures = [
  { icon: Clock, label: "Scheduled Briefings" },
  { icon: Warning, label: "Risk Abuse Detection" },
  { icon: FileText, label: "Board-Ready Reports" },
  { icon: PresentationChart, label: "Recurring KPI Summaries" },
] as const;

const explorationFeatures = [
  { icon: MagnifyingGlass, label: "Natural language questions" },
  { icon: ChartBar, label: "Instant visualisations" },
  { icon: ArrowRight, label: "Follow-up drill-downs" },
  { icon: Export, label: "Share and export findings" },
] as const;

const tasks = [
  { name: "Weekly Performance Brief", schedule: "Every Monday at 07:00", icon: Clock, channels: ["slack", "gmail"] },
  { name: "Risk Abuse Report", schedule: "Daily at 06:00", icon: Warning, channels: ["slack"] },
  { name: "Acquisition Efficiency", schedule: "Every Friday at 16:00", icon: PresentationChart, channels: ["gmail"] },
  { name: "Competitor Intelligence Report", schedule: "Every Monday at 08:00", icon: FileText, channels: ["slack", "gmail"] },
] as const;

function DeliveryChannels({ channels }: { channels: readonly ("slack" | "gmail")[] }) {
  return (
    <span className="home-work-channels" aria-label={`Delivered to ${channels.join(" and ")}`}>
      {channels.map((channel) => (
        <span className={`home-work-channel home-work-channel-${channel}`} key={channel} title={channel === "slack" ? "Slack" : "Gmail"}>
          <Image
            alt=""
            aria-hidden="true"
            height={14}
            src={channel === "slack" ? "/images/slack.png" : "/images/gmail.svg"}
            width={14}
          />
          <span>{channel === "slack" ? "Slack" : "Gmail"}</span>
        </span>
      ))}
    </span>
  );
}

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
          <div className="kicker home-work-modes-kicker"><span className="dot" /><span>How You Work With Argus</span></div>
          <h2 id="home-work-modes-title">
            Work on Schedule.
            <span className="c"> Explore on Demand.</span>
          </h2>
          <p className="lede">
            Schedule recurring work or ask Argus questions in real time.
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

        <div className="home-work-content-card">
          <div className="home-work-content" id="home-work-panel" key={mode} role="tabpanel">
            <div className="home-work-copy">
              <div className="home-work-title-row">
                <span className="home-work-title-icon" aria-hidden="true">
                  <ThinkingOrb state={proactive ? "breathing" : "searching"} size={64} theme="dark" />
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
                <div className="home-work-task-list">
                  {tasks.map((task) => {
                    const Icon = task.icon;

                    return (
                      <div className="home-work-task-row" key={task.name}>
                        <span className="home-work-task-icon"><Icon aria-hidden="true" size={17} /></span>
                        <span>
                          <strong>{task.name}</strong>
                          <small><Clock aria-hidden="true" size={13} />{task.schedule}</small>
                        </span>
                        <span className="home-work-task-meta">
                          <DeliveryChannels channels={task.channels} />
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="home-work-demo home-work-chat-demo">
                <div className="home-work-question">
                  <p>What drove last week&apos;s revenue growth?</p>
                  <span aria-label="You"><Image alt="User" height={34} src="/images/personas/marketing.jpg" width={34} /></span>
                </div>
                <div className="home-work-answer">
                  <span className="home-work-answer-orb" aria-label="Argus"><ThinkingOrb state="searching" size={20} theme="dark" /></span>
                  <div>
                    <strong>3 Drivers Behind Last Week&apos;s Revenue Growth:</strong>
                    <dl>
                      <div><dt><TrendUp aria-hidden="true" size={17} />25K Campaign Conversion</dt><dd>+1.8 pts <small>48%</small></dd></div>
                      <div><dt><CurrencyDollar aria-hidden="true" size={17} />Acquisition Efficiency</dt><dd>+12.4% <small>33%</small></dd></div>
                      <div><dt><ArrowCounterClockwise aria-hidden="true" size={17} />Repeat Purchases</dt><dd>+9.6% <small>19%</small></dd></div>
                    </dl>
                  </div>
                </div>
                <div className="home-work-chat-actions">
                  <button type="button"><MagnifyingGlass size={14} /> Review campaign</button>
                  <button type="button"><ChartBar size={14} /> Show trend</button>
                  <button type="button"><PaperPlaneTilt size={14} /> Create monitoring task</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
