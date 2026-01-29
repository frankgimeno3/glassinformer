"use client";

import { useEffect, useState, useMemo } from "react";
import ArticleMiniature from "./main_components/ArticleMiniature";
import MidBanner from "../general_components/banners/MidBanner";
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

  const gridItems = useMemo(() => {
    const items: Array<
      | { type: "banner" }
      | { type: "article"; article: any; index: number }
    > = [];
    for (let i = 0; i < validArticles.length; i += 3) {
      items.push({ type: "banner" });
      const chunk = validArticles.slice(i, i + 3);
      chunk.forEach((a: any, j: number) =>
        items.push({ type: "article", article: a, index: i + j })
      );
      items.push({ type: "banner" });
    }
    return items;
  }, [validArticles]);

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
            {gridItems.map((item, idx) =>
              item.type === "banner" ? (
                <div key={`mid-banner-${idx}`} className="col-span-1 md:col-span-2 lg:col-span-3">
                  <MidBanner />
                </div>
              ) : (
                <ArticleMiniature
                  key={item.article.id_article || item.index}
                  id_article={item.article.id_article || ""}
                  titulo={item.article.articleTitle || ""}
                  company={item.article.company || ""}
                  date={item.article.date || ""}
                  imageUrl={item.article.article_main_image_url || ""}
                />
              )
            )}
          </div>
        )}
      </main>
    </div>
  );
}
