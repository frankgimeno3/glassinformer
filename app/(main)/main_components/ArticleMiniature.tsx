import { FC } from "react";
import Image from "next/image";
import Link from "next/link";
import { canOptimizeRemoteImageSrc } from "@/app/lib/remoteImage";

interface ArticleMiniatureProps {
  id_article: string;
  titulo: string;
  company?: string;
  id_company?: string;
  date?: string;
  imageUrl?: string;
  /** Default vertical card; `row` = image left ~40%, content right (home list). */
  layout?: "stack" | "row";
  // Legacy props for backward compatibility
  contenidoTitulo?: string;
  contenidoSubtitulo?: string;
}

const ArticleMiniature: FC<ArticleMiniatureProps> = ({
  id_article,
  titulo,
  company,
  id_company,
  date,
  imageUrl,
  layout = "stack",
  contenidoTitulo,
  contenidoSubtitulo,
}) => {
  const title = titulo || contenidoTitulo || "";
  const subtitle = contenidoSubtitulo || "";
  const image = imageUrl || "/file.svg";

  const companyId =
    id_company || (company ? encodeURIComponent(company.toLowerCase().replace(/\s+/g, "-")) : "");

  const metaBlock = (company || date) && (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500 uppercase tracking-wider font-sans">
      {company && (
        <Link
          href={`/directory/companies/${companyId}`}
          className="font-medium hover:text-blue-600 transition-colors cursor-pointer"
          onClick={(e) => e.stopPropagation()}
        >
          {company}
        </Link>
      )}
      {company && date && <span className="text-gray-300">•</span>}
      {date && <time>{date}</time>}
    </div>
  );

  const titleBlock = (
    <h2 className="font-serif text-lg sm:text-xl font-bold text-gray-900 leading-snug group-hover:text-gray-700 transition-colors duration-200 line-clamp-3">
      {title}
    </h2>
  );

  const subtitleBlock =
    subtitle && (
      <p className="text-sm text-gray-600 font-sans leading-relaxed line-clamp-2">{subtitle}</p>
    );

  const readMoreBlock = (
    <div className={layout === "row" ? "pt-1" : "pt-2"}>
      <Link
        href={`/articles/${id_article}`}
        className="text-xs text-gray-400 font-sans uppercase tracking-wider group-hover:text-gray-600 transition-colors inline-block"
      >
        Read more →
      </Link>
    </div>
  );

  const imageLink = (
    <Link
      href={`/articles/${id_article}`}
      className={
        layout === "row"
          ? "relative block w-full shrink-0 overflow-hidden bg-gray-100 aspect-[5/3] sm:aspect-auto sm:min-h-[13rem] sm:w-[40%] sm:self-stretch"
          : "relative w-full h-48 md:h-56 overflow-hidden bg-gray-100 block"
      }
    >
      <Image
        src={image}
        alt={title || "Image not available"}
        fill
        className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        sizes={
          layout === "row"
            ? "(max-width: 640px) 100vw, 40vw"
            : "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        }
        unoptimized={!canOptimizeRemoteImageSrc(image)}
      />
    </Link>
  );

  if (layout === "row") {
    return (
      <article className="group flex flex-col bg-white transition-all duration-300 ease-in-out sm:flex-row sm:items-stretch overflow-hidden">
        {imageLink}
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-2 p-4 sm:w-[60%] sm:gap-2 sm:p-5">
          {metaBlock}
          {titleBlock}
          {subtitleBlock}
          {readMoreBlock}
        </div>
      </article>
    );
  }

  return (
    <article className="group flex flex-col bg-white transition-all duration-300 ease-in-out overflow-hidden">
      {imageLink}
      <div className="flex flex-col p-6 space-y-3">
        {metaBlock}
        <h2 className="font-serif text-xl md:text-2xl font-bold text-gray-900 leading-tight group-hover:text-gray-700 transition-colors duration-200 line-clamp-3">
          {title}
        </h2>
        {subtitleBlock}
        {readMoreBlock}
      </div>
    </article>
  );
};

export default ArticleMiniature;
