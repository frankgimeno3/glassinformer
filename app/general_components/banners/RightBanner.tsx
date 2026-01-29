"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import bannersContents from "@/app/contents/bannersContents.json";
import type { BannerItem } from "./pickBannerByPriority";

const MIN_RIGHT_BANNERS = 4;

export default function RightBanner() {
  const rightBanners = useMemo(() => {
    const filtered = (bannersContents as BannerItem[]).filter(
      (b) => b.bannerType === "right"
    );
    return filtered.slice(0, Math.max(MIN_RIGHT_BANNERS, filtered.length));
  }, []);

  if (rightBanners.length === 0)
    return (
      <div className="w-full aspect-[400/600] max-h-[600px] rounded-lg bg-gray-100 sticky top-28"
      />
    );

  return (
    <div className="flex flex-col gap-4 sticky top-28">
      {rightBanners.map((banner) => (
        <div
          key={banner.id_banner}
          className="w-full aspect-[400/600] max-h-[600px] relative overflow-hidden rounded-lg bg-gray-100"
        >
          <Link
            href={banner.bannerRedirection || banner.bannerRoute || "/"}
            target="_blank"
            rel="noopener noreferrer"
            className="relative block w-full h-full"
          >
            <Image
              src={banner.bannerSrc}
              alt=""
              fill
              className="object-cover object-center"
              sizes="400px"
              unoptimized
            />
          </Link>
        </div>
      ))}
    </div>
  );
}
