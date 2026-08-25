"use client";

import { useState } from "react";

import { InsightCard } from "@/components/InsightCard";
import {
  insightCategories,
  type InsightArticle,
  type InsightCategory,
} from "@/lib/insights";

type Filter = "All" | InsightCategory;

export function InsightsGrid({ articles }: { articles: readonly InsightArticle[] }) {
  const [filter, setFilter] = useState<Filter>("All");
  const visibleArticles =
    filter === "All" ? articles : articles.filter((article) => article.category === filter);

  return (
    <>
      <div className="insight-filters" aria-label="Filter insights by category">
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

      <div className="insights-grid" aria-live="polite">
        {visibleArticles.map((article) => (
          <InsightCard article={article} key={article.slug} />
        ))}
      </div>
    </>
  );
}
