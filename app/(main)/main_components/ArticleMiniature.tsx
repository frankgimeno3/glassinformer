import { FC } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface ArticleMiniatureProps {
  id_article:string;
  contenidoTitulo: string;
  contenidoSubtitulo: string;
 }

const ArticleMiniature: FC<ArticleMiniatureProps> = ({
  id_article,
  contenidoTitulo,
  contenidoSubtitulo,
 }) => {

  const router = useRouter()
  return (
    <div className="flex flex-col bg-gray-100 hover:bg-gray-200/80 cursor-pointer rounded-lg shadow-xl p-4 m-2 w-64"
    onClick={()=>{router.push(`/articles/${id_article}`)}}>
      <p className="font-bold text-lg">{contenidoTitulo}</p>
      <Image
        src={'/file.svg'}
        alt="Image not available"
        width={256}
        height={144}
        className="rounded-md"
      />
      <p className="text-sm text-gray-600">{contenidoSubtitulo}</p>
    </div>
  );
};

export default ArticleMiniature;
