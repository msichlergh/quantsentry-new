"use client";

import { useEffect } from "react";

export function MobileLegacyEnhancer({ targetId }: { targetId: string }) {
  useEffect(() => {
    const target = document.getElementById(targetId);
    if (!target) return;

    const media = window.matchMedia("(max-width: 760px)");
    const cleanups: Array<() => void> = [];

    const enhance = () => {
      cleanups.splice(0).forEach((cleanup) => cleanup());
      if (!media.matches) return;

      target.querySelectorAll<HTMLElement>(".app").forEach((dashboard, index) => {
        const frame = dashboard.querySelector<HTMLElement>(".app-in");
        if (!frame || frame.scrollHeight <= 470) return;
        const previousFrameId = frame.id;

        dashboard.classList.add("mobile-dashboard-collapsed");
        const button = document.createElement("button");
        button.type = "button";
        button.className = "mobile-dashboard-toggle";
        button.setAttribute("aria-expanded", "false");
        button.setAttribute("aria-controls", `${targetId}-dashboard-${index}`);
        button.textContent = "Show full dashboard";
        frame.id = `${targetId}-dashboard-${index}`;

        const toggle = () => {
          const expanded = dashboard.classList.toggle("is-expanded");
          button.setAttribute("aria-expanded", String(expanded));
          button.textContent = expanded ? "Show less" : "Show full dashboard";
        };

        button.addEventListener("click", toggle);
        dashboard.append(button);
        cleanups.push(() => {
          button.removeEventListener("click", toggle);
          button.remove();
          dashboard.classList.remove("mobile-dashboard-collapsed", "is-expanded");
          if (previousFrameId) frame.id = previousFrameId;
          else frame.removeAttribute("id");
        });
      });
    };

    enhance();
    media.addEventListener("change", enhance);
    return () => {
      media.removeEventListener("change", enhance);
      cleanups.splice(0).forEach((cleanup) => cleanup());
    };
  }, [targetId]);

  return null;
}
