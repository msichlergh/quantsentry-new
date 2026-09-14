"use client";

import {
  ChartLineUp,
  CurrencyEur,
  HandCoins,
  Info,
  ShieldCheck,
  SquaresFour,
  Users,
  type Icon,
} from "@phosphor-icons/react";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";

import { billedPrice, count, euros, platformPrice } from "@/lib/pricing";

// Listed pricing runs to 20,000 active accounts; above that it is quoted.
const MAX_ACCOUNTS = 20000;
// Revenue moves in steps so a small firm gets as much slider travel as a large one.
const REVENUE_STEPS = [
  25000, 50000, 75000, 100000, 125000, 150000, 200000, 250000, 300000, 400000, 500000, 750000, 1000000, 1500000,
  2000000, 3000000, 5000000,
];

type Inputs = {
  revenue: number;
  fee: number;
  payoutRatio: number;
  savings: number;
};

// Higher payout ratios usually leave more abuse to recover, so the suggested
// savings rise with the ratio: 5% at a 20% payout ratio and 15% at 35%, two
// points for every three, kept within the slider's 5–40% range.
const suggestedSavings = (payoutRatio: number) =>
  Math.min(40, Math.max(5, Math.round(5 + ((payoutRatio - 20) * 2) / 3)));

const DEFAULTS: Inputs = { revenue: 100000, fee: 125, payoutRatio: 35, savings: suggestedSavings(35) };

// Monthly figures for the visitor's inputs. Accounts rarely stay active beyond
// a month, so each active account is one challenge sold that month: revenue
// over the average fee gives the active accounts Platform is priced on.
function figures(inputs: Inputs, annual: boolean) {
  const accounts = Math.max(1, Math.round(inputs.revenue / inputs.fee));
  const payouts = (inputs.revenue * inputs.payoutRatio) / 100;
  const saved = (payouts * inputs.savings) / 100;
  const cost = billedPrice(platformPrice(accounts), annual);
  return { accounts, payouts, saved, cost, net: saved - cost };
}

type Figures = ReturnType<typeof figures>;

const percent = (n: number) => `${n.toFixed(1).replace(/\.0$/, "")}%`;
// A true minus sign, matching the Platform line in the results panel.
const signedEuros = (n: number) => (n < 0 ? `−${euros.format(-n)}` : euros.format(n));
// The return per euro spent on Platform reads best with cents, e.g. €2.92.
const eurosAndCents = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function Slider({
  icon: SliderIcon,
  label,
  hint,
  value,
  min,
  max,
  step,
  format,
  onChange,
  children,
}: {
  children?: ReactNode;
  icon: Icon;
  label: string;
  hint: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (value: number) => string;
  onChange: (value: number) => void;
}) {
  const id = useId();
  const tipId = `${id}-tip`;
  const [tipOpen, setTipOpen] = useState(false);
  const nameRef = useRef<HTMLDivElement>(null);
  // The filled part of the track, drawn by the stylesheet from this variable.
  const fill = { "--fill": `${((value - min) / (max - min)) * 100}%` } as CSSProperties;

  // Hover and keyboard focus show the tooltip from the stylesheet; a tap opens
  // it, and a press anywhere else closes it again (touch buttons don't blur).
  useEffect(() => {
    if (!tipOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!nameRef.current?.contains(event.target as Node)) setTipOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [tipOpen]);

  return (
    <div className="calc-field">
      <div className="calc-field-head">
        <div className="calc-field-name" ref={nameRef}>
          <label htmlFor={id}>
            <span className="calc-field-icon" aria-hidden="true">
              <SliderIcon size={16} />
            </span>
            {label}
          </label>
          <button
            aria-describedby={tipId}
            aria-expanded={tipOpen}
            aria-label={`About ${label}`}
            className="calc-tip-trigger"
            onClick={() => setTipOpen((open) => !open)}
            onKeyDown={(event) => {
              if (event.key === "Escape") setTipOpen(false);
            }}
            type="button"
          >
            <Info aria-hidden="true" size={15} />
          </button>
          <span className={`calc-tip${tipOpen ? " is-open" : ""}`} id={tipId} role="tooltip">
            {hint}
          </span>
        </div>
        <output htmlFor={id}>{format(value)}</output>
      </div>
      <input
        aria-describedby={tipId}
        aria-valuetext={format(value)}
        id={id}
        max={max}
        min={min}
        onChange={(event) => onChange(Number(event.target.value))}
        step={step}
        style={fill}
        type="range"
        value={value}
      />
      {children}
    </div>
  );
}

const MONTHS = 12;
const CHART_HEIGHT = 280;
const PAD = { top: 16, right: 18, bottom: 34, left: 60 };

const compactEuros = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "EUR",
  notation: "compact",
  maximumFractionDigits: 1,
});

// Rounds the axis top up to a value whose quarters read cleanly.
function niceMax(value: number) {
  if (value <= 0) return 1000;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 4, 6, 8, 10].find((candidate) => value / magnitude <= candidate) ?? 10;
  return step * magnitude;
}

// The chart draws at its real pixel width so axis labels keep their size on
// small screens instead of shrinking with a scaled viewBox.
function useWidth(fallback: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(fallback);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return [ref, width] as const;
}

// Annual billing is paid up front, so savings have to earn back the whole
// year's fee; monthly billing is paid as it goes. Returns the months until
// savings cover Platform, 0 when they do from the start, or null past a year.
function paybackMonths(now: Figures, annual: boolean) {
  if (now.saved <= 0) return null;
  const months = annual ? (now.cost * MONTHS) / now.saved : now.saved >= now.cost ? 0 : Infinity;
  return months <= MONTHS ? months : null;
}

// Cost savings and Platform cost added up month by month over the first year.
function SavingsTimeline({ now, annual }: { now: Figures; annual: boolean }) {
  const [ref, width] = useWidth(720);
  const savedAt = (month: number) => now.saved * month;
  const costAt = (month: number) => (annual ? now.cost * MONTHS : now.cost * month);
  const top = niceMax(Math.max(savedAt(MONTHS), costAt(MONTHS)));
  const plotWidth = width - PAD.left - PAD.right;
  const plotHeight = CHART_HEIGHT - PAD.top - PAD.bottom;
  const monthGap = plotWidth / MONTHS;
  const x = (month: number) => PAD.left + (month / MONTHS) * plotWidth;
  const y = (value: number) => PAD.top + plotHeight - (value / top) * plotHeight;
  const months = Array.from({ length: MONTHS + 1 }, (_, month) => month);
  const line = (at: (month: number) => number) =>
    months.map((month, i) => `${i ? "L" : "M"}${x(month).toFixed(1)},${y(at(month)).toFixed(1)}`).join("");
  const area = `${line(savedAt)}L${x(MONTHS)},${y(0)}L${x(0)},${y(0)}Z`;
  const payback = paybackMonths(now, annual);

  // The month under the pointer (or chosen with the arrow keys), snapped to 1–12.
  const [hover, setHover] = useState<number | null>(null);
  const hoverAt = (event: ReactPointerEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const month = Math.round(((event.clientX - rect.left - PAD.left) / plotWidth) * MONTHS);
    setHover(Math.min(MONTHS, Math.max(1, month)));
  };
  const hoverNet = hover === null ? 0 : savedAt(hover) - costAt(hover);
  // The card sits right of the guide line, or left of it near the right edge.
  const tipStyle: CSSProperties | undefined =
    hover === null ? undefined : x(hover) + 210 < width ? { left: x(hover) + 12 } : { right: width - x(hover) + 12 };

  return (
    <div
      aria-label="Month by month chart. Use the arrow keys to step through the months."
      className="calc-chart-wrap"
      onBlur={() => setHover(null)}
      onFocus={() => setHover((current) => current ?? 1)}
      onKeyDown={(event) => {
        if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
        event.preventDefault();
        const step = event.key === "ArrowRight" ? 1 : -1;
        setHover((current) => Math.min(MONTHS, Math.max(1, (current ?? 0) + step)));
      }}
      ref={ref}
      role="group"
      tabIndex={0}
    >
      <svg
        aria-label={`Over 12 months, cost savings add up to ${euros.format(savedAt(MONTHS))} against ${euros.format(costAt(MONTHS))} for Platform.`}
        className="calc-chart"
        height={CHART_HEIGHT}
        onPointerDown={hoverAt}
        onPointerLeave={(event) => {
          // Touch keeps the last month shown; tapping elsewhere blurs and clears it.
          if (event.pointerType === "mouse") setHover(null);
        }}
        onPointerMove={hoverAt}
        role="img"
        viewBox={`0 0 ${width} ${CHART_HEIGHT}`}
        width={width}
      >
        <g className="calc-chart-grid">
          {[0, 0.25, 0.5, 0.75, 1].map((fraction) => (
            <g key={fraction}>
              <line x1={PAD.left} x2={width - PAD.right} y1={y(fraction * top)} y2={y(fraction * top)} />
              <text dy="0.32em" textAnchor="end" x={PAD.left - 10} y={y(fraction * top)}>
                {compactEuros.format(fraction * top)}
              </text>
            </g>
          ))}
          {/* Every month gets a tick; labels thin to every other month only
              where twelve of them would crowd. */}
          {months.slice(1).map((month) => (
            <g key={month}>
              <line className="calc-chart-tick" x1={x(month)} x2={x(month)} y1={y(0)} y2={y(0) + 5} />
              {monthGap >= 18 || month % 2 === 0 ? (
                <text textAnchor="middle" x={x(month)} y={CHART_HEIGHT - 10}>
                  {month}
                </text>
              ) : null}
            </g>
          ))}
        </g>
        <path className="calc-chart-area" d={area} />
        <path className="calc-chart-cost" d={line(costAt)} />
        <path className="calc-chart-saved" d={line(savedAt)} />
        {payback ? (
          <g className="calc-chart-now">
            <line x1={x(payback)} x2={x(payback)} y1={PAD.top} y2={PAD.top + plotHeight} />
            <circle className="is-saved" cx={x(payback)} cy={y(savedAt(payback))} r={4.5} />
          </g>
        ) : null}
        {hover === null ? null : (
          <g className="calc-chart-hover">
            <line x1={x(hover)} x2={x(hover)} y1={PAD.top} y2={PAD.top + plotHeight} />
            <circle className="is-cost" cx={x(hover)} cy={y(costAt(hover))} r={4.5} />
            <circle className="is-saved" cx={x(hover)} cy={y(savedAt(hover))} r={5} />
          </g>
        )}
      </svg>
      {hover === null ? null : (
        <div className="calc-chart-tip" role="status" style={tipStyle}>
          <strong>Month {hover}</strong>
          <dl>
            <div>
              <dt>Cost Savings</dt>
              <dd>{euros.format(savedAt(hover))}</dd>
            </div>
            <div>
              <dt>Platform</dt>
              <dd>{euros.format(costAt(hover))}</dd>
            </div>
            <div className={`is-net${hoverNet < 0 ? " is-negative" : ""}`}>
              <dt>Net</dt>
              <dd>{signedEuros(hoverNet)}</dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  );
}

export function PlatformCalculator() {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS);
  const [annual, setAnnual] = useState(true);
  // Savings follow the payout ratio until the visitor sets them by hand.
  const [savingsLinked, setSavingsLinked] = useState(true);

  const set = (key: keyof Inputs) => (value: number) => setInputs((current) => ({ ...current, [key]: value }));
  const setPayoutRatio = (payoutRatio: number) =>
    setInputs((current) => ({
      ...current,
      payoutRatio,
      savings: savingsLinked ? suggestedSavings(payoutRatio) : current.savings,
    }));
  const setSavings = (savings: number) => {
    setSavingsLinked(false);
    set("savings")(savings);
  };
  const resetSavings = () => {
    setSavingsLinked(true);
    setInputs((current) => ({ ...current, savings: suggestedSavings(current.payoutRatio) }));
  };

  const now = figures(inputs, annual);
  const payback = paybackMonths(now, annual);

  return (
    <>
      <section className="theme-light calc" aria-labelledby="calc-title">
        <div className="wrap">
          <div className="pricing-plans-head">
            <div>
              <div className="kicker"><span className="dot" /><span>Your Prop Firm</span></div>
              <h2 id="calc-title">Your firm.<br /><span className="c">Your return.</span></h2>
            </div>
            <div className="pricing-billing" role="group" aria-label="Billing period">
              <button aria-pressed={!annual} className={annual ? undefined : "is-on"} onClick={() => setAnnual(false)} type="button">
                Monthly
              </button>
              <button aria-pressed={annual} className={annual ? "is-on" : undefined} onClick={() => setAnnual(true)} type="button">
                Annual <span className="pricing-billing-save">Save 20%</span>
              </button>
            </div>
          </div>

          <div className="calc-grid">
            <div className="panel calc-inputs">
              <div>
                <Slider
                  format={(index) => euros.format(REVENUE_STEPS[index])}
                  hint="Revenue from challenge sales in a typical month."
                  icon={ChartLineUp}
                  label="Monthly Challenge Revenue"
                  max={REVENUE_STEPS.length - 1}
                  min={0}
                  onChange={(index) => set("revenue")(REVENUE_STEPS[index])}
                  step={1}
                  value={REVENUE_STEPS.indexOf(inputs.revenue)}
                />
                <Slider
                  format={(value) => euros.format(value)}
                  hint="What a trader pays for one evaluation. Revenue divided by this gives your active accounts."
                  icon={CurrencyEur}
                  label="Average Challenge Fee"
                  max={600}
                  min={20}
                  onChange={set("fee")}
                  step={5}
                  value={inputs.fee}
                />
                <Slider
                  format={percent}
                  hint="Payouts as a share of challenge revenue."
                  icon={HandCoins}
                  label="Payout Ratio"
                  max={60}
                  min={15}
                  onChange={setPayoutRatio}
                  step={1}
                  value={inputs.payoutRatio}
                />
                <Slider
                  format={percent}
                  hint="From trading abuse, payout fraud and fraud prevention, as a share of payout costs. It follows your payout ratio until you set it yourself."
                  icon={ShieldCheck}
                  label="Expected Cost Savings"
                  max={40}
                  min={5}
                  onChange={setSavings}
                  step={1}
                  value={inputs.savings}
                >
                  {savingsLinked ? null : (
                    <button className="calc-reset" onClick={resetSavings} type="button">
                      Reset to Suggested ({percent(suggestedSavings(inputs.payoutRatio))})
                    </button>
                  )}
                </Slider>
              </div>
            </div>

            <div className="panel cy calc-result">
              <div>
                <div className="calc-headline">
                  <div>
                    <span className="eyebrow">{now.net >= 0 ? "Net Saving per Month" : "Net Cost per Month"}</span>
                    <div className={`stat calc-net${now.net < 0 ? " is-negative" : ""}`}>
                      {euros.format(Math.abs(now.net))}
                    </div>
                  </div>
                  <div>
                    <span className="eyebrow">{now.net >= 0 ? "Net Saving per Year" : "Net Cost per Year"}</span>
                    <div className={`stat calc-net${now.net < 0 ? " is-negative" : ""}`}>
                      {euros.format(Math.abs(now.net * 12))}
                    </div>
                  </div>
                </div>

                <dl className="calc-rows">
                  <div>
                    <dt>
                      <Users aria-hidden="true" size={17} />
                      Active Accounts
                    </dt>
                    <dd>{count(now.accounts)}</dd>
                  </div>
                  <div>
                    <dt>
                      <HandCoins aria-hidden="true" size={17} />
                      Payout Costs
                    </dt>
                    <dd>{euros.format(now.payouts)}/mo</dd>
                  </div>
                  <div>
                    <dt>
                      <ShieldCheck aria-hidden="true" size={17} />
                      Cost Savings at {percent(inputs.savings)}
                    </dt>
                    <dd>{euros.format(now.saved)}/mo</dd>
                  </div>
                  <div>
                    <dt>
                      <SquaresFour aria-hidden="true" size={17} />
                      Platform, Billed {annual ? "Annually" : "Monthly"}
                    </dt>
                    <dd>−{euros.format(now.cost)}/mo</dd>
                  </div>
                </dl>
                {now.accounts > MAX_ACCOUNTS ? (
                  <p className="calc-note">
                    Above 20,000 active accounts we quote directly. This estimate uses the lowest listed rate.
                  </p>
                ) : null}

                {/* Savings divided by Platform cost; the line below spells out what the multiple means. */}
                <div className={`calc-roi${now.saved < now.cost ? " is-negative" : ""}`}>
                  <div className="calc-roi-head">
                    <span>ROI Multiplier</span>
                    <strong>{(now.saved / now.cost).toFixed(1)}×</strong>
                  </div>
                  <p>
                    {eurosAndCents.format(now.saved / now.cost)} saved for every €1 spent on Platform
                    {now.saved >= now.cost ? "." : ", so it doesn't pay for itself yet."}
                  </p>
                </div>

                <a className="btn solid calc-cta" href="/demo">
                  <span>See It on Your Data</span>
                </a>
              </div>
            </div>

            {/* Sits under the sliders on desktop and after the results on mobile. */}
            <div className="panel calc-chart-panel">
              <div>
                <div className="calc-chart-head">
                  <h3>Month by Month</h3>
                  <div className="calc-legend" aria-hidden="true">
                    <span className="is-saved">Total Cost Savings</span>
                    <span className="is-cost">Total Platform Cost</span>
                  </div>
                </div>
                <SavingsTimeline annual={annual} now={now} />
                <p className="calc-keep">
                  {payback === null ? (
                    <>
                      At these inputs, Platform costs <strong>{euros.format(-now.net * MONTHS)}</strong> more than it
                      saves over a year.
                    </>
                  ) : payback === 0 ? (
                    "Platform pays for itself from the first month."
                  ) : (
                    <>
                      Platform pays for itself in <strong>month {Math.ceil(payback)}</strong>.
                    </>
                  )}
                </p>
                <p className="calc-method">
                  Estimates for planning, not a quote. Active accounts are revenue divided by the average challenge fee,
                  and cost savings are a share of payout costs. Platform uses the prices on the pricing page, with annual
                  billing paid up front.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
