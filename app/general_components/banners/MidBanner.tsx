"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { normalizeBannerImageSrc } from "./normalizeBannerImageSrc";
import {
  pickBannerByPriority,
  shuffle,
  type BannerItem,
} from "./pickBannerByPriority";

const BANNERS_API = "/api/v1/banners";
const ARTICLES_API = "/api/v1/articles";
const PRODUCTS_API = "/api/v1/products";
const BANNER_HOVER =
  "transition-opacity duration-200 ease-out hover:opacity-[0.88]";

const ROW_COUNT = 4;

/** Wide strip; slightly taller + higher max-height so art and labels are not clipped. */
const BANNER_ASPECT = "aspect-[1200/260]";
const BANNER_MAX_H = "max-h-[320px] min-h-[168px]";

export type MidBannerVariant =
  | "fullbanner"
  | "bannerrow"
  | "relatedcontent"
  | "relatedproducts";

type ArticleLite = {
  id_article: string;
  articleTitle?: string | null;
  articleSubtitle?: string | null;
  article_main_image_url?: string | null;
};

type ProductLite = {
  id_product: string;
  product_name?: string | null;
  product_description?: string | null;
  main_image_src?: string | null;
};

function pickMediumBannersForRow(banners: BannerItem[], n: number): BannerItem[] {
  const pool = banners.filter((b) => b.bannerType === "medium");
  if (pool.length === 0) return [];
  const shuffled = shuffle([...pool]);
  return Array.from({ length: n }, (_, i) => shuffled[i % shuffled.length]);
}

function pickArticlesForRow(
  articles: ArticleLite[],
  excludeId: string | undefined,
  n: number
): ArticleLite[] {
  let pool = excludeId
    ? articles.filter((a) => a.id_article && a.id_article !== excludeId)
    : [...articles];
  if (pool.length === 0) pool = [...articles];
  if (pool.length === 0) return [];
  const shuffled = shuffle([...pool]);
  return Array.from({ length: n }, (_, i) => shuffled[i % shuffled.length]);
}

function pickProductsForRow(products: ProductLite[], n: number): ProductLite[] {
  if (products.length === 0) return [];
  const shuffled = shuffle([...products]);
  return Array.from({ length: n }, (_, i) => shuffled[i % shuffled.length]);
}

interface MidBannerProps {
  variant?: MidBannerVariant;
  /** When provided, this banner is shown and no fetch happens (avoids duplicates on same page). Fullbanner only. */
  banner?: BannerItem | null;
  sponsorLabel?: string;
  /** Related articles: exclude current article id. */
  excludeArticleId?: string;
}

function MidBannerFull({
  banner,
  sponsorLabel,
}: {
  banner: BannerItem | null;
  sponsorLabel: string;
}) {
  if (!banner) {
    return (
      <div
        className={`w-full ${BANNER_ASPECT} ${BANNER_MAX_H} rounded-sm bg-neutral-200 my-4`}
      />
    );
  }

  const href = banner.bannerRedirection || banner.bannerRoute || "/";
  const sponsorLogo = banner.sponsorLogoSrc;
  const cornerLogo = banner.cornerLogoSrc;

  return (
    <div
      className={`w-full ${BANNER_ASPECT} ${BANNER_MAX_H} relative overflow-hidden rounded-sm bg-neutral-950 my-4 shadow-sm`}
    >
      <Link
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`relative block h-full min-h-[168px] w-full ${BANNER_HOVER}`}
      >
        <Image
          src={normalizeBannerImageSrc(banner.bannerSrc)}
          alt=""
          fill
          className="object-cover object-center"
          sizes="(max-width: 768px) 100vw, min(1200px, 100vw)"
          unoptimized
          priority={false}
        />
        <div className="pointer-events-none absolute left-2 top-2 z-[2] flex max-w-[min(92%,28rem)] flex-wrap items-center gap-2 sm:left-3 sm:top-2.5">
          <span
            className="rounded px-1.5 py-0.5 text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-blue-950 bg-white/50 sm:text-[0.64rem]"
            aria-hidden
          >
            {sponsorLabel}
          </span>
          {sponsorLogo ? (
            <div className="relative h-8 w-[min(120px,32vw)] shrink-0 sm:h-9 sm:w-[min(140px,28vw)]">
              <Image
                src={sponsorLogo}
                alt=""
                fill
                className="object-contain object-left drop-shadow-md"
                sizes="140px"
                unoptimized
              />
            </div>
          ) : null}
        </div>
        {cornerLogo ? (
          <div className="absolute right-3 top-2 z-[3] h-8 w-28 sm:right-5 sm:top-3 sm:h-9 sm:w-36">
            <Image
              src={cornerLogo}
              alt=""
              fill
              className="object-contain object-right object-top drop-shadow-[0_1px_8px_rgba(0,0,0,0.85)]"
              sizes="144px"
              unoptimized
            />
          </div>
        ) : null}
      </Link>
    </div>
  );
}

function MidBannerRowSlot({ banner }: { banner: BannerItem }) {
  const href = banner.bannerRedirection || banner.bannerRoute || "/";
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`relative block aspect-[4/3] w-full min-h-0 overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm transition hover:border-blue-950/40 hover:shadow-md ${BANNER_HOVER}`}
    >
      <Image
        src={normalizeBannerImageSrc(banner.bannerSrc)}
        alt=""
        fill
        className="object-cover object-center"
        sizes="(max-width: 768px) 50vw, 25vw"
        unoptimized
      />
    </Link>
  );
}

function RowSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {Array.from({ length: ROW_COUNT }).map((_, i) => (
        <div
          key={`sk-${i}`}
          className="aspect-[4/3] animate-pulse rounded-md bg-neutral-200"
        />
      ))}
    </div>
  );
}

export default function MidBanner({
  variant = "fullbanner",
  banner: forcedBanner,
  sponsorLabel = "Sponsored by",
  excludeArticleId,
}: MidBannerProps = {}) {
  const [pickedBanner, setPickedBanner] = useState<BannerItem | null>(null);
  const [rowBanners, setRowBanners] = useState<BannerItem[]>([]);
  const [relatedArticles, setRelatedArticles] = useState<ArticleLite[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<ProductLite[]>([]);
  const [rowLoading, setRowLoading] = useState(
    () =>
      variant === "bannerrow" ||
      variant === "relatedcontent" ||
      variant === "relatedproducts"
  );

  const isFull = variant === "fullbanner";

  useEffect(() => {
    if (!isFull) return;
    if (forcedBanner !== undefined) return;
    fetch(BANNERS_API)
      .then((res) => res.json())
      .then((data: BannerItem[]) => {
        const list = Array.isArray(data) ? data : [];
        setPickedBanner(pickBannerByPriority(list, "medium"));
      })
      .catch(() => setPickedBanner(null));
  }, [isFull, forcedBanner]);

  useEffect(() => {
    if (variant !== "bannerrow") return;
    setRowLoading(true);
    fetch(BANNERS_API)
      .then((res) => res.json())
      .then((data: BannerItem[]) => {
        const list = Array.isArray(data) ? data : [];
        setRowBanners(pickMediumBannersForRow(list, ROW_COUNT));
      })
      .catch(() => setRowBanners([]))
      .finally(() => setRowLoading(false));
  }, [variant]);

  useEffect(() => {
    if (variant !== "relatedcontent") return;
    setRowLoading(true);
    fetch(ARTICLES_API)
      .then((res) => res.json())
      .then((data: ArticleLite[]) => {
        const list = Array.isArray(data) ? data : [];
        setRelatedArticles(pickArticlesForRow(list, excludeArticleId, ROW_COUNT));
      })
      .catch(() => setRelatedArticles([]))
      .finally(() => setRowLoading(false));
  }, [variant, excludeArticleId]);

  useEffect(() => {
    if (variant !== "relatedproducts") return;
    setRowLoading(true);
    fetch(PRODUCTS_API)
      .then((res) => res.json())
      .then((data: ProductLite[]) => {
        const list = Array.isArray(data) ? data : [];
        setRelatedProducts(pickProductsForRow(list, ROW_COUNT));
      })
      .catch(() => setRelatedProducts([]))
      .finally(() => setRowLoading(false));
  }, [variant]);

  if (variant === "fullbanner") {
    const banner =
      forcedBanner !== undefined ? forcedBanner : pickedBanner;
    return <MidBannerFull banner={banner} sponsorLabel={sponsorLabel} />;
  }

  if (variant === "bannerrow") {
    return (
      <div className="my-4 w-full rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        {rowLoading ? (
          <RowSkeleton />
        ) : rowBanners.length === 0 ? (
          <RowSkeleton />
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {rowBanners.map((b, i) => (
              <MidBannerRowSlot
                key={`${b.id_banner}-row-${i}`}
                banner={b}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (variant === "relatedcontent") {
    return (
      <section className="mx-auto mt-10 w-full max-w-4xl px-4 md:px-0">
        <h2 className="mb-4 text-2xl font-semibold text-gray-800">
          Related content
        </h2>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          {rowLoading ? (
            <RowSkeleton />
          ) : relatedArticles.length === 0 ? (
            <p className="text-sm text-gray-500">No related articles available.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {relatedArticles.map((a, i) => {
                const img =
                  (a.article_main_image_url ?? "").trim() || "/file.svg";
                const title = (a.articleTitle ?? "").trim() || "Article";
                const sub = (a.articleSubtitle ?? "").trim();
                return (
                  <Link
                    key={`${a.id_article}-rel-${i}`}
                    href={`/articles/${encodeURIComponent(a.id_article)}`}
                    className="flex flex-col rounded-lg border border-gray-200 bg-gray-50/50 p-3 shadow-sm transition-colors hover:border-blue-950 hover:bg-gray-100/80"
                  >
                    <div className="relative mb-3 aspect-video w-full overflow-hidden rounded-md bg-gray-100">
                      <Image
                        src={img}
                        alt=""
                        fill
                        className="object-cover object-center"
                        sizes="(max-width: 1024px) 50vw, 25vw"
                        unoptimized
                      />
                    </div>
                    <span className="mb-1 text-xs font-medium uppercase tracking-wide text-blue-950">
                      Article
                    </span>
                    <span className="font-medium text-gray-800 line-clamp-2">
                      {title}
                    </span>
                    {sub ? (
                      <span className="mt-1 text-sm text-gray-500 line-clamp-2">
                        {sub}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    );
  }

  if (variant === "relatedproducts") {
    return (
      <section className="mx-auto mt-10 w-full max-w-4xl px-4 md:px-0">
        <h2 className="mb-4 text-2xl font-semibold text-gray-800">
          Related products
        </h2>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          {rowLoading ? (
            <RowSkeleton />
          ) : relatedProducts.length === 0 ? (
            <p className="text-sm text-gray-500">No products available.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((p, i) => {
                const img = (p.main_image_src ?? "").trim() || "/file.svg";
                const title = (p.product_name ?? "").trim() || "Product";
                const sub = (p.product_description ?? "").trim();
                return (
                  <Link
                    key={`${p.id_product}-rel-${i}`}
                    href={`/directory/products/${encodeURIComponent(p.id_product)}`}
                    className="flex flex-col rounded-lg border border-gray-200 bg-gray-50/50 p-3 shadow-sm transition-colors hover:border-blue-950 hover:bg-gray-100/80"
                  >
                    <div className="relative mb-3 aspect-video w-full overflow-hidden rounded-md bg-gray-100">
                      <Image
                        src={img}
                        alt=""
                        fill
                        className="object-cover object-center"
                        sizes="(max-width: 1024px) 50vw, 25vw"
                        unoptimized
                      />
                    </div>
                    <span className="mb-1 text-xs font-medium uppercase tracking-wide text-blue-950">
                      Product
                    </span>
                    <span className="font-medium text-gray-800 line-clamp-2">
                      {title}
                    </span>
                    {sub ? (
                      <span className="mt-1 text-sm text-gray-500 line-clamp-2">
                        {sub}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    );
  }

  return <MidBannerFull banner={null} sponsorLabel={sponsorLabel} />;
}
