"use client";

import {
  Browser,
  CheckCircle,
  Code,
  PaperPlaneTilt,
} from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import { ThinkingOrb } from "thinking-orbs";

import { HomeDataPattern } from "./HomeDataPattern";

export function ArgusEverywhereSection() {
  return (
    <section className="argus-everywhere-section home-data-section theme-light" aria-labelledby="argus-everywhere-title">
      <HomeDataPattern />
      <div className="wrap">
        <div className="argus-everywhere-heading">
          <div className="kicker argus-everywhere-kicker"><span className="dot" /><span>Argus Everywhere</span></div>
          <h2 id="argus-everywhere-title">Ask Argus <span className="c">Wherever You Work.</span></h2>
          <p className="lede">Get the same verified answer in the channels, browser and operating tools your team already uses.</p>
        </div>

        <div className="argus-everywhere-grid">
          <article className="argus-everywhere-item">
            <div className="argus-surface">
              <div className="argus-surface-bar">
                <span className="argus-surface-brand"><Image alt="" aria-hidden="true" height={20} src="/images/slack.png" width={20} /><strong>Slack</strong></span>
                <span className="argus-surface-status"><i />Connected</span>
              </div>
              <div className="argus-surface-body argus-surface-chat">
                <div className="argus-message is-user"><b>@Argus</b> Which payout requests need review?</div>
                <div className="argus-message is-argus"><ThinkingOrb state="breathing" size={20} style={{ height: 15, width: 15 }} theme="light" /><span><strong>Two requests.</strong> Both link to the same 17-account cluster. Evidence is ready.</span></div>
              </div>
            </div>
            <h3>Slack</h3>
            <p>Mention Argus where your team already makes decisions.</p>
          </article>

          <article className="argus-everywhere-item">
            <div className="argus-surface">
              <div className="argus-surface-bar">
                <span className="argus-surface-brand"><Image alt="" aria-hidden="true" height={20} src="/images/gmail.svg" width={20} /><strong>Gmail</strong></span>
                <span className="argus-surface-status"><CheckCircle size={13} weight="fill" />Delivered</span>
              </div>
              <div className="argus-surface-body argus-email-body">
                <span className="argus-email-kicker">Weekly Performance Brief</span>
                <strong>Revenue is 5.2% ahead of target.</strong>
                <p>Payment completion drove the improvement. Two acquisition channels need attention.</p>
                <span className="argus-email-link">Open the full report <PaperPlaneTilt size={13} /></span>
              </div>
            </div>
            <h3>Email</h3>
            <p>Receive scheduled reports and clear summaries.</p>
          </article>

          <article className="argus-everywhere-item">
            <div className="argus-surface">
              <div className="argus-surface-bar argus-surface-browser-bar">
                <span className="argus-surface-brand"><Browser size={20} weight="bold" /><strong>Your Browser</strong></span>
                <span className="argus-surface-url">app.yourco.com</span>
              </div>
              <div className="argus-surface-body argus-browser-body">
                <div className="argus-browser-chart"><i /><i /><i /><i /><i /><i /></div>
                <div className="argus-browser-panel">
                  <span><ThinkingOrb state="breathing" size={20} style={{ height: 13, width: 13 }} theme="light" /><strong>Argus</strong></span>
                  <p>Ask about this page without leaving your work.</p>
                  <small>What changed here?</small>
                </div>
              </div>
            </div>
            <h3>Your Browser</h3>
            <p>Ask what changed without leaving the page.</p>
          </article>

          <article className="argus-everywhere-item">
            <div className="argus-surface">
              <div className="argus-surface-bar">
                <span className="argus-surface-brand"><Code size={20} weight="bold" /><strong>Your Tools</strong></span>
                <span className="argus-surface-status"><i />Embedded</span>
              </div>
              <div className="argus-surface-body argus-embedded-body">
                <div className="argus-embedded-metrics"><span><strong>$164.2K</strong><small>Revenue</small></span><span><strong>+5.2%</strong><small>vs target</small></span></div>
                <div className="argus-embedded-prompt"><ThinkingOrb state="breathing" size={20} style={{ height: 14, width: 14 }} theme="light" /><span>Ask Argus about this dashboard…</span></div>
              </div>
            </div>
            <h3>Embedded in Your Tools</h3>
            <p>Bring Argus into the dashboards, portals and tools your team uses.</p>
          </article>
        </div>
      </div>
    </section>
  );
}
