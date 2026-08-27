"use client";

import {
  ArrowUp,
  ChartBar,
  ChartLineUp,
  ChatCircleDots,
  CheckSquare,
  CursorClick,
  Database,
  CreditCard,
  FileText,
  Gauge,
  Layout,
  MagnifyingGlass,
  Microphone,
  PaperPlaneTilt,
  ShareNetwork,
  Sparkle,
  SquaresFour,
  Waveform,
  Warning,
} from "@phosphor-icons/react";
import type { CSSProperties, FocusEvent, FormEvent, KeyboardEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { ThinkingOrb, type OrbState } from "thinking-orbs";

import { BrandLockup } from "./BrandLockup";
import { Logo } from "./Logo";

type DockMetric = {
  element: HTMLElement;
  x: number;
  y: number;
  scale: number;
};

const clamp = (value: number) => Math.min(1, Math.max(0, value));
const ease = (value: number) => value * value * (3 - 2 * value);

// Typed-text frames write straight to the DOM: a React state update here would
// re-render the whole hero tree on every animation frame for the full sequence.
const writeTypedText = (el: HTMLSpanElement | null, copy: string, t: number) => {
  if (!el) return;
  const text = copy.slice(0, Math.floor(copy.length * clamp(t)));
  if (el.textContent !== text) el.textContent = text;
  const caret = el.nextElementSibling;
  if (caret) caret.classList.toggle("is-complete", text.length >= copy.length);
};
const industries = ["Prop Trading", "Brokerages", "Funds", "Payments"];
const ingestionCopy = "Connect your systems. I’ll ingest, reconcile, and continuously analyse the data for you.";
const ingestionStatuses = [
  "Trading and payments connected",
  "Customer and operations syncing",
  "Marketing and CRM ready",
];
const argusInsightCopy =
  "Recovering one point of 25K conversion could add an estimated $18.4K in monthly contribution margin.";
const argusFollowupCopy = "What should we do next?";
const argusActionCopy =
  "Review the affected campaign and six linked payout requests. I can monitor both every morning and alert the team when thresholds are crossed.";
const argusTaskCreatedCopy =
  "Monitoring task created. I’ll review the campaign and linked payout requests every morning and alert the team when thresholds are crossed.";
const argusIdlePrompts = [
  "How can I help today?",
  "What would you like me to do?",
  "What should I look into?",
];
const argusFocusedPrompt = "Tell me what you’d like me to do.";
// Labels track what Argus is actually doing: idle rest = "Ready" (breathing),
// dialog open = "Listening", ingest/docking = "Connecting", console typing =
// "Composing" — no decorative cycling.
const argusStatusLabels: Record<OrbState, string> = {
  breathing: "Ready",
  searching: "Analyzing",
  solving: "Solving",
  listening: "Listening",
  connecting: "Connecting",
  weaving: "Weaving insights",
  composing: "Composing",
  shaping: "Structuring",
  working: "Working",
};

function ArgusOrb({ state }: { state: OrbState }) {
  return <ThinkingOrb state={state} size={64} theme="dark" />;
}

export function HomeOverviewHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const storyStageRef = useRef<HTMLDivElement>(null);
  const argusPromptInputRef = useRef<HTMLInputElement>(null);
  const startArgusStoryRef = useRef<(() => void) | null>(null);
  const playStoryRef = useRef<(() => void) | null>(null);
  const applyEndStateRef = useRef<(() => void) | null>(null);
  const startIngestionTypingRef = useRef<(() => void) | null>(null);
  const resetIngestionTypingRef = useRef<(() => void) | null>(null);
  const argusDialogDismissedRef = useRef(false);
  const storyActiveRef = useRef(false);
  const [argusDialogOpen, setArgusDialogOpen] = useState(false);
  const [argusMode, setArgusMode] = useState<"chat" | "voice">("chat");
  const [argusOrbState, setArgusOrbState] = useState<OrbState>("breathing");
  const [argusPrompt, setArgusPrompt] = useState("");
  const [argusPromptHint, setArgusPromptHint] = useState("");
  const [argusPromptFocused, setArgusPromptFocused] = useState(false);
  const [argusQuestion, setArgusQuestion] = useState("What changed today?");
  const [industryText, setIndustryText] = useState(industries[0]);
  const [ingestionCopyLength, setIngestionCopyLength] = useState(0);
  const [ingestionStatusCount, setIngestionStatusCount] = useState(0);
  const argusInsightTypeRef = useRef<HTMLSpanElement | null>(null);
  const argusFollowupTypeRef = useRef<HTMLSpanElement | null>(null);
  const argusActionTypeRef = useRef<HTMLSpanElement | null>(null);
  const [argusTaskCreated, setArgusTaskCreated] = useState(false);

  const openArgusDialog = (mode: "chat" | "voice") => {
    setArgusMode(mode);
    setArgusOrbState(mode === "voice" ? "listening" : "breathing");
    setArgusDialogOpen(true);
  };

  const dismissArgusDialog = () => {
    argusDialogDismissedRef.current = true;
    // Refocus first: the input's onFocus re-opens the dialog synchronously, so
    // the close below must be the last state write to win the batch.
    argusPromptInputRef.current?.focus();
    setArgusDialogOpen(false);
  };

  const confirmArgusIngest = () => {
    storyActiveRef.current = true;
    setArgusOrbState("working");
    setArgusDialogOpen(false);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Reveal + start first so the stage has layout before we focus/scroll to it.
    if (reducedMotion || window.innerWidth <= 900) applyEndStateRef.current?.();
    else playStoryRef.current?.();
    const stage = storyStageRef.current;
    stage?.focus({ preventScroll: true });
    stage?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
  };

  const handleArgusDialogKeyDown = (event: KeyboardEvent<HTMLFormElement>) => {
    if (event.key !== "Escape" || !argusDialogOpen) return;
    event.preventDefault();
    dismissArgusDialog();
  };

  const handleArgusBlur = (event: FocusEvent<HTMLFormElement>) => {
    const next = event.relatedTarget;
    if (next instanceof Node && event.currentTarget.contains(next)) return;
    argusDialogDismissedRef.current = true;
    setArgusDialogOpen(false);
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (argusDialogDismissedRef.current || storyActiveRef.current) return;
      setArgusMode("chat");
      setArgusOrbState("breathing");
      setArgusDialogOpen(true);
    }, 2000);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (argusPrompt) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const prompts = argusPromptFocused ? [argusFocusedPrompt] : argusIdlePrompts;
    let promptIndex = 0;
    let characterIndex = 0;
    let deleting = false;
    let timer = 0;

    const tick = () => {
      const prompt = prompts[promptIndex];
      characterIndex += deleting ? -1 : 1;
      setArgusPromptHint(prompt.slice(0, characterIndex));

      let delay = deleting ? 28 : 52;
      if (!deleting && characterIndex === prompt.length) {
        if (argusPromptFocused) return;
        deleting = true;
        delay = 2200;
      } else if (deleting && characterIndex === 0) {
        deleting = false;
        promptIndex = (promptIndex + 1) % prompts.length;
        delay = 320;
      }

      timer = window.setTimeout(tick, delay);
    };

    if (reducedMotion) {
      timer = window.setTimeout(() => setArgusPromptHint(prompts[0]), 0);
    } else {
      timer = window.setTimeout(tick, argusPromptFocused ? 180 : 520);
    }

    return () => window.clearTimeout(timer);
  }, [argusPrompt, argusPromptFocused]);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let animationFrame = 0;
    let running = false;
    let completed = false;

    const reset = () => {
      window.cancelAnimationFrame(animationFrame);
      running = false;
      completed = false;
      setIngestionCopyLength(0);
      setIngestionStatusCount(0);
    };

    const start = () => {
      if (running || completed || reducedMotion) return;

      running = true;
      const startedAt = performance.now();
      const copyDuration = 3300;
      const statusDelay = 520;
      const statusStep = 700;

      const advance = (time: number) => {
        const elapsed = time - startedAt;
        const copyLength = Math.min(ingestionCopy.length, Math.floor((elapsed / copyDuration) * ingestionCopy.length));
        const statusCount = Math.min(
          ingestionStatuses.length,
          Math.max(0, Math.floor((elapsed - copyDuration - statusDelay) / statusStep) + 1),
        );

        setIngestionCopyLength(copyLength);
        setIngestionStatusCount(statusCount);

        if (statusCount < ingestionStatuses.length) {
          animationFrame = window.requestAnimationFrame(advance);
        } else {
          running = false;
          completed = true;
        }
      };

      animationFrame = window.requestAnimationFrame(advance);
    };

    if (reducedMotion) {
      completed = true;
      animationFrame = window.requestAnimationFrame(() => {
        setIngestionCopyLength(ingestionCopy.length);
        setIngestionStatusCount(ingestionStatuses.length);
      });
    }

    startIngestionTypingRef.current = start;
    resetIngestionTypingRef.current = reset;

    return () => {
      window.cancelAnimationFrame(animationFrame);
      startIngestionTypingRef.current = null;
      resetIngestionTypingRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let industryIndex = 0;
    let characterIndex = industries[0].length;
    let deleting = true;
    let timer = window.setTimeout(tick, 2000);

    function tick() {
      const industry = industries[industryIndex];
      characterIndex += deleting ? -1 : 1;
      setIndustryText(industry.slice(0, characterIndex));

      let delay = deleting ? 34 : 62;
      if (deleting && characterIndex === 0) {
        deleting = false;
        industryIndex = (industryIndex + 1) % industries.length;
        delay = 260;
      } else if (!deleting && characterIndex === industries[industryIndex].length) {
        deleting = true;
        delay = 2000;
      }

      timer = window.setTimeout(tick, delay);
    }

    return () => window.clearTimeout(timer);
  }, []);

  const activeArgusOrbState: OrbState = argusMode === "voice" ? "listening" : argusOrbState;

  const submitArgusPrompt = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const question = argusPrompt.trim();
    if (question) setArgusQuestion(question);
    openArgusDialog("chat");
  };

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let metrics: DockMetric[] = [];
    // Resting state: the story stage (dashboard and all) is fully collapsed via
    // [data-story-open="false"] — the page is just the hero. Confirming the
    // pill's dialog reveals the stage and plays the timeline (or jumps straight
    // to the end state on mobile / reduced motion). Once Argus is live inside
    // the dashboard (stage "ai") the pill hides for good, and nothing ever
    // collapses or resets again.
    let storyFrame = 0;
    let storyProgress = 0;
    let storyRunning = false;
    let storyCompleted = false;
    let sequenceFrame = 0;
    let sequenceProgress = 0;
    let sequenceAi = 0;
    let sequenceRunning = false;
    let autoSequenceScheduled = false;
    let autoSequenceTimer = 0;

    const applyArgusSequence = (progress: number) => {
      sequenceProgress = progress;
      const cursor = ease(clamp(progress / 0.18));
      const cursorClick = ease(clamp((progress - 0.16) / 0.04)) * (1 - ease(clamp((progress - 0.23) / 0.04)));
      const cursorDone = ease(clamp((progress - 0.24) / 0.06));
      const cardsFade = ease(clamp((progress - 0.28) / 0.1));
      const ai = ease(clamp((progress - 0.36) / 0.12));
      const aiAnswer = ease(clamp((progress - 0.48) / 0.06));
      const aiFollowup = ease(clamp((progress - 0.72) / 0.05));
      const aiAction = ease(clamp((progress - 0.79) / 0.05));
      const aiSuggestions = ease(clamp((progress - 0.96) / 0.04));
      sequenceAi = ai;

      writeTypedText(argusInsightTypeRef.current, argusInsightCopy, (progress - 0.5) / 0.22);
      writeTypedText(argusFollowupTypeRef.current, argusFollowupCopy, (progress - 0.72) / 0.07);
      writeTypedText(argusActionTypeRef.current, argusActionCopy, (progress - 0.81) / 0.15);

      section.style.setProperty("--home-cursor", cursor.toFixed(4));
      section.style.setProperty("--home-cursor-click", cursorClick.toFixed(4));
      section.style.setProperty("--home-cursor-done", cursorDone.toFixed(4));
      section.style.setProperty("--home-cards-fade", cardsFade.toFixed(4));
      section.style.setProperty("--home-ai", ai.toFixed(4));
      section.style.setProperty("--home-ai-answer", aiAnswer.toFixed(4));
      section.style.setProperty("--home-ai-followup", aiFollowup.toFixed(4));
      section.style.setProperty("--home-ai-action", aiAction.toFixed(4));
      section.style.setProperty("--home-ai-suggestions", aiSuggestions.toFixed(4));
      section.dataset.storyStage = ai > 0.5 ? "ai" : "dashboard";
    };

    const startArgusSequence = () => {
      if (sequenceRunning || sequenceProgress >= 1) return;

      window.clearTimeout(autoSequenceTimer);
      autoSequenceScheduled = false;
      sequenceRunning = true;
      const duration = 8000;
      const startedAt = performance.now() - sequenceProgress * duration;

      const advance = (time: number) => {
        const progress = clamp((time - startedAt) / duration);
        applyArgusSequence(progress);
        if (progress < 1) {
          sequenceFrame = window.requestAnimationFrame(advance);
        } else {
          sequenceRunning = false;
        }
      };

      sequenceFrame = window.requestAnimationFrame(advance);
    };

    startArgusStoryRef.current = startArgusSequence;

    const setStage = (progress: number) => {
      storyProgress = progress;
      const dashboardShell = ease(clamp(progress / 0.08));
      const signals = ease(clamp((progress - 0.1) / 0.1));
      const ingestionIn = ease(clamp((progress - 0.18) / 0.08));
      const ingestionOut = ease(clamp((progress - 0.55) / 0.07));
      const ingestion = ingestionIn * (1 - ingestionOut);
      const converge = ease(clamp((progress - 0.57) / 0.15));
      const dashboard = ease(clamp((progress - 0.72) / 0.12));
      const copyFade = dashboardShell;

      section.style.setProperty("--home-progress", progress.toFixed(4));
      section.style.setProperty("--home-signals", signals.toFixed(4));
      section.style.setProperty("--home-ingestion", ingestion.toFixed(4));
      section.style.setProperty("--home-converge", converge.toFixed(4));
      section.style.setProperty("--home-dashboard", dashboard.toFixed(4));
      section.style.setProperty("--home-copy-fade", copyFade.toFixed(4));

      if (ingestionIn > 0.35) startIngestionTypingRef.current?.();
      if (progress < 0.07) resetIngestionTypingRef.current?.();

      metrics.forEach(({ element, x, y, scale }) => {
        element.style.setProperty("--home-card-x", `${x * converge}px`);
        element.style.setProperty("--home-card-y", `${y * converge}px`);
        element.style.setProperty("--home-card-scale", `${1 + (scale - 1) * converge}`);
      });

      // Chain the Argus sequence only while a confirmed story is playing; the
      // resting docked state must not auto-open the conversation.
      if (storyRunning && dashboard > 0.99 && sequenceProgress === 0 && !sequenceRunning && !autoSequenceScheduled) {
        autoSequenceScheduled = true;
        autoSequenceTimer = window.setTimeout(() => {
          autoSequenceScheduled = false;
          startArgusSequence();
        }, 1200);
      }

      section.dataset.storyStage = sequenceAi > 0.5 ? "ai" : dashboard > 0.5 ? "dashboard" : "signals";
    };

    const startStory = () => {
      if (storyRunning || storyCompleted) return;

      storyRunning = true;
      const duration = 12000;
      const startedAt = performance.now() - storyProgress * duration;

      const advance = (time: number) => {
        const progress = clamp((time - startedAt) / duration);
        setStage(progress);
        if (progress < 1) {
          storyFrame = window.requestAnimationFrame(advance);
        } else {
          storyRunning = false;
          storyCompleted = true;
        }
      };

      storyFrame = window.requestAnimationFrame(advance);
    };

    // Reveal the collapsed story stage (variant a rest state) and measure the
    // dock geometry now that it has layout.
    const openStage = () => {
      if (section.dataset.storyOpen === "true") return;
      section.dataset.storyOpen = "true";
      measure();
    };

    const playStory = () => {
      if (storyRunning) return;

      openStage();
      window.cancelAnimationFrame(storyFrame);
      window.cancelAnimationFrame(sequenceFrame);
      window.clearTimeout(autoSequenceTimer);
      autoSequenceScheduled = false;
      sequenceRunning = false;
      storyCompleted = false;
      storyProgress = 0;
      setArgusTaskCreated(false);
      applyArgusSequence(0);
      setStage(0);
      startStory();
    };

    playStoryRef.current = playStory;

    // Static jump to the finished conversation, used when the visitor confirms
    // under prefers-reduced-motion or on mobile (no timeline plays there).
    const applyEndState = () => {
      openStage();
      window.cancelAnimationFrame(storyFrame);
      window.cancelAnimationFrame(sequenceFrame);
      window.clearTimeout(autoSequenceTimer);
      autoSequenceScheduled = false;
      storyRunning = false;
      sequenceRunning = false;
      storyCompleted = true;
      storyProgress = 1;
      applyArgusSequence(1);
      setStage(1);
    };

    applyEndStateRef.current = applyEndState;

    const measure = () => {
      if (window.innerWidth <= 900) {
        // Mobile layout is fully static via CSS overrides; only the typed
        // copy needs to be completed.
        metrics = [];
        writeTypedText(argusInsightTypeRef.current, argusInsightCopy, 1);
        writeTypedText(argusFollowupTypeRef.current, argusFollowupCopy, 1);
        writeTypedText(argusActionTypeRef.current, argusActionCopy, 1);
        return;
      }

      // While the stage is collapsed (display: none) there is no geometry to
      // measure — everything happens on reveal via openStage().
      if (section.dataset.storyOpen !== "true") {
        metrics = [];
        return;
      }

      const currentStoryProgress = storyProgress;
      const currentSequenceProgress = sequenceProgress;
      const sourceElements = Array.from(section.querySelectorAll<HTMLElement>("[data-home-card]"));

      sourceElements.forEach((element) => {
        element.style.setProperty("--home-card-x", "0px");
        element.style.setProperty("--home-card-y", "0px");
        element.style.setProperty("--home-card-scale", "1");
      });

      const sourceCards = sourceElements.map((element) => ({
        element,
        sourceRect: element.getBoundingClientRect(),
      }));

      section.style.setProperty("--home-converge", "1");
      section.style.setProperty("--home-dashboard", "1");
      section.style.setProperty("--home-copy-fade", "1");
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
      setStage(currentStoryProgress);
      if (currentSequenceProgress > 0) applyArgusSequence(currentSequenceProgress);
    };

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(section);
    window.addEventListener("resize", measure);
    reducedMotion.addEventListener("change", measure);
    measure();

    return () => {
      window.cancelAnimationFrame(storyFrame);
      window.cancelAnimationFrame(sequenceFrame);
      window.clearTimeout(autoSequenceTimer);
      startArgusStoryRef.current = null;
      playStoryRef.current = null;
      applyEndStateRef.current = null;
      resizeObserver.disconnect();
      window.removeEventListener("resize", measure);
      reducedMotion.removeEventListener("change", measure);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="hero dots home-overview-hero"
      data-story-stage="signals"
      data-story-open="false"
    >
      {/* The same aurora continues behind the complete opening story. */}
      <div className="home-scroll-stage">
        <div className="wrap home-overview-wrap">
          <div className="home-hero-copy">
            <div className="kicker home-hero-kicker">
              <span className="dot" />
              <span>
                Data Intelligence for{" "}
                <em
                  className="type home-hero-industry"
                >
                  {industryText}
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

          <form
            className="home-argus-preview"
            aria-label="Ask Argus AI"
            onSubmit={submitArgusPrompt}
            onKeyDown={handleArgusDialogKeyDown}
            onBlur={handleArgusBlur}
          >
            <span className="home-argus-icon" aria-hidden="true">
              <ArgusOrb state={activeArgusOrbState} />
            </span>
            <label className="home-argus-input">
              <small className="home-argus-meta">
                <span>Argus AI</span>
                <b>{argusStatusLabels[activeArgusOrbState]}</b>
              </small>
              <input
                ref={argusPromptInputRef}
                value={argusPrompt}
                onChange={(event) => {
                  setArgusPrompt(event.target.value);
                  if (!event.target.value) setArgusPromptHint("");
                }}
                onFocus={() => {
                  setArgusPromptHint("");
                  setArgusPromptFocused(true);
                  setArgusDialogOpen(true);
                }}
                onBlur={() => {
                  setArgusPromptHint("");
                  setArgusPromptFocused(false);
                }}
                placeholder={argusPromptHint}
                aria-label="Question for Argus AI"
                aria-haspopup="dialog"
                aria-controls="home-argus-confirm-dialog"
              />
            </label>
            <div className="home-argus-voice-actions">
              <button
                className="home-argus-voice-action"
                type="button"
                onClick={() => openArgusDialog("chat")}
                aria-label="Send a voice message"
                title="Send a voice message"
                aria-haspopup="dialog"
                aria-expanded={argusDialogOpen}
              >
                <Microphone />
              </button>
              <button
                className="home-argus-voice-action home-argus-speech-action"
                type="button"
                onClick={() => openArgusDialog("voice")}
                aria-label="Start speech mode"
                title="Start speech mode"
                aria-haspopup="dialog"
                aria-expanded={argusDialogOpen}
              >
                <Waveform />
              </button>
            </div>
            <button className="home-argus-arrow" type="submit" aria-label="Ask Argus">
              <ArrowUp />
            </button>
            {argusDialogOpen ? (
              <div
                className="home-argus-confirm"
                id="home-argus-confirm-dialog"
                role="dialog"
                aria-label="Argus AI ingestion"
                onMouseDown={(event) => event.preventDefault()}
              >
                <small className="home-argus-confirm-kicker">Argus AI</small>
                <p className="home-argus-confirm-copy">
                  I can ingest your connected data and build your dashboard around it. Ready?
                </p>
                <div className="home-argus-confirm-actions">
                  <button className="home-argus-confirm-yes" type="button" onClick={confirmArgusIngest}>
                    Yes, get started
                  </button>
                  <button className="home-argus-confirm-no" type="button" onClick={dismissArgusDialog}>
                    Not now
                  </button>
                </div>
              </div>
            ) : null}
          </form>
        </div>
      </div>

      <div className="home-story-stage" ref={storyStageRef} tabIndex={-1}>
        <div className="wrap home-story-wrap">
          <article className="home-signal-card home-signal-risk" data-home-card="risk" aria-label="Risk management signals">
            <div className="home-signal-card-head">
              <span>Risk Management</span>
              <span className="home-signal-status"><i />Live</span>
            </div>
            <div className="home-signal-value">7</div>
            <p>rings open across 62 linked accounts</p>
            <div className="home-risk-bars" aria-hidden="true">
              <i style={{ "--signal-size": "94%" } as CSSProperties} />
              <i style={{ "--signal-size": "78%" } as CSSProperties} />
              <i style={{ "--signal-size": "58%" } as CSSProperties} />
            </div>
          </article>

          <article className="home-signal-card home-signal-revenue" data-home-card="revenue" aria-label="Revenue performance signal">
            <div className="home-signal-card-head">
              <span>Revenue Performance</span>
              <span>90D</span>
            </div>
            <div className="home-signal-value">$126.1K</div>
            <p className="home-signal-positive">↑ 19.4% against the last period</p>
            <svg className="home-mini-chart" viewBox="0 0 220 66" preserveAspectRatio="none" aria-hidden="true">
              <path className="home-mini-chart-area" d="M2 57 C28 52 38 47 57 49 C78 51 86 37 107 39 C132 41 137 29 159 30 C180 31 192 18 218 8 L218 66 L2 66 Z" />
              <path className="home-mini-chart-line" d="M2 57 C28 52 38 47 57 49 C78 51 86 37 107 39 C132 41 137 29 159 30 C180 31 192 18 218 8" />
            </svg>
          </article>

          <article className="home-signal-card home-signal-payouts" data-home-card="payouts" aria-label="Payout request signal">
            <div className="home-signal-card-head">
              <span>Payout Requests</span>
              <span className="home-signal-warning">Review</span>
            </div>
            <div className="home-signal-value">$19.26K</div>
            <p>6 cases, evidence attached</p>
            <div className="home-signal-people" aria-hidden="true">
              <span>TR</span><span>MK</span><span>AP</span><b>+3</b>
            </div>
          </article>

          <article className="home-signal-card home-signal-network" data-home-card="network" aria-label="Fraud network signal">
            <div className="home-signal-card-head">
              <span>Fraud Network</span>
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
              <span className="home-platform-brand home-platform-brand-mt5" />
              <span className="home-platform-brand home-platform-brand-ctrader" />
              <span className="home-platform-brand home-platform-brand-tradelocker" />
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

          <div className="home-argus-ingestion">
            <div className="home-argus-ingestion-head">
              <Logo compact />
              <div>
                <strong>Argus AI</strong>
                <span><i />Bringing your data together</span>
              </div>
            </div>
            <p aria-label={ingestionCopy}>
              <span aria-hidden="true">{ingestionCopy.slice(0, ingestionCopyLength)}</span>
              <i
                className={`home-argus-ingestion-caret${ingestionCopyLength >= ingestionCopy.length ? " is-complete" : ""}`}
                aria-hidden="true"
              />
            </p>
            <div className="home-argus-ingestion-status">
              {ingestionStatuses.map((status, index) => (
                <span className={index < ingestionStatusCount ? "is-visible" : ""} key={status}>
                  <CheckSquare weight="fill" />{status}
                </span>
              ))}
            </div>
          </div>

          <div className="home-dashboard-shell" aria-label="Unified QuantSentry dashboard">
            <aside className="home-dashboard-nav">
              <div className="home-dashboard-brand"><BrandLockup /></div>
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
                    <div className="home-argus-console-agent">
                      <span className="home-argus-console-orb" aria-hidden="true">
                        <ArgusOrb state={activeArgusOrbState} />
                      </span>
                      <div>
                        <strong>Argus AI</strong>
                        <span className="home-argus-console-status"><i />{argusStatusLabels[activeArgusOrbState]}</span>
                      </div>
                    </div>
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
                      <div className="home-argus-response home-argus-analysis home-argus-message-insight">
                        <div className="home-argus-analysis-head">
                          <span><ChartLineUp />Today’s performance drivers</span>
                          <small>Verified across 6 sources</small>
                        </div>
                        <div className="home-argus-analysis-table-wrap">
                          <table>
                            <thead>
                              <tr><th>Driver</th><th>Change</th><th>Business impact</th></tr>
                            </thead>
                            <tbody>
                              <tr><td>Acquisition cost</td><td className="is-negative">+18.2%</td><td>Margin pressure</td></tr>
                              <tr><td>25K conversion</td><td className="is-negative">−1.4 pts</td><td>Largest opportunity</td></tr>
                              <tr><td>Refund requests</td><td className="is-negative">+11.8%</td><td>6 cases to review</td></tr>
                            </tbody>
                          </table>
                        </div>
                        <div className="home-argus-analysis-insight">
                          <strong>Key insight</strong>
                          <p aria-label={argusInsightCopy}>
                            <span aria-hidden="true" ref={argusInsightTypeRef}>{argusInsightCopy}</span>
                            <i className="home-argus-type-caret is-complete" aria-hidden="true" />
                          </p>
                        </div>
                      </div>
                      <div className="home-argus-user home-argus-user-short home-argus-message-followup" aria-label={argusFollowupCopy}>
                        <span aria-hidden="true" ref={argusFollowupTypeRef}>{argusFollowupCopy}</span>
                        <i className="home-argus-type-caret is-complete" aria-hidden="true" />
                      </div>
                      <button
                        className={`home-argus-response home-argus-task home-argus-message-action${argusTaskCreated ? " is-created" : ""}`}
                        aria-pressed={argusTaskCreated}
                        onClick={() => setArgusTaskCreated(true)}
                        type="button"
                      >
                        <CheckSquare weight={argusTaskCreated ? "fill" : "regular"} />
                        <span aria-label={argusTaskCreated ? argusTaskCreatedCopy : argusActionCopy}>
                          {argusTaskCreated ? (
                            <span>{argusTaskCreatedCopy}</span>
                          ) : (
                            <>
                              <span aria-hidden="true" ref={argusActionTypeRef}>{argusActionCopy}</span>
                              <i className="home-argus-type-caret is-complete" aria-hidden="true" />
                            </>
                          )}
                        </span>
                      </button>
                      <div className="home-argus-suggestions home-argus-message-suggestions">
                        <button type="button"><MagnifyingGlass size={14} />Review the Anomaly</button>
                        <button type="button"><ChartBar size={14} />Show the Affected Segment</button>
                        <button disabled={argusTaskCreated} onClick={() => setArgusTaskCreated(true)} type="button">
                          <PaperPlaneTilt size={14} />
                          {argusTaskCreated ? "Monitoring task created" : "Create Monitoring Task"}
                        </button>
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
              onClick={() => startArgusStoryRef.current?.()}
              aria-label="Open Argus AI"
              title="Ask Argus"
            >
              <ArgusOrb state={activeArgusOrbState} />
            </button>
            <span className="home-dashboard-guide-cursor" aria-hidden="true"><CursorClick weight="fill" /></span>
          </div>
        </div>
      </div>
    </section>
  );
}
