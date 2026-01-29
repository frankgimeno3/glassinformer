"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import bannersContents from "@/app/contents/bannersContents.json";
import {
  pickBannerByPriority,
  type BannerItem,
} from "./pickBannerByPriority";

export default function MidBanner() {
  const [banner, setBanner] = useState<BannerItem | null>(null);

  useEffect(() => {
    setBanner(
      pickBannerByPriority(bannersContents as BannerItem[], "medium")
    );
  }, []);

  if (!banner) return (
    <div className="w-full aspect-[800/250] max-h-[250px] rounded-lg bg-gray-100 my-4" />
  );

  return (
    <div className="w-full aspect-[800/250] max-h-[250px] relative overflow-hidden rounded-lg bg-gray-100 my-4">
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
          sizes="(max-width: 768px) 100vw, 800px"
          unoptimized
        />
      </Link>
    </div>
  );
}
