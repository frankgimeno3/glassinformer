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

  const validArticles = allArticles.filter((a: any) => a && a.id_article && a.articleTitle);

  return (
    <div className="min-h-screen bg-white">

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto pt-12 px-4 sm:px-6 lg:px-8 pb-16">
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-pulse">
              <p className="text-gray-400 text-lg font-serif">Cargando artículos...</p>
            </div>
          </div>
        ) : validArticles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-gray-400 text-xl font-serif">No hay artículos disponibles</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
            {validArticles.map((a: any, index: number) => (
              <ArticleMiniature
                key={a.id_article || index}
                id_article={a.id_article || ""}
                titulo={a.articleTitle || ""}
                company={a.company || ""}
                date={a.date || ""}
                imageUrl={a.article_main_image_url || ""}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
