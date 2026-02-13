"use client";

import { memo } from "react";
import PublicationFlipbook from "./PublicationFlipbook";

export interface Publication {
  id?: string;
  number: number;
  title: string;
  description: string;
  redirection_link: string;
  year: number;
  publicationDate: string;
  publicationMainImageUrl?: string;
}

function formatPublicationDate(isoDate: string): string {
  if (!isoDate) return "";
  const d = new Date(isoDate);
  return d.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

interface PublicationCardProps {
  publication: Publication;
}

const PublicationCard = memo<PublicationCardProps>(({ publication }) => {
  const cardContent = (
    <>
      <PublicationFlipbook title={publication.title} imageUrl={publication.publicationMainImageUrl} />
      <h2 className="text-xl sm:text-2xl font-bold line-clamp-2 mt-3">
        {publication.title}
      </h2>
      <p className="text-base text-gray-500 mt-1">
        {formatPublicationDate(publication.publicationDate)}
      </p>
      <p className="text-gray-600 text-base line-clamp-2 mt-2">
        {publication.description}
      </p>
    </>
  );

  const wrapperClass =
    "flex flex-col h-full w-full max-w-sm rounded-2xl p-6 sm:p-8 bg-white/50 shadow-lg " +
    "hover:bg-white hover:shadow-xl hover:scale-[1.03] transition-all duration-200 ease-out";
  const contentWrapperClass = "flex flex-col flex-1 min-h-0 cursor-pointer";

  const handleClick = () => {
    const raw = (publication.redirection_link ?? "").trim();
    if (!raw) return;
    const url = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className={wrapperClass}>
      <div
        role="button"
        tabIndex={0}
        className={contentWrapperClass}
        onClick={handleClick}
        onKeyDown={(e) => e.key === "Enter" && handleClick()}
      >
        {cardContent}
      </div>
    </div>
  );
});

PublicationCard.displayName = "PublicationCard";

export default PublicationCard;
