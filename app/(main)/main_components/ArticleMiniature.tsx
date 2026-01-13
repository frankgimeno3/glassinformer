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
    <div
      className="flex flex-col bg-gray-100 hover:bg-gray-200/80 cursor-pointer rounded-lg shadow-xl p-4 m-2 w-64"
      onClick={() => {
        router.push(`/articles/${id_article}`);
      }}
    >
      <p className="font-bold text-lg">{title}</p>
      <Image
        src={image}
        alt={title || "Image not available"}
        width={256}
        height={144}
        className="rounded-md object-cover"
        unoptimized
      />

      {subtitle && <p className="text-sm text-gray-600 mt-2">{subtitle}</p>}
      {company && <p className="text-xs text-gray-500 mt-1">{company}</p>}
      {date && <p className="text-xs text-gray-400 mt-1">{date}</p>}
    </div>
  );
};

export default ArticleMiniature;
