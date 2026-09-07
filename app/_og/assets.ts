import { readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * Fonts and images for the generated social cards.
 *
 * These are read once at module scope: they never depend on request data, so
 * the OG routes stay statically optimised.
 *
 * The `.ttf` files are the repo's own `public/fonts/general-sans-*.woff2`
 * re-flavoured to TrueType. Satori — the renderer behind `next/og` — cannot
 * decode woff2, and falling back to `system-ui` would let the build host's
 * installed fonts decide whether `é` / `č` / `ž` render or come out as tofu.
 * Embedding an explicit face removes that variable. Coverage is 384 glyphs
 * (Latin + Latin Extended-A + the typographic punctuation the copy uses).
 */

const OG_DIR = join(process.cwd(), "app", "_og");

export const generalSans400 = await readFile(join(OG_DIR, "general-sans-400.ttf"));
export const generalSans600 = await readFile(join(OG_DIR, "general-sans-600.ttf"));

export const ogFonts = [
  { name: "General Sans", data: generalSans400, style: "normal" as const, weight: 400 as const },
  { name: "General Sans", data: generalSans600, style: "normal" as const, weight: 600 as const },
];

const markData = await readFile(
  join(process.cwd(), "public", "images", "quantsentry-icon-teal-coil-v2.png"),
  "base64",
);

/** The QuantSentry coil mark, inlined so the card needs no network fetch. */
export const brandMarkSrc = `data:image/png;base64,${markData}`;

export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = "image/png";
