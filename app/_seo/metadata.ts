import type { Metadata } from "next";

import {
  OG_IMAGE,
  OG_LOCALE,
  SITE_NAME,
  TWITTER_SITE,
  canonicalPath,
  clampMetaDescription,
  clampOgDescription,
  clampTitle,
} from "./site";

type BuildMetadataInput = {
  /** The page title, unbranded. `clampTitle` adds the suffix if it fits. */
  title: string;
  description: string;
  /** Route path, e.g. `/pricing`. Query strings are stripped. */
  path: string;
  /** `website` for everything except an article body. */
  type?: "website" | "article" | "profile";
  /** ISO date, articles only. */
  publishedTime?: string;
  /** Author display names, articles only. */
  authors?: readonly string[];
  robots?: Metadata["robots"];
};

/**
 * The one chokepoint every route's metadata goes through.
 *
 * Next.js merges `openGraph` shallowly and replaces the whole object at the
 * deepest segment that defines it, so a route that hand-rolls its own
 * `openGraph` silently loses `og:site_name`, `og:locale` and `og:type` from
 * the root layout. Routing every page through here makes that impossible.
 *
 * `og:image` is set explicitly rather than left to the `opengraph-image.tsx`
 * file convention. That convention only injects into routes in its own
 * segment, so the root card was reaching `/` and nothing else. Routes that DO
 * have a same-segment card — `/` and `/insights/[slug]` — have the file
 * convention override these values with their own, which is the intent.
 */
export function buildMetadata({
  title,
  description,
  path,
  type = "website",
  publishedTime,
  authors,
  robots,
}: BuildMetadataInput): Metadata {
  const resolvedTitle = clampTitle(title);
  const canonical = canonicalPath(path);

  return {
    title: { absolute: resolvedTitle },
    description: clampMetaDescription(description),
    alternates: { canonical },
    openGraph: {
      title: resolvedTitle,
      description: clampOgDescription(description),
      url: canonical,
      siteName: SITE_NAME,
      locale: OG_LOCALE,
      type,
      ...(type === "article" && publishedTime ? { publishedTime } : {}),
      ...(type === "article" && authors ? { authors: [...authors] } : {}),
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: resolvedTitle,
      description: clampOgDescription(description),
      images: [OG_IMAGE],
      ...(TWITTER_SITE ? { site: TWITTER_SITE } : {}),
    },
    // Opt in to large SERP thumbnails and untruncated snippets. Set here
    // rather than on the root layout so the 404 page never inherits an
    // `index, follow` that contradicts its own `noindex`.
    robots: robots ?? {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}
