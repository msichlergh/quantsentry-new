export default function NotFound() {
  return (
    <main>
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
