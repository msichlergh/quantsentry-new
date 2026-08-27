import {
  Brain,
  Database,
  Repeat,
} from "@phosphor-icons/react/dist/ssr";

import { HomeDataPattern } from "./HomeDataPattern";

const gaps = [
  {
    icon: Database,
    eyebrow: "Disconnected Sources",
    title: "The numbers and the reasons live apart",
    description:
      "Trading, payments and CRM systems show what happened. Policies, conversations and operating context explain why. Without one layer, every investigation starts with manual joins.",
  },
  {
    icon: Repeat,
    eyebrow: "Repeated Context",
    title: "Your team has to explain the business again",
    description:
      "Generic AI does not know how you define exposure, kept revenue or a clean payout. Rebuilding that meaning in every prompt slows the work and changes the answer.",
  },
  {
    icon: Brain,
    eyebrow: "Lost Memory",
    title: "Each answer forgets the work before it",
    description:
      "Evidence and investigation methods stay scattered across systems and people. The next decision arrives without the benefit of the decisions that came before it.",
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
            Fragmented Data <span className="c">Limits Intelligence.</span>
          </h2>
          <p className="lede">Your systems hold the facts. Your team holds the meaning. Argus brings both into one verified operating memory.</p>
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
