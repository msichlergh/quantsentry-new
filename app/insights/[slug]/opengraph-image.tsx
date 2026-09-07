import { ImageResponse } from "next/og";

import { getInsightArticle, getInsightAuthor, insightArticles, insightAuthors } from "@/lib/insights";

import { OG_CONTENT_TYPE, OG_SIZE, ogFonts } from "../../_og/assets";
import { OgCard } from "../../_og/card";

/**
 * Per-article and per-author social cards.
 *
 * `generateStaticParams` in `page.tsx` enumerates every slug, so these are all
 * generated at build time. Every string comes from `lib/insights.ts`; a slug
 * that resolves to neither an article nor an author falls back to the generic
 * card rather than rendering an empty one.
 */

export const alt = "QuantSentry Insights";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

/**
 * A metadata image route does not inherit the page's `generateStaticParams`.
 * Without this the card is rendered on demand on every crawler hit — a fresh
 * satori render each time an unfurl comes in. Declaring the slugs here
 * prerenders all 11 cards at build time instead.
 */
export function generateStaticParams() {
  return [
    ...insightArticles.map((article) => ({ slug: article.slug })),
    ...insightAuthors.map((author) => ({ slug: `author-${author.slug}` })),
  ];
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  if (slug.startsWith("author-")) {
    const author = getInsightAuthor(slug.replace(/^author-/, ""));
    if (author) {
      return new ImageResponse(
        (
          <OgCard
            eyebrow="Insights"
            title={author.name}
            subtitle={author.bio}
            meta={author.role}
          />
        ),
        { ...size, fonts: ogFonts },
      );
    }
  }

  const article = getInsightArticle(slug);
  if (article) {
    const author = getInsightAuthor(article.authorSlug);
    return new ImageResponse(
      (
        <OgCard
          eyebrow={article.category}
          title={article.title}
          subtitle={article.summary}
          meta={author ? `${author.name} · ${article.publishedLabel}` : article.publishedLabel}
        />
      ),
      { ...size, fonts: ogFonts },
    );
  }

  return new ImageResponse(
    (
      <OgCard
        eyebrow="Insights"
        title="What we are learning from the risk layer."
        subtitle="Product updates, company news, event notes, and practical analysis for the people operating modern trading businesses."
      />
    ),
    { ...size, fonts: ogFonts },
  );
}
