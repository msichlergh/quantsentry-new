import { BRAND, clamp } from "../_seo/site";

import { OG_SIZE, brandMarkSrc } from "./assets";

/**
 * The one social-card layout, shared by every `opengraph-image` and
 * `twitter-image` route so the cards cannot drift apart.
 *
 * Safe zone: 72px of padding on every edge. X crops a `summary_large_image`
 * to 2:1 (600px of the 630px height), so nothing load-bearing sits in the
 * outer 15px band, and the footer row stays inside the crop.
 *
 * Satori notes: every element with more than one child needs an explicit
 * `display: flex`, and there is no reliable line-clamp, so the strings are
 * length-clamped here instead of overflowing the box.
 */

export type OgCardProps = {
  /** Small label above the headline, e.g. "Insights" or "Platform". */
  eyebrow: string;
  /** The headline. Clamped to 3 lines' worth of characters. */
  title: string;
  /** Optional supporting line under the headline. */
  subtitle?: string;
  /** Optional right-hand footer text, e.g. "Milos Mosovsky · 10 Feb 2026". */
  meta?: string;
};

const TITLE_CHARS = 88;
// 135 clears every real string the card renders: the longest author bio is
// 129, the longest article summary 115, the home subtitle 126. All fit inside
// three lines at this width, so nothing truncates in practice — the clamp is
// the safety net for copy that grows later, not a routine trim.
const SUBTITLE_CHARS = 135;

export function OgCard({ eyebrow, title, subtitle, meta }: OgCardProps) {
  const headline = clamp(title, TITLE_CHARS);
  const sub = subtitle ? clamp(subtitle, SUBTITLE_CHARS) : undefined;
  const headlineSize = headline.length > 58 ? 60 : 72;

  return (
    <div
      style={{
        width: OG_SIZE.width,
        height: OG_SIZE.height,
        display: "flex",
        flexDirection: "column",
        position: "relative",
        backgroundColor: BRAND.bg,
        fontFamily: "General Sans",
      }}
    >
      {/* Aurora wash, echoing the site hero. */}
      <div
        style={{
          position: "absolute",
          top: -320,
          right: -220,
          width: 900,
          height: 900,
          borderRadius: 450,
          background:
            "radial-gradient(circle, rgba(72,199,195,0.20) 0%, rgba(72,199,195,0.06) 45%, rgba(8,10,11,0) 70%)",
        }}
      />
      {/* Teal hairline along the top edge. */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: OG_SIZE.width,
          height: 4,
          background: `linear-gradient(90deg, ${BRAND.cyan} 0%, #249f9d 46%, rgba(36,159,157,0) 100%)`,
        }}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          padding: 72,
        }}
      >
        {/* Brand lockup */}
        <div style={{ display: "flex", alignItems: "center" }}>
          {/* Satori renders raw HTML, not the Next.js image pipeline —
              next/image cannot be used inside an ImageResponse. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="" src={brandMarkSrc} width={46} height={46} />
          <div
            style={{
              display: "flex",
              marginLeft: 12,
              fontSize: 34,
              color: BRAND.ink,
              letterSpacing: "-0.02em",
            }}
          >
            <span style={{ fontWeight: 400 }}>Quant</span>
            <span style={{ fontWeight: 600 }}>Sentry</span>
          </div>
        </div>

        {/* Headline block */}
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 1000 }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 22 }}>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: BRAND.cyan,
              }}
            />
            <span
              style={{
                marginLeft: 10,
                fontSize: 21,
                fontWeight: 600,
                color: BRAND.ink2,
                letterSpacing: "0.01em",
              }}
            >
              {eyebrow}
            </span>
          </div>

          <div
            style={{
              fontSize: headlineSize,
              fontWeight: 600,
              lineHeight: 1.1,
              color: BRAND.ink,
              letterSpacing: "-0.035em",
            }}
          >
            {headline}
          </div>

          {sub ? (
            <div
              style={{
                marginTop: 22,
                fontSize: 27,
                fontWeight: 400,
                lineHeight: 1.42,
                color: BRAND.ink3,
                maxWidth: 900,
              }}
            >
              {sub}
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            paddingTop: 26,
            borderTop: `1px solid ${BRAND.hair}`,
            fontSize: 22,
            color: BRAND.ink4,
          }}
        >
          <span>quantsentry.com</span>
          {meta ? <span style={{ color: BRAND.ink3 }}>{meta}</span> : null}
        </div>
      </div>
    </div>
  );
}
