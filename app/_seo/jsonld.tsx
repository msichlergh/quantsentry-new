import { SITE_NAME, absoluteUrl } from "./site";

/**
 * Structured data for the site.
 *
 * Every field below is read from data that already exists in the repo and is
 * visible on the rendered page. Nothing here is invented. In particular:
 *
 *   - No `aggregateRating` — the site publishes no ratings.
 *   - No `offers` / `price` on the pricing page — pricing is quote-based
 *     ("We would rather quote you properly than publish a table"). Declaring
 *     an Offer without a real price, or inventing one, is structured-data
 *     spam. The cost is that the page is not eligible for the software-app
 *     rich result; that is the correct trade.
 *   - No `sameAs` on the Organization — there is no verified QuantSentry
 *     social profile anywhere in this codebase to point at.
 *   - No `SearchAction` on the WebSite — the site has no search endpoint.
 *   - No `dateModified` on articles — `lib/insights.ts` carries only
 *     `publishedAt`.
 */

type JsonLdNode = Record<string, unknown>;

/** Stable `@id` anchors so the graph resolves to one entity per thing. */
export const ORGANIZATION_ID = `${absoluteUrl("/")}#organization`;
export const WEBSITE_ID = `${absoluteUrl("/")}#website`;

const ORGANIZATION_DESCRIPTION =
  "Network based AI risk and business intelligence for modern trading businesses.";

export function organizationNode(): JsonLdNode {
  return {
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: SITE_NAME,
    url: absoluteUrl("/"),
    description: ORGANIZATION_DESCRIPTION,
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl("/images/quantsentry-icon-teal-coil-v2.png"),
      width: 159,
      height: 158,
    },
    parentOrganization: {
      "@type": "Organization",
      name: "Quant Technology Group",
      url: "https://quanttechnology.com",
    },
  };
}

export function webSiteNode(): JsonLdNode {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: SITE_NAME,
    url: absoluteUrl("/"),
    description: ORGANIZATION_DESCRIPTION,
    inLanguage: "en-GB",
    publisher: { "@id": ORGANIZATION_ID },
  };
}

export type Crumb = { name: string; path: string };

export function breadcrumbNode(crumbs: readonly Crumb[]): JsonLdNode {
  return {
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

export type PersonInput = {
  slug: string;
  name: string;
  role: string;
  bio: string;
  image: string;
  linkedIn: string;
};

export function personId(slug: string): string {
  return `${absoluteUrl(`/insights/author-${slug}`)}#person`;
}

export function personNode(author: PersonInput): JsonLdNode {
  return {
    "@type": "Person",
    "@id": personId(author.slug),
    name: author.name,
    jobTitle: author.role,
    description: author.bio,
    image: absoluteUrl(author.image),
    url: absoluteUrl(`/insights/author-${author.slug}`),
    sameAs: [author.linkedIn],
    worksFor: { "@id": ORGANIZATION_ID },
  };
}

/** "7 min read" -> "PT7M". Returns undefined when the string has no minutes. */
function readTimeToDuration(readTime: string): string | undefined {
  const minutes = /(\d+)\s*min/i.exec(readTime)?.[1];
  return minutes ? `PT${minutes}M` : undefined;
}

export type BlogPostingInput = {
  slug: string;
  title: string;
  summary: string;
  category: string;
  publishedAt: string;
  readTime: string;
  sourceUrl: string;
  author: PersonInput;
};

export function blogPostingNode(article: BlogPostingInput): JsonLdNode {
  const url = absoluteUrl(`/insights/${article.slug}`);
  const timeRequired = readTimeToDuration(article.readTime);

  return {
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    // Google caps `headline` at 110 characters; the longest title here is 64.
    headline: article.title,
    description: article.summary,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    datePublished: article.publishedAt,
    articleSection: article.category,
    inLanguage: "en-GB",
    // The OG card generated at /insights/<slug>/opengraph-image.
    image: [`${url}/opengraph-image`],
    // The `name` is repeated alongside the `@id` on purpose. The full Person
    // and Organization nodes are in the same @graph, but Google's Article
    // parser reports a missing `author.name` when it has to resolve the
    // reference. Repeating it costs nothing and removes the ambiguity.
    author: { "@id": personId(article.author.slug), name: article.author.name },
    publisher: { "@id": ORGANIZATION_ID, name: SITE_NAME },
    // The page itself states each edition is adapted from a QTG original.
    isBasedOn: article.sourceUrl,
    ...(timeRequired ? { timeRequired } : {}),
  };
}

export function softwareApplicationNode(): JsonLdNode {
  return {
    "@type": "SoftwareApplication",
    "@id": `${absoluteUrl("/")}#software`,
    name: SITE_NAME,
    url: absoluteUrl("/"),
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description:
      "Connect business data, detect trading abuse, build dashboards and use Argus AI from one platform.",
    featureList: [
      "Trading abuse detection",
      "Evidence kits",
      "Argus AI",
      "Business intelligence dashboards",
      "Sentry Risk Network",
    ],
    publisher: { "@id": ORGANIZATION_ID },
  };
}

/**
 * Server-rendered JSON-LD. `<` is escaped so a `</script>` sequence inside any
 * string value cannot break out of the script element.
 */
export function JsonLd({ nodes }: { nodes: readonly JsonLdNode[] }) {
  const payload =
    nodes.length === 1
      ? { "@context": "https://schema.org", ...nodes[0] }
      : { "@context": "https://schema.org", "@graph": nodes };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(payload).replace(/</g, "\\u003c"),
      }}
    />
  );
}
