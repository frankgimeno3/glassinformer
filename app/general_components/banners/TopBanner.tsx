"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  pickBannerByPriority,
  type BannerItem,
} from "./pickBannerByPriority";

const BANNERS_API = "/api/v1/banners";

export default function TopBanner() {
  const [banner, setBanner] = useState<BannerItem | null>(null);

  useEffect(() => {
    fetch(BANNERS_API)
      .then((res) => res.json())
      .then((data: BannerItem[]) => {
        setBanner(pickBannerByPriority(data, "top"));
      })
      .catch(() => setBanner(null));
  }, []);

  if (!banner) return (
    <div className="h-16 md:h-20 flex items-center justify-center w-full" />
  );

  return (
    <div className="h-24 md:h-48 flex items-center justify-center w-full overflow-hidden bg-gray-100">
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
