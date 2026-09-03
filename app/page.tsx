import type { Metadata } from "next";

import { SitePage } from "@/components/SitePage";
import { pages } from "@/lib/pages";

import { JsonLd, breadcrumbNode } from "./_seo/jsonld";
import { buildMetadata } from "./_seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: pages.index.title,
  description: pages.index.description,
  path: "/",
});

export default function HomePage() {
  return (
    <>
      <JsonLd nodes={[breadcrumbNode([{ name: "Home", path: "/" }])]} />
      <SitePage slug="index" />
    </>
  );
}
