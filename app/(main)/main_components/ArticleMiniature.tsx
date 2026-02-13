import { FC } from "react";
import Image from "next/image";
import Link from "next/link";

interface ArticleMiniatureProps {
  id_article: string;
  titulo: string;
  company?: string;
  id_company?: string;
  date?: string;
  imageUrl?: string;
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
  contenidoTitulo,
  contenidoSubtitulo,
}) => {
  // Support both new and legacy prop formats
  const title = titulo || contenidoTitulo || "";
  const subtitle = contenidoSubtitulo || "";
  const image = imageUrl || "/file.svg";
  
  // Generate company ID from company name if id_company is not provided
  const companyId = id_company || (company ? encodeURIComponent(company.toLowerCase().replace(/\s+/g, '-')) : '');

  return (
    <article className="group flex flex-col bg-white border border-gray-200 hover:border-gray-300 transition-all duration-300 ease-in-out overflow-hidden">
      {/* Image - Link to article */}
      <Link href={`/articles/${id_article}`} className="relative w-full h-48 md:h-56 overflow-hidden bg-gray-100 block">
        <Image
          src={image}
          alt={title || "Image not available"}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          unoptimized
        />
      </Link>

      {/* Content */}
      <div className="flex flex-col p-6 space-y-3">
        {/* Top metadata */}
        {(company || date) && (
          <div className="flex items-center gap-3 text-xs text-gray-500 uppercase tracking-wider font-sans">
            {company && (
              <Link 
                href={`/directory/companies/${companyId}`}
                className="font-medium hover:text-blue-600 transition-colors cursor-pointer"
                onClick={(e) => e.stopPropagation()}
              >
                {company}
              </Link>
            )}
            {company && date && (
              <span className="text-gray-300">•</span>
            )}
            {date && (
              <time>{date}</time>
            )}
          </div>
        )}

        {/* Title */}
        <h2 className="font-serif text-xl md:text-2xl font-bold text-gray-900 leading-tight group-hover:text-gray-700 transition-colors duration-200 line-clamp-3">
          {title}
        </h2>

        {/* Subtitle */}
        {subtitle && (
          <p className="text-sm text-gray-600 font-sans leading-relaxed line-clamp-2">
            {subtitle}
          </p>
        )}

        {/* Read more - Link to article */}
        <div className="pt-2 border-t border-gray-100">
          <Link 
            href={`/articles/${id_article}`}
            className="text-xs text-gray-400 font-sans uppercase tracking-wider group-hover:text-gray-600 transition-colors inline-block"
          >
            Read more →
          </Link>
        </div>
      </div>
    </article>
  );
};

export default ArticleMiniature;
