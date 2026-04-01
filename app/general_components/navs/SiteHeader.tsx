"use client";

import { useEffect, useRef, useState } from "react";
import TopBanner from "../banners/TopBanner";
import AppNav from "./AppNav";

const HEADER_FALLBACK_HEIGHT = 200;

export default function SiteHeader() {
  const headerRef = useRef<HTMLDivElement | null>(null);
  const [headerHeight, setHeaderHeight] = useState(HEADER_FALLBACK_HEIGHT);

  useEffect(() => {
    const node = headerRef.current;
    if (!node) return;

    const updateHeight = () => {
      setHeaderHeight(node.getBoundingClientRect().height || HEADER_FALLBACK_HEIGHT);
    };

    updateHeight();

    const observer = new ResizeObserver(() => updateHeight());
    observer.observe(node);
    window.addEventListener("resize", updateHeight);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateHeight);
    };
  }, []);

  return (
    <>
      <div ref={headerRef} className="fixed left-0 right-0 top-0 z-50">
        <div className="w-full bg-gray-100">
          <TopBanner />
        </div>
        <AppNav />
      </div>
      <div aria-hidden style={{ height: `${headerHeight}px` }} />
    </>
  );
}
