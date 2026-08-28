import { readFileSync } from "node:fs";
import path from "node:path";

import { CompanyGroupSection } from "@/components/CompanyGroupSection";
import { ArgusEverywhereSection } from "@/components/ArgusEverywhereSection";
import { FooterCtaAurora } from "@/components/FooterCtaAurora";
import { HeroAurora } from "@/components/HeroAurora";
import { HeroPixelBlast } from "@/components/HeroPixelBlast";
import { HomeAlwaysOnIntelligence } from "@/components/HomeAlwaysOnIntelligence";
import { HomeArgusMissions } from "@/components/HomeArgusMissions";
import { HomeCapabilityShowcase } from "@/components/HomeCapabilityShowcase";
import { HomeHowItWorks } from "@/components/HomeHowItWorks";
import { HomeOverviewHero } from "@/components/HomeOverviewHero";
import { HomeWaysToWork } from "@/components/HomeWaysToWork";
import { IntelligenceGapSection } from "@/components/IntelligenceGapSection";
import { IntegrationsDirectory } from "@/components/IntegrationsDirectory";
import { MobileComparison } from "@/components/MobileComparison";
import { MobileLegacyEnhancer } from "@/components/MobileLegacyEnhancer";
import { TeamSection } from "@/components/TeamSection";
import { TeamInsightsSection } from "@/components/TeamInsightsSection";
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
    const extractSection = (start: string, end: string) => html.split(start)[1]?.split(end)[0] ?? "";
    const industries = extractSection("<!-- homepage-industries-start -->", "<!-- homepage-industries-end -->");
    const proof = extractSection("<!-- homepage-proof-start -->", "<!-- homepage-proof-end -->");
    const finalCta = extractSection("<!-- homepage-final-cta-start -->", "<!-- homepage-final-cta-end -->");

    return (
      <>
        <main id={contentId} className="page-content">
          <HomeOverviewHero />
          <HomeHowItWorks />
          <HomeAlwaysOnIntelligence />
          <TeamInsightsSection />
          <HomeCapabilityShowcase />
          <HomeWaysToWork />
          <ArgusEverywhereSection />
          <HomeArgusMissions />
          <div
            className="page-content-html"
            dangerouslySetInnerHTML={{ __html: `${industries}${proof}${finalCta}` }}
          />
        </main>
        <HeroAurora targetId={contentId} />
        <FooterCtaAurora routeKey={slug} />
      </>
    );
  }

  if (slug === "argus") {
    const [beforeGap, afterGap] = html.split("<!-- intelligence-gap-slot -->");

    return (
      <>
        <main id={contentId} className="page-content">
          <div className="page-content-html" dangerouslySetInnerHTML={{ __html: beforeGap }} />
          <IntelligenceGapSection />
          <div className="page-content-html" dangerouslySetInnerHTML={{ __html: afterGap }} />
        </main>
        <HeroPixelBlast targetId={contentId} />
        <FooterCtaAurora routeKey={slug} />
      </>
    );
  }

  if (slug === "company") {
    const [beforeTeam, afterTeam] = html.split("<!-- team-slot -->");
    const [beforeGroup, afterGroup] = beforeTeam.split("<!-- company-group-slot -->");

    return (
      <>
        <main className="page-content">
          <div id={contentId} className="page-content-html" dangerouslySetInnerHTML={{ __html: beforeGroup }} />
          <CompanyGroupSection />
          <div className="page-content-html" dangerouslySetInnerHTML={{ __html: afterGroup }} />
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

  if (slug === "platform") {
    const beforeInsights = html.split("<!-- team-insights-start -->")[0];
    const afterInsights = html.split("<!-- team-insights-end -->")[1] ?? "";

    return (
      <>
        <main id={contentId} className="page-content">
          <div className="page-content-html" dangerouslySetInnerHTML={{ __html: beforeInsights }} />
          <TeamInsightsSection />
          <ArgusEverywhereSection />
          <div className="page-content-html" dangerouslySetInnerHTML={{ __html: afterInsights }} />
          <MobileLegacyEnhancer targetId={contentId} />
        </main>
        <HeroPixelBlast targetId={contentId} />
        <FooterCtaAurora routeKey={slug} />
      </>
    );
  }

  if (slug === "integrations") {
    const [beforeDirectory, afterDirectory] = html.split("<!-- integrations-directory-slot -->");

    return (
      <>
        <main id={contentId} className="page-content">
          <div className="page-content-html" dangerouslySetInnerHTML={{ __html: beforeDirectory }} />
          <IntegrationsDirectory />
          <div className="page-content-html" dangerouslySetInnerHTML={{ __html: afterDirectory }} />
        </main>
        <HeroPixelBlast targetId={contentId} />
        <FooterCtaAurora routeKey={slug} />
      </>
    );
  }

  if (slug === "compare") {
    const legendMarker = '<div class="row" style="gap:18px;margin-top:16px;flex-wrap:wrap">';
    const mobileComparisonId = "mobile-comparison-slot";
    const compareHtml = html.replace(legendMarker, `<div id="${mobileComparisonId}"></div>${legendMarker}`);

    return (
      <>
        <main id={contentId} className="page-content" dangerouslySetInnerHTML={{ __html: compareHtml }} />
        <MobileComparison targetId={mobileComparisonId} />
        <HeroPixelBlast targetId={contentId} />
        <FooterCtaAurora routeKey={slug} />
      </>
    );
  }

  if (slug === "custom-bi" || slug === "industries-prop-trading") {
    return (
      <>
        <main id={contentId} className="page-content" dangerouslySetInnerHTML={{ __html: html }} />
        <MobileLegacyEnhancer targetId={contentId} />
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
