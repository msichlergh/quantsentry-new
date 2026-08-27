import {
  ChartLineUp,
  Database,
  SquaresFour,
} from "@phosphor-icons/react/dist/ssr";

import { HomeDataPattern } from "./HomeDataPattern";

const steps = [
  {
    icon: Database,
    title: "Connect Every Source",
    description:
      "Ingest trading, payment, identity, customer, marketing and operational data into one governed platform.",
  },
  {
    icon: SquaresFour,
    title: "Build Your Intelligence",
    description:
      "Turn verified data into custom views, benchmarks, monitoring and analysis tailored to your business.",
  },
  {
    icon: ChartLineUp,
    title: "Act on What Matters",
    description:
      "Use Argus AI and clear recommendations to reduce risk, improve performance and grow more profitably.",
  },
] as const;

export function HomeHowItWorks() {
  return (
    <section className="home-how-it-works home-data-section theme-light" aria-labelledby="home-how-title" id="how-it-works">
      <HomeDataPattern />
      <div className="wrap">
        <div className="home-how-heading">
          <div className="kicker home-how-kicker"><span className="dot" /><span>How QuantSentry works</span></div>
          <h2 id="home-how-title">Connect Your Data. <span className="c">Turn It Into Action.</span></h2>
          <p className="lede">
            QuantSentry unifies your systems, builds intelligence around your business,
            and continuously surfaces the risks and opportunities that matter.
          </p>
        </div>

        <div className="home-how-grid">
          {steps.map(({ description, icon: Icon, title }) => (
            <article className="home-how-card" key={title}>
              <div className="home-how-card-top">
                <span className="home-how-icon" aria-hidden="true"><Icon size={22} /></span>
              </div>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
