"use client";

import { memo } from "react";

interface PublicationFlipbookProps {
  title: string;
  imageUrl?: string;
}

const PAGE_OFFSET = "0.25rem";

const PublicationFlipbook = memo<PublicationFlipbookProps>(({ title, imageUrl }) => {
  return (
    <div
      className="mx-auto w-full relative aspect-[3/4] overflow-visible group/flipbook"
      style={{ perspective: "1200px" }}
    >
      {/* Back pages (visible when flipping the cover) */}
 
            <div
        className="absolute top-0 left-1 h-full w-full rounded-xs bg-gray-100 border border-gray-200 z-3"
      />
            <div
          className="absolute top-0 left-2 h-full w-full rounded-xs bg-gray-100 border border-gray-200 z-2"
      />
            <div
        className="absolute top-0 left-3 h-full w-full rounded-xs bg-gray-100 border border-gray-200 z-1"
      />
       

      {/* Cover: rotates from the left edge on hover */}
      <div
        className="absolute top-0 left-0 w-full h-full rounded-r-xs z-10 transition-transform duration-[600ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] origin-left group-hover/flipbook:rotate-y-[-24deg]"
        style={{ transformStyle: "preserve-3d" }}
      >
        <div
          className="w-full h-full flex items-center justify-center text-base sm:text-lg px-2 rounded-r-xs shadow-lg overflow-hidden bg-gray-900"
          style={{
            backfaceVisibility: "hidden",
            boxShadow: "2px 2px 12px rgba(0,0,0,0.2)",
            ...(imageUrl
              ? {
                  backgroundImage: `url(${imageUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : {}),
          }}
        >
          {imageUrl ? null : <span className="text-white">{title}</span>}
        </div>
      </div>
    </div>
  );
});

PublicationFlipbook.displayName = "PublicationFlipbook";

export default PublicationFlipbook;
