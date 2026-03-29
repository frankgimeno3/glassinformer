"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  pickNBannersByPriority,
  type BannerItem,
} from "./pickBannerByPriority";

const BANNERS_API = "/api/v1/banners";

/** Leaderboard strip height (~90px), aligned with common ad rail layouts */
const INNER_H = "h-[84px] sm:h-[92px]";

function TopBannerSlot({
  banner,
  flexClass,
  slot,
}: {
  banner: BannerItem;
  flexClass: string;
  slot: "wide" | "narrow" | "full";
}) {
  const href = banner.bannerRedirection || banner.bannerRoute || "/";
  const sizes =
    slot === "narrow"
      ? "(max-width: 768px) 38vw, 360px"
      : slot === "full"
        ? "(max-width: 768px) 100vw, min(1200px, 100vw)"
        : "(max-width: 768px) 58vw, 720px";
  return (
    <div className={`relative min-h-0 min-w-0 ${flexClass}`}>
      <Link
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`relative block h-full w-full overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-neutral-200/90`}
      >
        <Image
          src={banner.bannerSrc}
          alt=""
          fill
          className="object-cover object-center"
          sizes={sizes}
          unoptimized
        />
      </Link>
    </div>
  );
}

export default function TopBanner() {
  const [banners, setBanners] = useState<BannerItem[]>([]);

  useEffect(() => {
    fetch(BANNERS_API)
      .then((res) => res.json())
      .then((data: BannerItem[]) => {
        const list = Array.isArray(data) ? data : [];
        setBanners(pickNBannersByPriority(list, "top", 1));
      })
      .catch(() => setBanners([]));
  }, []);

  if (banners.length === 0) {
    return (
      <div
        className={`w-full shrink-0 bg-[#f2f2f2] py-1.5 sm:py-2`}
        aria-hidden
      >
        <div
          className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${INNER_H}`}
        />
      </div>
    );
  }

  return (
    <div className="w-full shrink-0 bg-[#f2f2f2] py-1.5 sm:py-2">
      <div
        className={`mx-auto flex max-w-7xl items-stretch gap-2 px-4 sm:gap-3 sm:px-6 lg:px-8 ${INNER_H}`}
      >
        {banners.map((banner, i) => {
          const pair = banners.length === 2;
          return (
            <TopBannerSlot
              key={banner.id_banner}
              banner={banner}
              flexClass={pair ? (i === 0 ? "flex-[7]" : "flex-[3]") : "flex-1"}
              slot={pair ? (i === 0 ? "wide" : "narrow") : "full"}
            />
          );
        })}
      </div>
    </div>
  );
}
