"use client";

import { ArrowLeft, ArrowRight } from "@phosphor-icons/react";
import { useCallback, useEffect, useRef, useState } from "react";

import { InsightCard, type InsightCardArticle } from "@/components/InsightCard";

type HomeInsightsSliderProps = {
  articles: readonly InsightCardArticle[];
};

export function HomeInsightsSlider({ articles }: HomeInsightsSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollBack, setCanScrollBack] = useState(false);
  const [canScrollForward, setCanScrollForward] = useState(true);

  const updateControls = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    setCanScrollBack(track.scrollLeft > 2);
    setCanScrollForward(track.scrollLeft + track.clientWidth < track.scrollWidth - 2);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    updateControls();
    const resizeObserver = new ResizeObserver(updateControls);
    resizeObserver.observe(track);
    track.addEventListener("scroll", updateControls, { passive: true });

    return () => {
      resizeObserver.disconnect();
      track.removeEventListener("scroll", updateControls);
    };
  }, [updateControls]);

  const move = (direction: -1 | 1) => {
    const track = trackRef.current;
    const card = track?.querySelector<HTMLElement>(".insight-card");
    if (!track || !card) return;

    const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0;
    track.scrollBy({ behavior: "smooth", left: direction * (card.offsetWidth + gap) });
  };

  return (
    <section className="home-insights-section theme-light" aria-labelledby="home-insights-title">
      <div className="wrap">
        <div className="home-insights-heading">
          <div>
            <div className="kicker"><span className="dot" /><span>News &amp; Insights</span></div>
            <h2 id="home-insights-title">Latest From <span className="c">QuantSentry.</span></h2>
          </div>
          <div className="home-insights-actions">
            <a className="btn ghost" href="/insights"><span>View All Insights</span></a>
            <div className="home-insights-controls" aria-label="Insights slider controls" role="group">
              <button
                aria-label="Show previous insight"
                disabled={!canScrollBack}
                onClick={() => move(-1)}
                type="button"
              >
                <ArrowLeft aria-hidden="true" size={17} />
              </button>
              <button
                aria-label="Show next insight"
                disabled={!canScrollForward}
                onClick={() => move(1)}
                type="button"
              >
                <ArrowRight aria-hidden="true" size={17} />
              </button>
            </div>
          </div>
        </div>

        <div className="home-insights-track" ref={trackRef}>
          {articles.map((article) => (
            <InsightCard article={article} key={article.slug} />
          ))}
        </div>
      </div>
    </section>
  );
}
