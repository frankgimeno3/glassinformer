"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  /**
   * Delay in ms (used for progressive/staggered entrance).
   */
  delayMs?: number;
  /**
   * IntersectionObserver rootMargin, e.g. "0px 0px -10% 0px"
   */
  rootMargin?: string;
  /**
   * If true, element reveals only once.
   */
  once?: boolean;
};

export default function Reveal({
  children,
  className,
  delayMs = 0,
  rootMargin = "0px 0px -10% 0px",
  once = true,
}: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  const style = useMemo(() => {
    // CSS variable so we can keep Tailwind className ergonomic
    return { ["--gi-reveal-delay" as any]: `${Math.max(0, delayMs)}ms` };
  }, [delayMs]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // If already visible in viewport, reveal immediately (still respecting delay).
    const rect = el.getBoundingClientRect();
    const inViewNow = rect.top < window.innerHeight && rect.bottom > 0;
    if (inViewNow) {
      setVisible(true);
      if (once) return;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            if (once) obs.disconnect();
          } else if (!once) {
            setVisible(false);
          }
        }
      },
      { root: null, rootMargin, threshold: 0.12 }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [rootMargin, once]);

  return (
    <div
      ref={ref}
      style={style as React.CSSProperties}
      className={[
        "gi-reveal",
        visible ? "gi-reveal--visible" : "gi-reveal--hidden",
        className || "",
      ].join(" ")}
    >
      {children}
    </div>
  );
}

