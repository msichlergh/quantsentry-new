import type { MetadataRoute } from "next";

import { insightArticles, insightAuthors } from "@/lib/insights";
import { pages, type PageSlug } from "@/lib/pages";

import { absoluteUrl } from "./_seo/site";

type Frequency = NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;
type Weight = { priority: number; changeFrequency: Frequency };

/**
 * Crawl weighting for the static marketing pages.
 *
 * Deliberately `Partial`: a page added to `lib/pages.ts` by another route
 * still lands in the sitemap, on the default weight below, rather than being
 * silently dropped from it.
 */
const STATIC_WEIGHTS: Partial<Record<PageSlug, Weight>> = {
  platform: { priority: 0.9, changeFrequency: "monthly" },
  pricing: { priority: 0.9, changeFrequency: "monthly" },
  demo: { priority: 0.9, changeFrequency: "monthly" },
  argus: { priority: 0.8, changeFrequency: "monthly" },
  network: { priority: 0.8, changeFrequency: "monthly" },
  "managed-desk": { priority: 0.8, changeFrequency: "monthly" },
  "custom-bi": { priority: 0.8, changeFrequency: "monthly" },
  "industry-intelligence": { priority: 0.8, changeFrequency: "monthly" },
  integrations: { priority: 0.8, changeFrequency: "monthly" },
  proof: { priority: 0.8, changeFrequency: "monthly" },
  compare: { priority: 0.8, changeFrequency: "monthly" },
  "industries-prop-trading": { priority: 0.8, changeFrequency: "monthly" },
  "industries-brokerages": { priority: 0.7, changeFrequency: "monthly" },
  "industries-funds": { priority: 0.7, changeFrequency: "monthly" },
  "industries-payments": { priority: 0.7, changeFrequency: "monthly" },
  industries: { priority: 0.7, changeFrequency: "monthly" },
  company: { priority: 0.6, changeFrequency: "monthly" },
  roadmap: { priority: 0.6, changeFrequency: "monthly" },
  diagnostic: { priority: 0.6, changeFrequency: "monthly" },
};

const DEFAULT_WEIGHT: Weight = { priority: 0.6, changeFrequency: "monthly" };

function newestArticleDate(slugs: readonly string[]): string | undefined {
  return slugs.length > 0 ? slugs.toSorted().at(-1) : undefined;
}

/**
 * `lastModified` is only set where the repo holds a real date.
 *
 * The marketing pages carry no modification timestamp anywhere in the
 * codebase, and stamping them with the build date would republish a fresh
 * `<lastmod>` on every deploy — a signal Google learns to ignore. Omitting it
 * is the honest option; add it here the day the content gets real timestamps.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const articleDates = insightArticles.map((article) => article.publishedAt);
  const latestInsight = newestArticleDate(articleDates);

  const home: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
  ];

  const staticPages: MetadataRoute.Sitemap = (Object.keys(pages) as PageSlug[])
    // "index" is the home route above; it has no `/index` URL.
    .filter((slug) => slug !== "index")
    .toSorted()
    .map((slug) => ({
      url: absoluteUrl(`/${slug}`),
      ...(STATIC_WEIGHTS[slug] ?? DEFAULT_WEIGHT),
    }));

  const insightsIndex: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/insights"),
      ...(latestInsight ? { lastModified: latestInsight } : {}),
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  const articles: MetadataRoute.Sitemap = insightArticles
    .toSorted((left, right) => right.publishedAt.localeCompare(left.publishedAt))
    .map((article) => ({
      url: absoluteUrl(`/insights/${article.slug}`),
      lastModified: article.publishedAt,
      changeFrequency: "yearly" as const,
      priority: 0.6,
    }));

  const authors: MetadataRoute.Sitemap = insightAuthors.map((author) => {
    const authored = insightArticles
      .filter((article) => article.authorSlug === author.slug)
      .map((article) => article.publishedAt);
    const lastModified = newestArticleDate(authored);

    return {
      url: absoluteUrl(`/insights/author-${author.slug}`),
      ...(lastModified ? { lastModified } : {}),
      changeFrequency: "monthly" as const,
      priority: 0.4,
    };
  });

  // `/legal` is a permanent redirect to `/privacy` and is intentionally absent:
  // a sitemap should only list URLs that return 200.
  const legal: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/privacy"), changeFrequency: "yearly", priority: 0.3 },
    { url: absoluteUrl("/terms"), changeFrequency: "yearly", priority: 0.3 },
  ];

  return [...home, ...staticPages, ...insightsIndex, ...articles, ...authors, ...legal];
}
