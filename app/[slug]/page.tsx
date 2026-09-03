import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SitePage } from "@/components/SitePage";
import { pages, type PageSlug } from "@/lib/pages";

import { JsonLd, breadcrumbNode, softwareApplicationNode, type Crumb } from "../_seo/jsonld";
import { buildMetadata } from "../_seo/metadata";
import { BRAND_SUFFIX } from "../_seo/site";

type PageProps = {
  params: Promise<{ slug: string }>;
};

// "index" is served by app/page.tsx and "demo" by app/demo/page.tsx.
const OWN_ROUTES = new Set(["index", "demo"]);

/**
 * The four industry pages live at flat URLs but the site's own navigation
 * groups them under /industries, and that page exists. Mirroring that in the
 * breadcrumb is what Google renders in the SERP.
 */
const INDUSTRY_PARENT: Crumb = { name: "Industries", path: "/industries" };
const PARENT_CRUMBS: Partial<Record<PageSlug, readonly Crumb[]>> = {
  "industries-prop-trading": [INDUSTRY_PARENT],
  "industries-brokerages": [INDUSTRY_PARENT],
  "industries-funds": [INDUSTRY_PARENT],
  "industries-payments": [INDUSTRY_PARENT],
};

function isPageSlug(slug: string): slug is PageSlug {
  return slug in pages && !OWN_ROUTES.has(slug);
}

/** "Argus AI | QuantSentry" -> "Argus AI", for breadcrumb labels. */
function pageLabel(slug: PageSlug): string {
  return pages[slug].title.replace(BRAND_SUFFIX, "").trim();
}

export function generateStaticParams() {
  return Object.keys(pages)
    .filter((slug) => !OWN_ROUTES.has(slug))
    .map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  if (!isPageSlug(slug)) {
    // Unknown slugs render the 404 below; keep them out of the index.
    return { robots: { index: false, follow: false } };
  }

  return buildMetadata({
    title: pages[slug].title,
    description: pages[slug].description,
    path: `/${slug}`,
  });
}

export default async function ContentPage({ params }: PageProps) {
  const { slug } = await params;

  if (!isPageSlug(slug)) {
    notFound();
  }

  const crumbs: Crumb[] = [
    { name: "Home", path: "/" },
    ...(PARENT_CRUMBS[slug] ?? []),
    { name: pageLabel(slug), path: `/${slug}` },
  ];

  return (
    <>
      <JsonLd
        nodes={
          slug === "pricing"
            ? [breadcrumbNode(crumbs), softwareApplicationNode()]
            : [breadcrumbNode(crumbs)]
        }
      />
      <SitePage slug={slug} />
    </>
  );
}
