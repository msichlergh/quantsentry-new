"use client";

import PixelBlast from "./PixelBlast";

export function HomeDataPattern({ tone = "light" }: { tone?: "light" | "dark" }) {
  const dark = tone === "dark";

  return (
    <div className={`home-data-pattern${dark ? " is-dark" : ""}`} aria-hidden="true">
      <PixelBlast
        antialias={false}
        color={dark ? "#153332" : "#d2e4e1"}
        edgeFade={0.22}
        enableRipples={false}
        liquid={false}
        patternDensity={dark ? 0.62 : 0.7}
        patternScale={4.2}
        pixelSize={3}
        pixelSizeJitter={0.08}
        speed={0.14}
        transparent
        variant="square"
      />
    </div>
  );
}
