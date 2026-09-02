import {
  Brain,
  Database,
  Repeat,
} from "@phosphor-icons/react/dist/ssr";

import { HomeDataPattern } from "./HomeDataPattern";

const gaps = [
  {
    icon: Database,
    eyebrow: "Disconnected Data",
    title: "The facts are split across systems",
    description:
      "Trading, payment and CRM systems each show part of the story. Your team has to bring the pieces together before it can answer a question.",
  },
  {
    icon: Repeat,
    eyebrow: "Repeated Setup",
    title: "Your team explains the same context again",
    description:
      "Most AI tools do not know your metrics, policies or definitions. Repeating them for every question slows the work and can change the answer.",
  },
  {
    icon: Brain,
    eyebrow: "Lost Knowledge",
    title: "Useful work gets lost",
    description:
      "Evidence and past decisions stay scattered across tools and people. The next review often starts without what the team learned before.",
  },
] as const;

export function IntelligenceGapSection() {
  return (
    <section className="intelligence-gap-section home-data-section theme-light" aria-labelledby="intelligence-gap-title">
      <HomeDataPattern />
      <div className="wrap">
        <div className="intelligence-gap-heading">
          <div className="kicker intelligence-gap-kicker"><span className="dot" /><span>The Gap</span></div>
          <h2 id="intelligence-gap-title">
            Disconnected Data <span className="c">Slows Every Decision.</span>
          </h2>
          <p className="lede">Argus brings your data, definitions and past work together so each answer starts with the right context.</p>
        </div>

        <div className="intelligence-gap-grid">
          {gaps.map(({ description, eyebrow, icon: Icon, title }) => (
            <article className="intelligence-gap-card" key={eyebrow}>
              <div className="intelligence-gap-card-label"><Icon size={17} weight="bold" /><span>{eyebrow}</span></div>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
