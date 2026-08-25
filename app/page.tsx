import type { Metadata } from "next";

import { SitePage } from "@/components/SitePage";
import { pages } from "@/lib/pages";

export const metadata: Metadata = {
  title: { absolute: pages.index.title },
  description: pages.index.description,
};

export default function HomePage() {
  return <SitePage slug="index" />;
}
