import { readFileSync } from "node:fs";
import path from "node:path";

import { TeamSection } from "@/components/TeamSection";
import type { PageSlug } from "@/lib/pages";
import { executiveTeamGroups } from "@/lib/team";

type SitePageProps = {
  slug: PageSlug;
};

export function SitePage({ slug }: SitePageProps) {
  const contentPath = path.join(process.cwd(), "public", "content", `${slug}.html`);
  const html = readFileSync(contentPath, "utf8");

  if (slug === "company") {
    const [beforeTeam, afterTeam] = html.split("<!-- team-slot -->");

    return (
      <main className="page-content">
        <div className="page-content-html" dangerouslySetInnerHTML={{ __html: beforeTeam }} />
        <TeamSection
          description="The Quant Technology Group leadership team behind the engineering, research, operations, and company direction that support QuantSentry."
          eyebrow="Executive Team"
          heading="The team behind QuantSentry."
          groups={executiveTeamGroups}
        />
        <div className="page-content-html" dangerouslySetInnerHTML={{ __html: afterTeam }} />
      </main>
    );
  }

  return <main className="page-content" dangerouslySetInnerHTML={{ __html: html }} />;
}
