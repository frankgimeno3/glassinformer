"use client";

import { FC, Suspense, useEffect, useState } from "react";

import ArticleMiniature from "../main_components/ArticleMiniature";
import ArticleFilter from "./article_components/ArticleFilter";
import { ArticleService } from "@/service/ArticleService";

interface ArticlesProps {}

const Articles: FC<ArticlesProps> = ({}) => {
  const [allArticles, setAllArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchArticles = async () => {
    try {
      // Obtener todos los artículos del API (incluye los del JSON y los creados dinámicamente)
      const apiArticles = await ArticleService.getAllArticles();
      
      // Filtrar y normalizar artículos válidos
      const validArticles = Array.isArray(apiArticles)
        ? apiArticles.filter((art: any) => art && art.id_article && art.articleTitle)
        : [];
      
      setAllArticles(validArticles);
    } catch (error: any) {
      console.error("Error fetching articles:", error);
      // Log more details about the error
      if (error?.message) {
        console.error("Error message:", error.message);
      }
      if (error?.data) {
        console.error("Error data:", error.data);
      }
      // Set empty array on error to prevent UI crash
      setAllArticles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  return (
    <div className="flex flex-col w-full bg-white">
      <div className="flex flex-col text-center bg-blue-950/70 p-5 px-46 text-white">
        <p className="text-2xl">All articles</p>
      </div>

      <Suspense fallback={<div className='px-36 mx-7'><div className='flex flex-col border border-gray-100 shadow-xl text-center py-2 text-xs'><p>Loading filter...</p></div></div>}>
        <ArticleFilter />
      </Suspense>

      <div className="flex flex-wrap py-5 gap-12 justify-center ">
        {loading ? (
          <div className="text-center py-10">
            <p className="text-gray-500">Cargando artículos...</p>
          </div>
        ) : allArticles.filter((a: any) => a && a.id_article && a.articleTitle).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 w-full">
            <p className="text-gray-500 text-lg">No results found for your query</p>
          </div>
        ) : (
          allArticles
            .filter((a: any) => a && a.id_article && a.articleTitle)
            .map((a: any, index: number) => (
              <ArticleMiniature
                key={a.id_article || index}
                id_article={a.id_article || ""}
                titulo={a.articleTitle || ""}
                company={a.company || ""}
                date={a.date || ""}
                imageUrl={a.article_main_image_url || ""}
              />
            ))
        )}
      </div>
    </div>
  );
};

export default Articles;