"use client";

import { useEffect, useState } from "react";
import ArticleMiniature from "./main_components/ArticleMiniature";
import { ArticleService } from "@/service/ArticleService";

export default function Home() {
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
    <div className="flex flex-col">
      <p>Criterio de búsqueda actual</p>
      <div className="flex flex-wrap">
        {loading ? (
          <div className="text-center py-10">
            <p className="text-gray-500">Cargando artículos...</p>
          </div>
        ) : allArticles.filter((a: any) => a && a.id_article && a.articleTitle).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 w-full">
            <p className="text-gray-500 text-lg">No hay artículos disponibles</p>
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
}
