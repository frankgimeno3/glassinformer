"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/** Shares the page scroll and sticks only after the end of a tall rail is visible. */
export default function StickyBannerRail({ children, className = "" }: {
  children?: ReactNode;
  className?: string;
}) {
  const railRef = useRef<HTMLDivElement>(null);
  const [top, setTop] = useState<number>();

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const measure = () => {
      setTop(Math.min(112, window.innerHeight - rail.getBoundingClientRect().height - 24));
    };
    const observer = new ResizeObserver(measure);
    observer.observe(rail);
    window.addEventListener("resize", measure);
    measure();
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  return <div ref={railRef} data-banner-rail className={`sticky ${className}`} style={{ top }}>
    {children}
  </div>;
}
