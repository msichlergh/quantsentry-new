"use client";

import { useEffect, useRef, useState } from "react";

import { InsightCard } from "@/components/InsightCard";
import {
  insightCategories,
  type InsightArticle,
  type InsightCategory,
} from "@/lib/insights";

type Filter = "All" | InsightCategory;

export function InsightsGrid({ articles }: { articles: readonly InsightArticle[] }) {
  const [filter, setFilter] = useState<Filter>("All");
  const filtersRef = useRef<HTMLDivElement>(null);
  const visibleArticles =
    filter === "All" ? articles : articles.filter((article) => article.category === filter);

  useEffect(() => {
    const filters = filtersRef.current;
    const activeFilter = filters?.querySelector<HTMLElement>(".is-active");
    if (!filters || !activeFilter) return;

    const filtersRect = filters.getBoundingClientRect();
    const activeFilterRect = activeFilter.getBoundingClientRect();
    filters.scrollTo({
      behavior: "smooth",
      left: filters.scrollLeft + activeFilterRect.left - filtersRect.left - (filtersRect.width - activeFilterRect.width) / 2,
    });
  }, [filter]);

  return (
    <>
      <div className="horizontal-control-shell">
        <div className="insight-filters" aria-label="Filter insights by category" ref={filtersRef}>
          {(["All", ...insightCategories] as const).map((category) => (
            <button
              aria-pressed={filter === category}
              className={filter === category ? "is-active" : undefined}
              key={category}
              onClick={() => setFilter(category)}
              type="button"
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="insights-grid" aria-live="polite">
        {visibleArticles.map((article) => (
          <InsightCard article={article} key={article.slug} />
        ))}
      </div>
    </>
  );
}
