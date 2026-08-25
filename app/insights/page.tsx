import type { Metadata } from "next";

import { HeroPixelBlast } from "@/components/HeroPixelBlast";
import { InsightsGrid } from "@/components/InsightsGrid";
import { insightArticles } from "@/lib/insights";

export const metadata: Metadata = {
  title: "Insights",
  description:
    "QuantSentry news, product updates, event recaps, and operator-grade perspectives on risk and trading intelligence.",
};

export default function InsightsPage() {
  const contentId = "page-content-insights";
  const articles = insightArticles.toSorted((left, right) =>
    right.publishedAt.localeCompare(left.publishedAt),
  );

  return (
    <>
      <main id={contentId} className="page-content insights-page">
        <section className="hero dots insights-hero">
          <div className="wrap">
            <div className="kicker">
              <span className="dot" />
              <span>News &amp; Insights</span>
            </div>
            <h1>What we are learning from the risk layer.</h1>
            <p className="lede">
              Product updates, company news, event notes, and practical analysis for the people
              operating modern trading businesses.
            </p>
          </div>
        </section>

        <section className="theme-light insights-latest">
          <div className="wrap">
            <InsightsGrid articles={articles} />
          </div>
        </section>
      </main>
      <HeroPixelBlast targetId={contentId} />
    </>
  );
}
