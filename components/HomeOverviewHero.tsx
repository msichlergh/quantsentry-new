"use client";

import {
  ArrowUp,
  ChartLineUp,
  ChatCircleDots,
  CheckSquare,
  Database,
  CreditCard,
  FileText,
  Gauge,
  Layout,
  Microphone,
  ShareNetwork,
  Sparkle,
  SquaresFour,
  Waveform,
  Warning,
} from "@phosphor-icons/react";
import type { CSSProperties, FormEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { ThinkingOrb, type OrbState } from "thinking-orbs";

import { Logo } from "./Logo";

type DockMetric = {
  element: HTMLElement;
  x: number;
  y: number;
  scale: number;
};

const clamp = (value: number) => Math.min(1, Math.max(0, value));
const ease = (value: number) => value * value * (3 - 2 * value);
const argusOrbStates: OrbState[] = ["breathing", "searching", "connecting", "composing", "solving"];
const argusStatusLabels: Record<OrbState, string> = {
  breathing: "Thinking",
  searching: "Analyzing",
  solving: "Solving",
  listening: "Listening",
  connecting: "Connecting",
  weaving: "Weaving insights",
  composing: "Composing",
  shaping: "Structuring",
  working: "Working",
};

export function HomeOverviewHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const [argusMode, setArgusMode] = useState<"chat" | "voice">("chat");
  const [argusOrbState, setArgusOrbState] = useState<OrbState>(argusOrbStates[0]);
  const [argusPrompt, setArgusPrompt] = useState("");
  const [argusQuestion, setArgusQuestion] = useState("Where are we losing margin this week?");

  const openArgus = (mode: "chat" | "voice") => {
    const section = sectionRef.current;
    if (!section) return;

    setArgusMode(mode);
    setArgusOrbState(mode === "voice" ? "listening" : "working");
    const rect = section.getBoundingClientRect();
    const travel = Math.max(1, section.offsetHeight - window.innerHeight);
    window.scrollTo({
      top: window.scrollY + rect.top + travel * 0.82,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  };

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let index = 0;
    const interval = window.setInterval(() => {
      index = (index + 1) % argusOrbStates.length;
      setArgusOrbState(argusOrbStates[index]);
    }, 4200);

    return () => window.clearInterval(interval);
  }, []);

  const activeArgusOrbState: OrbState = argusMode === "voice" ? "listening" : argusOrbState;

  const submitArgusPrompt = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const question = argusPrompt.trim();
    if (question) setArgusQuestion(question);
    openArgus("chat");
  };

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let metrics: DockMetric[] = [];
    let animationFrame = 0;

    const setStage = (progress: number) => {
      const converge = ease(clamp((progress - 0.1) / 0.32));
      const dashboard = ease(clamp((progress - 0.3) / 0.14));
      const ai = ease(clamp((progress - 0.7) / 0.2));
      const copyFade = ease(clamp((progress - 0.08) / 0.22));

      section.style.setProperty("--home-progress", progress.toFixed(4));
      section.style.setProperty("--home-converge", converge.toFixed(4));
      section.style.setProperty("--home-dashboard", dashboard.toFixed(4));
      section.style.setProperty("--home-ai", ai.toFixed(4));
      section.style.setProperty("--home-copy-fade", copyFade.toFixed(4));

      metrics.forEach(({ element, x, y, scale }) => {
        element.style.setProperty("--home-card-x", `${x * converge}px`);
        element.style.setProperty("--home-card-y", `${y * converge}px`);
        element.style.setProperty("--home-card-scale", `${1 + (scale - 1) * converge}`);
      });

      section.dataset.storyStage = ai > 0.5 ? "ai" : dashboard > 0.5 ? "dashboard" : "signals";
    };

    const update = () => {
      animationFrame = 0;
      if (window.innerWidth <= 900 || reducedMotion.matches) {
        setStage(0);
        return;
      }

      const rect = section.getBoundingClientRect();
      const travel = Math.max(1, section.offsetHeight - window.innerHeight);
      setStage(clamp(-rect.top / travel));
    };

    const queueUpdate = () => {
      if (!animationFrame) animationFrame = window.requestAnimationFrame(update);
    };

    const measure = () => {
      if (window.innerWidth <= 900 || reducedMotion.matches) {
        metrics = [];
        setStage(0);
        return;
      }

      setStage(0);
      const sourceCards = Array.from(section.querySelectorAll<HTMLElement>("[data-home-card]")).map((element) => ({
        element,
        sourceRect: element.getBoundingClientRect(),
      }));

      section.style.setProperty("--home-converge", "1");
      section.style.setProperty("--home-dashboard", "1");
      metrics = sourceCards.flatMap(({ element, sourceRect }) => {
        const key = element.dataset.homeCard;
        const target = key
          ? section.querySelector<HTMLElement>(`[data-home-target="${key}"]`)
          : null;
        if (!target) return [];

        const targetRect = target.getBoundingClientRect();
        const scale = Math.min(targetRect.width / sourceRect.width, targetRect.height / sourceRect.height);
        const x = targetRect.left + (targetRect.width - sourceRect.width * scale) / 2 - sourceRect.left;
        const y = targetRect.top + (targetRect.height - sourceRect.height * scale) / 2 - sourceRect.top;

        return [{ element, x, y, scale }];
      });
      update();
    };

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(section);
    window.addEventListener("scroll", queueUpdate, { passive: true });
    window.addEventListener("resize", measure);
    reducedMotion.addEventListener("change", measure);
    measure();

    return () => {
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      window.removeEventListener("scroll", queueUpdate);
      window.removeEventListener("resize", measure);
      reducedMotion.removeEventListener("change", measure);
    };
  }, []);

  return (
    <section ref={sectionRef} className="hero dots home-overview-hero" data-story-stage="signals">
      <div className="home-scroll-stage" data-hero-visual-root>
        <div className="wrap home-overview-wrap">
          <div className="home-hero-copy">
            <div className="kicker home-hero-kicker">
              <span className="dot" />
              <span>
                Data Intelligence for{" "}
                <em
                  className="type home-hero-industry"
                  data-type='["Prop Trading","Brokerages","Funds","Payments"]'
                >
                  Prop Trading
                </em>
              </span>
            </div>
            <h1>
              <span className="home-hero-question">From Disconnected Data</span>
              <br />
              <em className="c home-hero-answer">To Profitable Action.</em>
            </h1>
            <p className="lede">
              Unify your data, turn it into intelligence tailored to your business, and let Argus AI uncover risks,
              identify opportunities, and take action.
            </p>
            <div className="row home-hero-actions">
              <a className="btn solid" href="/demo">
                <span>Book a Demo</span>
              </a>
              <a className="btn ghost" href="/platform">
                <span>Explore the Platform</span>
              </a>
            </div>
          </div>

          <article className="home-signal-card home-signal-risk" data-home-card="risk" aria-label="Open risk signals">
            <div className="home-signal-card-head">
              <span>Live Risk</span>
              <span className="home-signal-status"><i />Updated now</span>
            </div>
            <div className="home-signal-value">7</div>
            <p>rings open across 62 linked accounts</p>
            <div className="home-risk-bars" aria-hidden="true">
              <i style={{ "--signal-size": "94%" } as CSSProperties} />
              <i style={{ "--signal-size": "78%" } as CSSProperties} />
              <i style={{ "--signal-size": "58%" } as CSSProperties} />
            </div>
          </article>

          <article className="home-signal-card home-signal-revenue" data-home-card="revenue" aria-label="Revenue signal">
            <div className="home-signal-card-head">
              <span>Net Revenue</span>
              <span>90D</span>
            </div>
            <div className="home-signal-value">$126.1K</div>
            <p className="home-signal-positive">↑ 19.4% against the last period</p>
            <svg className="home-mini-chart" viewBox="0 0 220 66" preserveAspectRatio="none" aria-hidden="true">
              <path className="home-mini-chart-area" d="M2 57 C28 52 38 47 57 49 C78 51 86 37 107 39 C132 41 137 29 159 30 C180 31 192 18 218 8 L218 66 L2 66 Z" />
              <path className="home-mini-chart-line" d="M2 57 C28 52 38 47 57 49 C78 51 86 37 107 39 C132 41 137 29 159 30 C180 31 192 18 218 8" />
            </svg>
          </article>

          <article className="home-signal-card home-signal-payouts" data-home-card="payouts" aria-label="Review signal">
            <div className="home-signal-card-head">
              <span>Value Under Review</span>
              <span className="home-signal-warning">Review</span>
            </div>
            <div className="home-signal-value">$19.26K</div>
            <p>6 cases, evidence attached</p>
            <div className="home-signal-people" aria-hidden="true">
              <span>TR</span><span>MK</span><span>AP</span><b>+3</b>
            </div>
          </article>

          <article className="home-signal-card home-signal-network" data-home-card="network" aria-label="Identity network signal">
            <div className="home-signal-card-head">
              <span>Identity Network</span>
              <span>90D</span>
            </div>
            <div className="home-network-visual" aria-hidden="true">
              <span className="home-network-node home-network-node-a" />
              <span className="home-network-node home-network-node-b" />
              <span className="home-network-node home-network-node-c" />
              <span className="home-network-node home-network-node-d" />
              <svg viewBox="0 0 180 70" preserveAspectRatio="none">
                <path d="M23 35 L70 14 L112 48 L158 21 M70 14 L112 48 M23 35 L112 48" />
              </svg>
            </div>
            <p><strong>4 operators</strong> behind 61 accounts</p>
          </article>

          <article className="home-signal-card home-source-signal home-source-acquisition" data-home-card="acquisition" aria-label="Acquisition data signal">
            <div className="home-source-logos" aria-hidden="true">
              <span className="home-source-brand home-source-brand-google-ads" />
              <span className="home-source-brand home-source-brand-meta" />
              <span className="home-source-brand home-source-brand-linkedin" />
            </div>
            <div><strong>Acquisition</strong></div>
          </article>

          <article className="home-signal-card home-source-signal home-source-engagement" data-home-card="engagement" aria-label="Customer engagement data signal">
            <div className="home-source-logos" aria-hidden="true">
              <span className="home-source-brand home-source-brand-instagram" />
              <span className="home-source-brand home-source-brand-tiktok" />
              <span className="home-source-brand home-source-brand-intercom" />
            </div>
            <div><strong>Engagement</strong></div>
          </article>

          <article className="home-signal-card home-source-signal home-source-payments" data-home-card="payments" aria-label="Payment operations data signal">
            <div className="home-source-logos" aria-hidden="true">
              <span className="home-source-brand home-source-brand-stripe" />
              <CreditCard />
              <Database />
            </div>
            <div><strong>Payments</strong></div>
          </article>

          <article className="home-signal-card home-source-signal home-source-trading" data-home-card="trading" aria-label="Trading platform data signal">
            <div className="home-platform-logos" aria-hidden="true">
              <span className="home-platform-brand home-platform-brand-mt4" />
              <span className="home-platform-brand home-platform-brand-dxtrade" />
              <span className="home-platform-brand home-platform-brand-matchtrader" />
            </div>
            <div><strong>Platforms</strong></div>
          </article>

          <article className="home-signal-card home-source-signal home-source-kyc" data-home-card="kyc" aria-label="KYC compliance data signal">
            <div className="home-source-logos" aria-hidden="true">
              <span className="home-source-brand home-source-brand-sumsub" />
              <span className="home-source-brand home-source-brand-veriff" />
            </div>
            <div><strong>KYC Compliance</strong></div>
          </article>

          <form className="home-argus-preview" aria-label="Ask Argus AI" onSubmit={submitArgusPrompt}>
            <span className="home-argus-icon" aria-hidden="true">
              <ThinkingOrb state={activeArgusOrbState} size={64} theme="dark" />
            </span>
            <label className="home-argus-input">
              <small className="home-argus-meta">
                <span>Argus AI</span>
                <b>{argusStatusLabels[activeArgusOrbState]}</b>
              </small>
              <input
                value={argusPrompt}
                onChange={(event) => setArgusPrompt(event.target.value)}
                placeholder="How can I help today?"
                aria-label="Question for Argus AI"
              />
            </label>
            <div className="home-argus-voice-actions">
              <button className="home-argus-voice-action" type="button" onClick={() => openArgus("chat")} aria-label="Send a voice message" title="Send a voice message">
                <Microphone />
              </button>
              <button className="home-argus-voice-action home-argus-speech-action" type="button" onClick={() => openArgus("voice")} aria-label="Start speech mode" title="Start speech mode">
                <Waveform />
              </button>
            </div>
            <button className="home-argus-arrow" type="submit" aria-label="Ask Argus">
              <ArrowUp />
            </button>
          </form>

          <div className="home-dashboard-shell" aria-label="Unified QuantSentry dashboard">
            <aside className="home-dashboard-nav">
              <div className="home-dashboard-brand"><Logo compact /><span>QuantSentry</span></div>
              <span className="home-dashboard-nav-label">Overview</span>
              <span className="home-dashboard-nav-item home-dashboard-nav-overview"><SquaresFour />Dashboard</span>
              <span className="home-dashboard-nav-item"><Database />Data sources</span>
              <span className="home-dashboard-nav-item"><Layout />Custom views</span>
              <span className="home-dashboard-nav-label">Analytics</span>
              <span className="home-dashboard-nav-item"><ChartLineUp />Performance</span>
              <span className="home-dashboard-nav-item"><Warning />Anomalies</span>
              <span className="home-dashboard-nav-item"><Gauge />Benchmarks</span>
              <span className="home-dashboard-nav-label">Operations</span>
              <span className="home-dashboard-nav-item"><CheckSquare />Tasks</span>
              <span className="home-dashboard-nav-item"><FileText />Reports</span>
              <span className="home-dashboard-nav-label">Intelligence</span>
              <span className="home-dashboard-nav-item"><ShareNetwork />Network</span>
              <span className="home-dashboard-nav-item home-dashboard-nav-ai"><Sparkle />Argus AI</span>
            </aside>

            <div className="home-dashboard-main">
              <header className="home-dashboard-head">
                <div>
                  <strong className="home-dashboard-heading-overview">Operating overview</strong>
                  <strong className="home-dashboard-heading-ai">Ask Argus</strong>
                  <span>Sample tenant · updated just now</span>
                </div>
                <span className="home-dashboard-live"><i />Live data</span>
              </header>

              <div className="home-dashboard-overview">
                <div className="home-dashboard-targets" aria-hidden="true">
                  <div data-home-target="risk" />
                  <div data-home-target="revenue" />
                  <div data-home-target="payouts" />
                  <div data-home-target="network" />
                </div>
                <div className="home-dashboard-source-targets" aria-hidden="true">
                  <div data-home-target="acquisition" />
                  <div data-home-target="engagement" />
                  <div data-home-target="payments" />
                  <div data-home-target="trading" />
                  <div data-home-target="kyc" />
                </div>
                <div className="home-dashboard-activity">
                  <div className="home-dashboard-activity-head">
                    <strong>Connected activity</strong>
                    <span>Risk, finance and identity on the same timeline</span>
                  </div>
                  <div className="home-dashboard-row">
                    <span className="home-dashboard-row-status home-dashboard-row-danger" />
                    <strong>Hedge trading ring</strong><span>2 accounts · 17 matched trades</span><b>974</b>
                  </div>
                  <div className="home-dashboard-row">
                    <span className="home-dashboard-row-status home-dashboard-row-warning" />
                    <strong>Payout review</strong><span>TR-4182 · evidence kit QS-1140</span><b>$2,940</b>
                  </div>
                  <div className="home-dashboard-row">
                    <span className="home-dashboard-row-status" />
                    <strong>Revenue movement</strong><span>Instant Funded 25k · 77% kept</span><b>+19.4%</b>
                  </div>
                </div>
              </div>

              <div className="home-dashboard-ai">
                <div className="home-argus-console">
                  <div className="home-argus-console-head">
                    <div><Logo compact /><strong>Argus</strong></div>
                    <div className="home-argus-modes" aria-label="Argus mode">
                      <button className={argusMode === "chat" ? "on" : ""} type="button" onClick={() => setArgusMode("chat")}>
                        <ChatCircleDots />Chat
                      </button>
                      <button className={argusMode === "voice" ? "on" : ""} type="button" onClick={() => setArgusMode("voice")}>
                        <Microphone />Voice
                      </button>
                    </div>
                  </div>

                  {argusMode === "chat" ? (
                    <div className="home-argus-chat">
                      <div className="home-argus-user">{argusQuestion}</div>
                      <div className="home-argus-response">
                        Three anomalies explain 62% of the change: acquisition costs rose, conversion fell in one segment,
                        and refunds increased. The conversion drop is the largest opportunity.
                      </div>
                      <div className="home-argus-user home-argus-user-short">Monitor this every morning.</div>
                      <div className="home-argus-response home-argus-task">
                        <CheckSquare />Task drafted: compare acquisition cost, conversion, refunds and net revenue daily.
                      </div>
                      <div className="home-argus-suggestions">
                        <button type="button">Review the anomaly</button>
                        <button type="button">Show the affected segment</button>
                        <button type="button">Approve the task</button>
                      </div>
                    </div>
                  ) : (
                    <div className="home-argus-voice">
                      <span>On call with Argus</span>
                      <strong>00:42</strong>
                      <small>Argus is speaking</small>
                      <Waveform aria-hidden="true" />
                      <p>I found two anomalies and one growth opportunity. The daily monitoring task is ready for approval.</p>
                      <div className="home-argus-voice-log"><b>00:19</b><span>Conversion anomaly identified</span></div>
                      <div className="home-argus-voice-log"><b>00:31</b><span>Daily monitoring task drafted</span></div>
                      <button type="button">End call</button>
                    </div>
                  )}

                  <div className="home-argus-console-foot">
                    <span>Grounded in verified data</span><span>Actions require approval</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              className="home-dashboard-argus-bubble"
              type="button"
              onClick={() => openArgus("chat")}
              aria-label="Open Argus AI"
              title="Ask Argus"
            >
              <ThinkingOrb state={activeArgusOrbState} size={64} theme="dark" />
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}
