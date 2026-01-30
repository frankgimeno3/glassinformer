"use client";

import { memo } from "react";
import Link from "next/link";
import PublicationFlipbook from "./PublicationFlipbook";

export interface Publication {
  number: number;
  title: string;
  description: string;
  url: string;
  year: number;
  publicationDate: string;
}

function formatPublicationDate(isoDate: string): string {
  if (!isoDate) return "";
  const d = new Date(isoDate);
  return d.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

interface PublicationCardProps {
  publication: Publication;
}

const PublicationCard = memo<PublicationCardProps>(({ publication }) => {
  const isExternal =
    publication.url.startsWith("http://") ||
    publication.url.startsWith("https://");

  const cardContent = (
    <>
      <PublicationFlipbook title={publication.title} />
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
    "flex flex-col h-full w-full max-w-sm cursor-pointer rounded-2xl p-6 sm:p-8 bg-white/50 shadow-lg " +
    "hover:bg-white hover:shadow-xl hover:scale-[1.03] transition-all duration-200 ease-out";

  return (
    <div className={wrapperClass}>
      {isExternal ? (
        <a
          href={publication.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col flex-1 min-h-0"
        >
          {cardContent}
        </a>
      ) : (
        <Link href={publication.url} className="flex flex-col flex-1 min-h-0">
          {cardContent}
        </Link>
      )}
    </div>
  );
});

PublicationCard.displayName = "PublicationCard";

export default PublicationCard;
