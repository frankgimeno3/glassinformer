import Image from "next/image";
import { canOptimizeRemoteImageSrc } from "@/app/lib/remoteImage";

interface ArticleHeroProps {
  imageUrl: string;
  alt: string;
}

export default function ArticleHero({ imageUrl, alt }: ArticleHeroProps) {
  return (
    <div className="w-full max-w-4xl mx-auto px-0">
      <Image
        src={imageUrl}
        alt={alt}
        width={1600}
        height={900}
        className="w-full max-h-[50vh] h-auto rounded-none shadow-md object-cover"
        sizes="(max-width: 896px) 100vw, 896px"
        priority
        unoptimized={!canOptimizeRemoteImageSrc(imageUrl)}
      />
    </div>
  );
}
