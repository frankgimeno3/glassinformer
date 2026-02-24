"use client";

import { useEffect, useState, useMemo } from "react";
import ArticleMiniature from "./main_components/ArticleMiniature";
import MidBanner from "../general_components/banners/MidBanner";
import { pickNBannersByPriority, type BannerItem } from "../general_components/banners/pickBannerByPriority";
import { ArticleService } from "@/apiClient/ArticleService";
import MainNews from "./main_components/MainNews";
import ShowMoreContent from "./main_components/ShowMoreContent";

const BANNERS_API = "/api/v1/banners";

export default function Home() {
  const [allArticles, setAllArticles] = useState<any[]>([]);
  const [banners, setBanners] = useState<BannerItem[]>([]);
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

  useEffect(() => {
    fetch(BANNERS_API)
      .then((res) => res.json())
      .then((data: BannerItem[]) => setBanners(Array.isArray(data) ? data : []))
      .catch(() => setBanners([]));
  }, []);

  const validArticles = allArticles.filter((a: any) => a && a.id_article && a.articleTitle);

  // Artículos destacados para MainNews: "Main article" (izquierda) y "Position1".."Position5" (derecha)
  const mainArticle = useMemo(
    () => validArticles.find((a: any) => (a.highlited_position || "").trim() === "Main article") ?? null,
    [validArticles]
  );
  const secondaryArticles = useMemo(() => {
    const pos = [1, 2, 3, 4, 5].map((n) =>
      validArticles.find((a: any) => (a.highlited_position || "").trim() === `Position${n}`)
    ).filter(Boolean);
    return pos as any[];
  }, [validArticles]);
  // Resto de artículos (highlited_position === ""), ordenados por fecha para la rejilla de abajo
  const restArticles = useMemo(
    () => validArticles
      .filter((a: any) => (a.highlited_position || "").trim() === "")
      .sort((a: any, b: any) => (new Date(b.date).getTime() - new Date(a.date).getTime())),
    [validArticles]
  );

  const BLOCK_SIZE = 6;
  const DEFAULT_MAX_BLOCKS = 4;
  const totalBlocks = useMemo(
    () => Math.ceil(restArticles.length / BLOCK_SIZE),
    [restArticles.length]
  );
  const [visibleBlocks, setVisibleBlocks] = useState(0);

  useEffect(() => {
    if (totalBlocks > 0 && visibleBlocks === 0) {
      setVisibleBlocks(Math.min(DEFAULT_MAX_BLOCKS, totalBlocks));
    }
  }, [totalBlocks, visibleBlocks]);

  const effectiveVisibleBlocks =
    totalBlocks > 0 && visibleBlocks === 0
      ? Math.min(DEFAULT_MAX_BLOCKS, totalBlocks)
      : visibleBlocks;
  const articlesToShow = effectiveVisibleBlocks * BLOCK_SIZE;
  const visibleArticles = useMemo(
    () => restArticles.slice(0, articlesToShow),
    [restArticles, articlesToShow]
  );

  const gridItems = useMemo(() => {
    const items: Array<
      | { type: "banner" }
      | { type: "article"; article: any; index: number }
    > = [];
    let i = 0;
    if (visibleArticles.length > 0) {
      items.push({ type: "banner" });
    }
    while (i < visibleArticles.length) {
      const block = visibleArticles.slice(i, i + BLOCK_SIZE);
      block.forEach((a: any, j: number) =>
        items.push({ type: "article", article: a, index: i + j })
      );
      i += BLOCK_SIZE;
      items.push({ type: "banner" });
    }
    return items;
  }, [visibleArticles]);

  const midBannerSlotCount = useMemo(
    () => gridItems.filter((i) => i.type === "banner").length,
    [gridItems]
  );
  const midBanners = useMemo(
    () => pickNBannersByPriority(banners, "medium", midBannerSlotCount),
    [banners, midBannerSlotCount]
  );

  const hasMoreContent =
    totalBlocks > DEFAULT_MAX_BLOCKS && effectiveVisibleBlocks < totalBlocks;

  const handleShowMore = () => {
    setVisibleBlocks((prev) => Math.min(prev + DEFAULT_MAX_BLOCKS, totalBlocks));
  };

  return (
    <div className="min-h-screen bg-white">
      <MainNews mainArticle={mainArticle} secondaryArticles={secondaryArticles} />
      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
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
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
              {gridItems.map((item, idx) =>
                item.type === "banner" ? (
                  <div key={`mid-banner-${idx}`} className="col-span-1 md:col-span-2 lg:col-span-3">
                    <MidBanner
                      banner={midBanners[gridItems.slice(0, idx).filter((i) => i.type === "banner").length] ?? null}
                    />
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
            <ShowMoreContent hasMore={hasMoreContent} onShowMore={handleShowMore} />
          </>
        )}
      </main>
    </div>
  );
}
