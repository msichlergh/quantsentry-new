import { readFileSync } from "node:fs";
import path from "node:path";

import { FooterCtaAurora } from "@/components/FooterCtaAurora";
import { HeroAurora } from "@/components/HeroAurora";
import { HeroPixelBlast } from "@/components/HeroPixelBlast";
import { HomeOverviewHero } from "@/components/HomeOverviewHero";
import { TeamSection } from "@/components/TeamSection";
import type { PageSlug } from "@/lib/pages";
import { executiveTeamGroups } from "@/lib/team";

type SitePageProps = {
  slug: PageSlug;
};

export function SitePage({ slug }: SitePageProps) {
  const contentPath = path.join(process.cwd(), "public", "content", `${slug}.html`);
  const html = readFileSync(contentPath, "utf8");
  const contentId = `page-content-${slug}`;

  if (slug === "index") {
    const [, afterLegacyHero = html] = html.split("<!-- homepage-hero-end -->");
    const [productSections, unifiedAndAfter = ""] = afterLegacyHero.split("<!-- homepage-unified-start -->");
    const [unifiedStory = "", closingSections = ""] = unifiedAndAfter.split("<!-- homepage-unified-end -->");

    return (
      <>
        <main id={contentId} className="page-content">
          <HomeOverviewHero />
          <div
            className="page-content-html"
            dangerouslySetInnerHTML={{ __html: `${productSections}${unifiedStory}${closingSections}` }}
          />
        </main>
        <HeroAurora targetId={contentId} />
        <FooterCtaAurora routeKey={slug} />
      </>
    );
  }

  if (slug === "company") {
    const [beforeTeam, afterTeam] = html.split("<!-- team-slot -->");

    return (
      <>
        <main className="page-content">
          <div id={contentId} className="page-content-html" dangerouslySetInnerHTML={{ __html: beforeTeam }} />
          <TeamSection
            description="The Quant Technology Group leadership team behind the engineering, research, operations, and company direction that support QuantSentry."
            eyebrow="Executive Team"
            heading="The team behind QuantSentry."
            groups={executiveTeamGroups}
          />
          <div className="page-content-html" dangerouslySetInnerHTML={{ __html: afterTeam }} />
        </main>
        <HeroPixelBlast targetId={contentId} />
        <FooterCtaAurora routeKey={slug} />
      </>
    );
  }

  return (
    <>
      <main id={contentId} className="page-content" dangerouslySetInnerHTML={{ __html: html }} />
      <HeroPixelBlast targetId={contentId} />
      <FooterCtaAurora routeKey={slug} />
    </>
  );
}
