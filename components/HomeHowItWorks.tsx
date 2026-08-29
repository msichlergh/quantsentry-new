"use client";

import {
  ArrowUpRight,
  Database,
  Lightning,
  SquaresFour,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { HomeDataPattern } from "./HomeDataPattern";
import { HomeHowItWorksVisual } from "./HomeHowItWorksVisual";

const steps = [
  {
    icon: Database,
    tab: "Connect Data",
    title: "Connect Every Source",
    description:
      "Bring trading, payment, identity, customer, marketing and operational data into one governed platform.",
    visual: 0,
    cta: "Explore Data Connectivity",
    href: "/platform",
  },
  {
    icon: SquaresFour,
    tab: "Find Insights",
    title: "Build Intelligence Around Your Business",
    description:
      "Turn verified data into custom views, benchmarks, monitoring and analysis shaped around how your business operates.",
    visual: 1,
    cta: "Explore Business Intelligence",
    href: "/custom-bi",
  },
  {
    icon: Lightning,
    tab: "Take Action",
    title: "Act on What Matters",
    description:
      "Use Argus AI and clear recommendations to reduce risk, improve performance and grow more profitably.",
    visual: 2,
    cta: "Meet Argus AI",
    href: "/argus",
  },
] as const;

export function HomeHowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const active = steps[activeIndex];
  const ActiveIcon = active.icon;

  const stopRotation = () => {
    if (intervalRef.current === null) return;
    window.clearInterval(intervalRef.current);
    intervalRef.current = null;
  };

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || intervalRef.current !== null) return;
        intervalRef.current = window.setInterval(() => {
          setActiveIndex((index) => (index + 1) % steps.length);
        }, 5200);
      },
      { rootMargin: "0px 0px -15%", threshold: 0.28 },
    );

    observer.observe(section);
    return () => {
      observer.disconnect();
      stopRotation();
    };
  }, []);

  const selectStep = (index: number) => {
    stopRotation();
    setActiveIndex(index);
  };

  useEffect(() => {
    const tabs = tabsRef.current;
    const activeTab = tabs?.querySelector<HTMLElement>(".is-active");
    if (!tabs || !activeTab) return;

    const tabsRect = tabs.getBoundingClientRect();
    const activeTabRect = activeTab.getBoundingClientRect();
    tabs.scrollTo({
      behavior: "smooth",
      left: tabs.scrollLeft + activeTabRect.left - tabsRect.left - (tabsRect.width - activeTabRect.width) / 2,
    });
  }, [activeIndex]);

  return (
    <section
      className="home-how-it-works home-data-section theme-light"
      aria-labelledby="home-how-title"
      id="how-it-works"
      ref={sectionRef}
    >
      <HomeDataPattern />
      <div className="wrap">
        <div className="home-how-heading">
          <div className="kicker home-how-kicker"><span className="dot" /><span>From Data to Action</span></div>
          <h2 id="home-how-title">How QuantSentry <span className="c">Works.</span></h2>
          <p className="lede">
            QuantSentry unifies your systems, builds intelligence around your business,
            and continuously surfaces the risks and opportunities that matter.
          </p>
        </div>

        <div className="home-how-showcase">
          <div className="horizontal-control-shell">
            <div className="home-how-tabs" aria-label="How QuantSentry works" ref={tabsRef} role="tablist">
              {steps.map(({ icon: Icon, tab }, index) => (
                <button
                  aria-controls="home-how-panel"
                  aria-selected={activeIndex === index}
                  className={activeIndex === index ? "is-active" : ""}
                  key={tab}
                  onClick={() => selectStep(index)}
                  role="tab"
                  type="button"
                >
                  <Icon size={17} weight="bold" />
                  <span>{tab}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="home-how-panel" id="home-how-panel" key={active.tab} role="tabpanel">
            <div className="home-how-panel-copy">
              <span className="home-how-icon" aria-hidden="true"><ActiveIcon size={22} /></span>
              <h3>{active.title}</h3>
              <p>{active.description}</p>
              <Link className="home-how-cta" href={active.href}>
                {active.cta}<ArrowUpRight size={15} weight="bold" />
              </Link>
            </div>

            <div className="home-how-visual">
              <HomeHowItWorksVisual step={active.visual} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
