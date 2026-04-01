"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { normalizeBannerImageSrc } from "./normalizeBannerImageSrc";
import {
  pickNBannersByPriority,
  type BannerItem,
} from "./pickBannerByPriority";

const BANNERS_API = "/api/v1/banners";
const BANNER_HOVER =
  "transition-opacity duration-200 ease-out hover:opacity-[0.88]";

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
    <div className={`relative flex min-h-0 min-w-0 justify-center ${flexClass}`}>
      <Link
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex w-fit max-w-[65%] items-center justify-center rounded-lg bg-white p-2 shadow-sm ring-1 ring-neutral-200/90 sm:p-3 ${BANNER_HOVER}`}
      >
        <Image
          src={normalizeBannerImageSrc(banner.bannerSrc)}
          alt=""
          width={1200}
          height={260}
          className="block h-auto w-auto max-w-full object-contain object-center"
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
        <div className="mx-auto min-h-[48px] max-w-7xl px-4 sm:min-h-[56px] sm:px-6 lg:px-8" />
      </div>
    );
  }

  return (
    <div className="w-full shrink-0 bg-[#f2f2f2] py-1.5 sm:py-2">
      <div
        className="mx-auto flex max-w-7xl items-center gap-2 px-4 sm:gap-3 sm:px-6 lg:px-8"
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
