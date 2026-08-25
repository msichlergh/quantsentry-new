"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { DispersionBandsCanvas } from "@/components/HeroAurora";

export function FooterCtaAurora({ routeKey }: { routeKey: string }) {
  const [targets, setTargets] = useState<HTMLElement[]>([]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setTargets(Array.from(document.querySelectorAll<HTMLElement>(".footer-cta-aurora-target")));
    });

    return () => cancelAnimationFrame(frame);
  }, [routeKey]);

  return targets.map((target, index) =>
    createPortal(
      <div className="footer-cta-aurora" aria-hidden="true">
        <DispersionBandsCanvas />
      </div>,
      target,
      `footer-cta-aurora-${index}`,
    ),
  );
}
