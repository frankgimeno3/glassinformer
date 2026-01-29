"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import bannersContents from "@/app/contents/bannersContents.json";
import {
  pickBannerByPriority,
  type BannerItem,
} from "./pickBannerByPriority";

export default function TopBanner() {
  const [banner, setBanner] = useState<BannerItem | null>(null);

  useEffect(() => {
    setBanner(
      pickBannerByPriority(bannersContents as BannerItem[], "top")
    );
  }, []);

  if (!banner) return (
    <div className="h-16 md:h-20 flex items-center justify-center w-full" />
  );

  return (
    <div className="h-16 md:h-20 flex items-center justify-center w-full overflow-hidden bg-gray-100">
      <Link
        href={banner.bannerRedirection || banner.bannerRoute || "/"}
        target="_blank"
        rel="noopener noreferrer"
        className="relative w-full h-full block"
      >
        <Image
          src={banner.bannerSrc}
          alt=""
          fill
          className="object-cover object-center"
          sizes="(max-width: 768px) 100vw, 1200px"
          unoptimized
        />
      </Link>
    </div>
  );
}
