/**
 * `not-found.tsx` cannot export a `metadata` object — it renders inside the
 * matched route's tree, so its head tags come from whichever segment 404'd.
 * Only the experimental `global-not-found.js` supports a metadata export, and
 * that needs the `globalNotFound` flag in next.config.ts.
 *
 * So the indexing directive is rendered here and hoisted into <head> by React
 * 19. Next.js already injects `noindex` for responses that carry a 404 status,
 * but a *streamed* 404 is served with a 200 — the soft-404 case where this
 * explicit directive is the only thing keeping the page out of the index.
 *
 * The title is deliberately not set here: React 19 hoists `<title>` but does
 * not dedupe it, so it would ship two <title> elements. The page inherits the
 * layout's default title, which is correct enough for a noindexed page. Set
 * `globalNotFound` in next.config.ts to give the 404 a title of its own.
 */
export default function NotFound() {
  return (
    <main>
      <meta name="robots" content="noindex, nofollow" />
      <section className="hero">
        <div className="wrap" style={{ textAlign: "center" }}>
          <div className="eyebrow" style={{ color: "var(--cy)" }}>
            404
          </div>
          <h1 style={{ margin: "18px auto 0" }}>This page does not exist.</h1>
          <p className="lede" style={{ margin: "18px auto 0" }}>
            Return to QuantSentry to explore the platform.
          </p>
          <a className="btn solid" href="/" style={{ marginTop: 26 }}>
            <span>Back to Home</span>
          </a>
        </div>
      </section>
    </main>
  );
}
