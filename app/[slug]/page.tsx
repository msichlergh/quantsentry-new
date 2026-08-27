import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SitePage } from "@/components/SitePage";
import { pages, type PageSlug } from "@/lib/pages";

type PageProps = {
  params: Promise<{ slug: string }>;
};

// "index" is served by app/page.tsx and "demo" by app/demo/page.tsx.
const OWN_ROUTES = new Set(["index", "demo"]);

function isPageSlug(slug: string): slug is PageSlug {
  return slug in pages && !OWN_ROUTES.has(slug);
}

export function generateStaticParams() {
  return Object.keys(pages)
    .filter((slug) => !OWN_ROUTES.has(slug))
    .map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  if (!isPageSlug(slug)) {
    return {};
  }

  return {
    title: { absolute: pages[slug].title },
    description: pages[slug].description,
  };
}

export default async function ContentPage({ params }: PageProps) {
  const { slug } = await params;

  if (!isPageSlug(slug)) {
    notFound();
  }

  return <SitePage slug={slug} />;
}
