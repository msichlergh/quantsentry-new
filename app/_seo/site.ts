/**
 * The single source of truth for every machine-readable string on the site.
 *
 * Nothing else may hard-code the brand suffix, the production origin, the
 * locale or the character budgets. `<title>`, `og:title` and `twitter:title`
 * all resolve through `clampTitle` here, so they cannot drift apart.
 *
 * Budgets (see the failure modes this guards against):
 *   title            <= 60   Google truncates the SERP link around ~600px
 *   og:title         <= 60   the same string is reused for the social card
 *   og:description   <= 120  X / LinkedIn / Discord clip well before 160
 *   meta description <= 160  Google's snippet budget
 */

export const SITE_URL = "https://quantsentry.com";
export const SITE_NAME = "QuantSentry";
export const BRAND_SUFFIX = ` | ${SITE_NAME}`;

/** `og:locale` uses the underscore form; `<html lang>` uses the hyphen form. */
export const OG_LOCALE = "en_GB";
export const HTML_LANG = "en-GB";

/**
 * `twitter:site` is deliberately null.
 *
 * QuantSentry has no verified X handle anywhere in this codebase, and an
 * invented handle points the card's attribution at somebody else's account.
 * Set this to the real `@handle` once it exists and every page picks it up.
 */
export const TWITTER_SITE: string | null = null;

/**
 * The site-wide social card, declared explicitly.
 *
 * `app/opengraph-image.tsx` injects this automatically — but only into routes
 * in its own segment. Next.js merges `openGraph` shallowly and *replaces* the
 * whole object at the deepest segment that defines one, and every page sets
 * its own `og:title`, so the inherited image was being dropped on every route
 * except `/`. Carrying it here means the tags cannot go missing again.
 *
 * `width`/`height`/`type`/`alt` are all mandatory: without the dimensions,
 * Slack and LinkedIn render the card as a small square thumbnail.
 *
 * Bump `OG_IMAGE_VERSION` after a card redesign to push it past the social
 * platforms' image caches.
 */
export const OG_IMAGE_VERSION = "1";
export const OG_IMAGE = {
  url: `/opengraph-image?v=${OG_IMAGE_VERSION}`,
  width: 1200,
  height: 630,
  type: "image/png",
  alt: "QuantSentry — the data intelligence layer for trading businesses",
} as const;

export const TITLE_MAX = 60;
export const OG_DESCRIPTION_MAX = 120;
export const META_DESCRIPTION_MAX = 160;

/** Brand palette, mirrored from `app/globals.css` `:root` for the OG cards. */
export const BRAND = {
  bg: "#080a0b",
  panel: "#101416",
  hair: "#272e30",
  ink: "#f4f8f7",
  ink2: "#d4dada",
  ink3: "#99a3a4",
  ink4: "#747f80",
  cyan: "#48c7c3",
} as const;

/**
 * Word-safe truncation. Cuts on a word boundary and appends an ellipsis so a
 * clipped string never ends mid-word, and never exceeds `max` including the
 * ellipsis.
 */
export function clamp(value: string, max: number): string {
  const text = value.trim().replace(/\s+/g, " ");
  if (text.length <= max) return text;

  const head = text.slice(0, max - 1);
  const lastSpace = head.lastIndexOf(" ");
  const cut = lastSpace > max * 0.5 ? head.slice(0, lastSpace) : head;
  return `${cut.replace(/[\s,;:.–—-]+$/, "")}…`;
}

/**
 * Resolves a page title to the exact string that ships in `<title>`,
 * `og:title` and `twitter:title`.
 *
 * The brand suffix is appended only when the result still fits the budget, so
 * a long page title is never pushed over the SERP cut by branding. A title
 * that already carries the brand (every entry in `lib/pages.ts` does) is left
 * alone rather than suffixed twice.
 */
export function clampTitle(title: string): string {
  const base = title.trim().replace(/\s+/g, " ");
  if (base.includes(SITE_NAME)) return clamp(base, TITLE_MAX);

  const branded = `${base}${BRAND_SUFFIX}`;
  if (branded.length <= TITLE_MAX) return branded;
  return clamp(base, TITLE_MAX);
}

/**
 * Explicit SERP titles for content whose editorial title does not fit the
 * 60-char budget. Clamping would truncate mid-thought, so the title is
 * tightened by hand instead — the `<h1>` on the page keeps the full wording.
 *
 * Keyed by content slug. Keep this list short; it exists because a title is
 * over budget, not as a general rewriting layer.
 */
export const SEO_TITLE_OVERRIDES: Record<string, string> = {
  // Editorial title is 64 chars; + " | QuantSentry" it rendered at 78.
  // "Businesses" -> "Firms" holds the meaning and lands at 58.
  "ai-agents-reduce-support-workload":
    "How AI Agents Can Reduce Support Workload for Trading Firms",
};

export function seoTitle(slug: string, fallback: string): string {
  return SEO_TITLE_OVERRIDES[slug] ?? fallback;
}

export function clampMetaDescription(description: string): string {
  return clamp(description, META_DESCRIPTION_MAX);
}

export function clampOgDescription(description: string): string {
  return clamp(description, OG_DESCRIPTION_MAX);
}

/**
 * Normalises a route path to the canonical form: leading slash, no trailing
 * slash, and — critically — no query string.
 *
 * `lib/lead-client.ts` reads a `?cc=` parameter off the page URL, so
 * `/demo?cc=DE` is a linkable, crawlable duplicate of `/demo`. Every canonical
 * is built from the path alone, which folds those duplicates back.
 */
export function canonicalPath(path: string): string {
  const withoutQuery = path.split(/[?#]/)[0];
  if (!withoutQuery || withoutQuery === "/") return "/";
  const withLeading = withoutQuery.startsWith("/") ? withoutQuery : `/${withoutQuery}`;
  return withLeading.replace(/\/+$/, "") || "/";
}

/** Absolute URL for a route path, for JSON-LD `@id` and sitemap entries. */
export function absoluteUrl(path: string): string {
  const canonical = canonicalPath(path);
  return canonical === "/" ? `${SITE_URL}/` : `${SITE_URL}${canonical}`;
}
