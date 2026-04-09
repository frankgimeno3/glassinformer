"use client";

import Image from "next/image";
import { canOptimizeRemoteImageSrc } from "@/app/lib/remoteImage";
import { normalizeBannerImageSrc } from "./normalizeBannerImageSrc";

type BannerImageFitWidthProps = {
  src: string;
  alt?: string;
  className?: string;
  sizes: string;
  priority?: boolean;
};

/**
 * Banner creative: fills the container width; height follows the image aspect ratio.
 * Placeholder width/height satisfy next/image; CSS `w-full h-auto` controls layout.
 */
export function BannerImageFitWidth({
  src,
  alt = "",
  className = "",
  sizes,
  priority,
}: BannerImageFitWidthProps) {
  const normalized = normalizeBannerImageSrc(src);
  return (
    <Image
      src={normalized}
      alt={alt}
      width={1200}
      height={628}
      sizes={sizes}
      unoptimized={!canOptimizeRemoteImageSrc(normalized)}
      priority={priority}
      className={`block h-auto w-full max-w-full ${className}`.trim()}
    />
  );
}
