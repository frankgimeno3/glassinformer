"use client";

import { FC, Suspense, useEffect, useMemo, useState } from "react";

import ArticleMiniature from "../main_components/ArticleMiniature";
import ArticleFilter from "./article_components/ArticleFilter";
import { ArticleService } from "@/apiClient/ArticleService";
import MidBanner from "@/app/general_components/banners/MidBanner";
import { pickNBannersByPriority, type BannerItem } from "@/app/general_components/banners/pickBannerByPriority";
import ShowMoreContent from "../main_components/ShowMoreContent";

const BANNERS_API = "/api/v1/banners";

interface ArticlesProps {}

const ROWS_PER_BANNER = 3;
const COLS = 3;
const BLOCK_SIZE = ROWS_PER_BANNER * COLS; // 9 artículos por bloque → MidBanner cada 3 filas
const INITIAL_VISIBLE_ROWS = 6; // máximo 6 filas al inicio

const Articles: FC<ArticlesProps> = ({}) => {
  const [allArticles, setAllArticles] = useState<any[]>([]);
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleRows, setVisibleRows] = useState(INITIAL_VISIBLE_ROWS);

  const fetchArticles = async () => {
    try {
      const apiArticles = await ArticleService.getAllArticles();
      const valid = Array.isArray(apiArticles)
        ? apiArticles.filter((art: any) => art && art.id_article && art.articleTitle)
        : [];
      setAllArticles(valid);
    } catch (error: any) {
      console.error("Error fetching articles:", error);
      if (error?.message) console.error("Error message:", error.message);
      if (error?.data) console.error("Error data:", error.data);
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

  const validArticles = useMemo(
    () =>
      allArticles
        .filter((a: any) => a && a.id_article && a.articleTitle)
        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [allArticles]
  );

  const articlesToShow = visibleRows * COLS;
  const visibleArticles = useMemo(
    () => validArticles.slice(0, articlesToShow),
    [validArticles, articlesToShow]
  );

  const totalRows = Math.ceil(validArticles.length / COLS);
  const hasMore = visibleRows < totalRows;

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

  const handleShowMore = () => {
    setVisibleRows((prev) => prev + INITIAL_VISIBLE_ROWS);
  };

  return (
    <div className="flex flex-col w-full bg-white min-h-screen">
      <div className="flex flex-col text-center bg-blue-950/70 p-5 px-46 text-white">
        <p className="text-2xl">All articles</p>
      </div>

      <Suspense fallback={<div className="px-36 mx-7"><div className="flex flex-col border border-gray-100 shadow-xl text-center py-2 text-xs"><p>Loading filter...</p></div></div>}>
        <ArticleFilter />
      </Suspense>

      <main className="max-w-7xl mx-auto w-full pt-12 px-4 sm:px-6 lg:px-8 pb-16">
        {loading ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg font-serif">Loading articles...</p>
          </div>
        ) : validArticles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-gray-400 text-xl font-serif">No articles available</p>
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
            <ShowMoreContent hasMore={hasMore} onShowMore={handleShowMore} />
          </>
        )}
      </main>
    </div>
  );
};

export default Articles;