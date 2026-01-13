import { FC } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface ArticleMiniatureProps {
  id_article: string;
  titulo: string;
  company?: string;
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
  date,
  imageUrl,
  contenidoTitulo,
  contenidoSubtitulo,
}) => {
  const router = useRouter();

  // Support both new and legacy prop formats
  const title = titulo || contenidoTitulo || "";
  const subtitle = contenidoSubtitulo || "";
  const image = imageUrl || "/file.svg";

  return (
    <article
      className="group flex flex-col bg-white border border-gray-200 hover:border-gray-300 cursor-pointer transition-all duration-300 ease-in-out overflow-hidden"
      onClick={() => {
        router.push(`/articles/${id_article}`);
      }}
    >
      {/* Imagen */}
      <div className="relative w-full h-48 md:h-56 overflow-hidden bg-gray-100">
        <Image
          src={image}
          alt={title || "Image not available"}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          unoptimized
        />
      </div>

      {/* Contenido */}
      <div className="flex flex-col p-6 space-y-3">
        {/* Metadata superior */}
        {(company || date) && (
          <div className="flex items-center gap-3 text-xs text-gray-500 uppercase tracking-wider font-sans">
            {company && (
              <span className="font-medium">{company}</span>
            )}
            {company && date && (
              <span className="text-gray-300">•</span>
            )}
            {date && (
              <time>{date}</time>
            )}
          </div>
        )}

        {/* Título */}
        <h2 className="font-serif text-xl md:text-2xl font-bold text-gray-900 leading-tight group-hover:text-gray-700 transition-colors duration-200 line-clamp-3">
          {title}
        </h2>

        {/* Subtítulo */}
        {subtitle && (
          <p className="text-sm text-gray-600 font-sans leading-relaxed line-clamp-2">
            {subtitle}
          </p>
        )}

        {/* Indicador de lectura */}
        <div className="pt-2 border-t border-gray-100">
          <span className="text-xs text-gray-400 font-sans uppercase tracking-wider group-hover:text-gray-600 transition-colors">
            Leer más →
          </span>
        </div>
      </div>
    </article>
  );
};

export default ArticleMiniature;
