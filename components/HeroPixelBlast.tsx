"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import PixelBlast from "@/components/PixelBlast";

export function HeroPixelBlast({ targetId }: { targetId: string }) {
  const [target, setTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const root = document.getElementById(targetId);
    const hero = root?.querySelector<HTMLElement>(
      ":scope > section.hero:first-child, :scope > .page-content-html:first-child > section.hero:first-child, :scope > article:first-child > section.insight-article-hero:first-child",
    );
    if (!hero) return;

    hero.classList.add("signal-field-hero");
    const frame = requestAnimationFrame(() => setTarget(hero));

    return () => {
      cancelAnimationFrame(frame);
      hero.classList.remove("signal-field-hero");
    };
  }, [targetId]);

  if (!target) return null;

  return createPortal(
    <div className="hero-pixel-field" aria-hidden="true">
      <PixelBlast
        antialias={false}
        color="#48c7c3"
        edgeFade={0.22}
        enableRipples
        liquid={false}
        patternDensity={0.82}
        patternScale={3}
        pixelSize={6}
        pixelSizeJitter={0.2}
        rippleIntensityScale={1.1}
        rippleSpeed={0.32}
        rippleThickness={0.1}
        speed={0.28}
        transparent
        variant="square"
      />
    </div>,
    target,
  );
}
