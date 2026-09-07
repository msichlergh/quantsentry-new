import { ImageResponse } from "next/og";

import { OgCard } from "./_og/card";
import { OG_CONTENT_TYPE, OG_SIZE, ogFonts } from "./_og/assets";

/**
 * The site-wide social card. Sitting at the root segment, it is inherited by
 * every route that does not define its own, so no page can ever unfurl
 * without an image. `/insights/[slug]` overrides it with a per-article card.
 */

export const alt =
  "QuantSentry — the data intelligence layer for trading businesses";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return new ImageResponse(
    (
      <OgCard
        eyebrow="Risk & Business Intelligence"
        title="The data intelligence layer for trading businesses."
        subtitle="Bring your business data together. Use Argus AI to find risks and opportunities, get clear answers and decide what to do next."
      />
    ),
    { ...size, fonts: ogFonts },
  );
}
