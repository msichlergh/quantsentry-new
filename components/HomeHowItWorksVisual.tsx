"use client";

import {
  Brain,
  ChartLineUp,
  Check,
  Database,
  Gauge,
  Lightning,
  Warning,
} from "@phosphor-icons/react";
import Image from "next/image";
import { ThinkingOrb } from "thinking-orbs";

const integrationLogos = [
  "/images/sumsub.svg",
  "/images/intercom.svg",
  "/images/slack.png",
  "/images/how-it-works/tools/mt5-transparent.png",
  "/images/how-it-works/tools/tool-08.png",
  "/images/how-it-works/tools/tool-05.png",
  "/images/how-it-works/tools/woocommerce.webp",
  "/images/how-it-works/tools/tool-07.png",
] as const;

const intelligenceRows = [
  [Database, "Unified Data", "Sources analyzed"],
  [Gauge, "Performance Benchmarks", "Benchmarks calculated"],
  [Warning, "Risk Alerts", "3 risks flagged"],
  [ChartLineUp, "Growth Opportunities", "12 opportunities found"],
  [Brain, "AI Recommendations", "Recommendations ready"],
] as const;

type HomeHowItWorksVisualProps = {
  step: 0 | 1 | 2;
};

function CursorIcon({ className }: { className: string }) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 16.861 16.861">
      <path
        d="M2.134.234C1.947.166 1.756.098 1.595.056 1.443.016 1.148-.049.832.06.47.186.186.47.06.832c-.109.316-.044.611-.004.763.042.161.11.352.178.539l4.774 13.3c.084.233.164.457.243.63.067.146.22.465.551.645.362.197.799.203 1.166.015.336-.171.497-.486.567-.63.084-.171.171-.392.26-.624l2.149-5.526 5.526-2.149c.232-.089.453-.176.624-.259.144-.071.459-.232.63-.568.188-.367.182-.804-.015-1.166-.18-.331-.499-.484-.645-.551-.173-.079-.397-.159-.63-.243Z"
        fill="#0f1112"
        stroke="#f4f7f7"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function IntegrationVisual() {
  return (
    <div
      aria-label="Business systems connecting to QuantSentry"
      className="home-how-motion home-how-motion-connect"
      role="img"
    >
      <div className="home-how-orbit home-how-orbit-outer" />
      <div className="home-how-orbit home-how-orbit-middle" />
      <div className="home-how-orbit home-how-orbit-inner" />
      <div className="home-how-tool-rail" aria-hidden="true">
        {integrationLogos.map((src, index) => (
          <span
            className={`home-how-tool ${index === 3 ? "is-primary" : ""} ${index === 2 ? "is-next" : ""}`}
            key={src}
          >
            <Image alt="" height={96} src={src} width={96} />
          </span>
        ))}
      </div>
      <span className="home-how-motion-label">CONNECTING…</span>
    </div>
  );
}

function IntelligenceVisual() {
  return (
    <div
      aria-label="QuantSentry building a unified intelligence layer"
      className="home-how-motion home-how-motion-intelligence"
      role="img"
    >
      <div className="home-how-status-list">
        {intelligenceRows.map(([Icon, title, detail], index) => (
          <div className="home-how-status-row" key={title}>
            <div className="home-how-status-content">
              <span className="home-how-status-icon" aria-hidden="true">
                <Icon size={18} weight="regular" />
              </span>
              <div className="home-how-status-copy">
                <p>{title}</p>
                <span>{detail}</span>
              </div>
            </div>
            <span className={`home-how-status-check home-how-status-check-${index + 1}`} aria-hidden="true">
              <Check size={13} weight="bold" />
            </span>
          </div>
        ))}
      </div>
      <CursorIcon className="home-how-motion-cursor" />
    </div>
  );
}

function ActionVisual() {
  return (
    <div
      aria-label="QuantSentry surfacing actions and their projected impact"
      className="home-how-motion home-how-motion-action"
      role="img"
    >
      <div className="home-how-action-agent">
        <span className="home-how-action-orb" aria-hidden="true">
          <ThinkingOrb size={64} state="composing" theme="dark" />
        </span>
        <span>
          <small><b>Argus AI</b><i />Ready</small>
          <strong>Recommendation ready</strong>
        </span>
      </div>
      <div className="home-how-action-metric">
        <span className="home-how-action-dot" />
        <strong>24</strong>
        <span>Actions Ready</span>
      </div>
      <div className="home-how-action-chart">
        <svg aria-hidden="true" className="home-how-action-chart-graphic" preserveAspectRatio="none" viewBox="0 0 600 220">
          <defs>
            <linearGradient id="home-how-chart-fill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#8b8d8e" stopOpacity="0.28" />
              <stop offset="1" stopColor="#8b8d8e" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            className="home-how-action-chart-area"
            d="M0 113 C54 110 80 150 126 129 C160 113 171 32 215 34 C259 36 269 72 318 65 C365 58 367 171 421 163 C478 155 483 92 533 95 C569 98 580 175 600 205 L600 220 L0 220 Z"
          />
          <path
            className="home-how-action-chart-line"
            d="M0 113 C54 110 80 150 126 129 C160 113 171 32 215 34 C259 36 269 72 318 65 C365 58 367 171 421 163 C478 155 483 92 533 95 C569 98 580 175 600 205"
          />
        </svg>
        <span className="home-how-action-reading"><i />Projected impact +3.8%</span>
        <CursorIcon className="home-how-action-cursor" />
      </div>
      <div className="home-how-action-proposals">
        <div className="home-how-action-proposal">
          <span><Lightning size={13} weight="fill" /> Recommended action</span>
          <strong>Expand peak-hour support</strong>
          <p>Add coverage from 08:00–10:00 UTC.</p>
        </div>
        <div className="home-how-action-proposal">
          <span><ChartLineUp size={13} weight="bold" /> Growth opportunity</span>
          <strong>Prioritize the strongest channel</strong>
          <p>Shift 10% more budget to the top campaign.</p>
        </div>
      </div>
    </div>
  );
}

export function HomeHowItWorksVisual({ step }: HomeHowItWorksVisualProps) {
  if (step === 0) return <IntegrationVisual />;
  if (step === 1) return <IntelligenceVisual />;
  return <ActionVisual />;
}
