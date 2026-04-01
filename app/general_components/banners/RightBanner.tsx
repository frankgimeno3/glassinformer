"use client";

import { useState, useEffect, useMemo, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PortalName, portal_id as currentPortalId } from "@/app/GlassInformerSpecificData";
import {
  pickNBannersByPriority,
  shuffle,
  type BannerItem,
} from "./pickBannerByPriority";
import { BannerImageFitWidth } from "./BannerImageFitWidth";
import PublicationFlipbook from "@/app/(main)/publications/publicationComponents/PublicationFlipbook";

const BANNERS_API = "/api/v1/banners";
const PUBLICATIONS_API = "/api/v1/publications";
const PRODUCTS_API = "/api/v1/products";
const ARTICLES_API = "/api/v1/articles";

const RAIL_IMAGE_SIZES = "280px";

/** Hover feedback on clickable rail tiles */
const RAIL_HOVER =
  "transition-opacity duration-200 ease-out hover:opacity-[0.88]";

const RELATED_RAIL_PANEL =
  "rounded-lg border border-blue-900 bg-blue-950 p-3 shadow-sm sm:p-3.5";
const RELATED_RAIL_HEADING =
  "mb-3 text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-white sm:text-[0.82rem]";
const RELATED_RAIL_CARD =
  `group flex flex-row items-stretch gap-3.5 rounded-lg bg-white p-3 shadow-sm ring-1 ring-neutral-200/90 sm:gap-4 ${RAIL_HOVER}`;
const RELATED_RAIL_TITLE =
  "line-clamp-3 text-[0.88rem] font-semibold uppercase leading-snug tracking-wide text-gray-800 sm:text-[0.95rem]";
const RELATED_PRODUCT_TITLE =
  "line-clamp-3 text-left text-[0.88rem] font-normal leading-snug text-gray-800 sm:text-[0.95rem]";
const RELATED_ARTICLE_TITLE =
  "line-clamp-3 text-[0.88rem] font-normal leading-snug text-gray-800 sm:text-[0.95rem]";
const RELATED_RAIL_TAG =
  "inline-flex max-w-full items-center rounded-md bg-blue-950 px-2 py-1 text-[0.74rem] font-normal uppercase tracking-wide text-white sm:text-[0.82rem]";
const RELATED_PRODUCT_TAG =
  "inline-flex max-w-full items-center self-start rounded-md bg-blue-950 px-2 py-1 text-[0.74rem] font-normal uppercase tracking-wide text-white sm:text-[0.82rem]";
const RELATED_RAIL_THUMB =
  "relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-neutral-100 sm:h-[5.5rem] sm:w-[5.5rem]";
const RELATED_THUMB_SIZES = "(max-width: 1280px) 88px, 96px";

type ApiPublication = {
  id_publication?: string;
  redirectionLink?: string | null;
  publication_main_image_url?: string;
  revista?: string;
  /** ISO `YYYY-MM-DD` from API */
  date?: string | null;
};

type ApiProduct = {
  id_product: string;
  product_name?: string;
  main_image_src?: string;
  company_name?: string;
};

type ApiArticle = {
  id_article: string;
  articleTitle?: string;
  article_main_image_url?: string | null;
  portal_id?: number | null;
};

function portalLabelForArticle(articlePortalId: number | null | undefined): string {
  if (articlePortalId == null || articlePortalId === currentPortalId) {
    return PortalName;
  }
  return `Portal ${articlePortalId}`;
}

function publicationExternalHref(link: string | null | undefined): string | null {
  const raw = (link ?? "").trim();
  if (!raw) return null;
  return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
}

/** Matches nav branding (`PortalName` in LoggedNav). */
function portalLastMagazineHeading(): string {
  return `${PortalName.toUpperCase()}'S LAST MAGAZINE`;
}

function formatMagazinePublicationDate(iso: string | null | undefined): string {
  const raw = (iso ?? "").trim();
  if (!raw) return "";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function RightAdStrip({ banner }: { banner: BannerItem }) {
  const href = banner.bannerRedirection || banner.bannerRoute || "/";
  return (
    <div
      className={`relative w-full shrink-0 overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-neutral-200/90 ${RAIL_HOVER}`}
    >
      <Link
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full"
      >
        <BannerImageFitWidth src={banner.bannerSrc} sizes={RAIL_IMAGE_SIZES} />
      </Link>
      <span
        className="pointer-events-none absolute left-1.5 top-1 z-[1] rounded px-1.5 py-0.5 text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-blue-950 bg-white/50 sm:left-2 sm:top-1.5 sm:text-[0.64rem]"
        aria-hidden
      >
        Sponsored by
      </span>
    </div>
  );
}

/** Cover width in the rail — large enough to read, still compact for flip hover. */
const MAGAZINE_FLIPBOOK_MAX_W = "max-w-[172px] sm:max-w-[198px]";

/** Panel heading — space before publication title (×3 vs mb-4 / sm:mb-5). */
const MAGAZINE_PANEL_HEADING =
  "mb-12 text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-white sm:mb-[60px] sm:text-[0.82rem]";
/** Publication title (`revista`): top air; bottom margin tighter when date line follows. */
const MAGAZINE_PUB_TITLE_BASE =
  "mt-9 text-center text-[0.82rem] font-semibold uppercase leading-snug tracking-wide text-white sm:mt-12 sm:text-[0.9rem]";
const MAGAZINE_PUB_DATE =
  "mb-3 text-center text-[0.68rem] font-medium uppercase tracking-[0.12em] text-white/80 sm:mb-4 sm:text-[0.72rem]";
const MAGAZINE_READ_BTN =
  "my-3 block w-full rounded-md border border-white/25 bg-white px-3 py-2.5 text-center text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-blue-950 shadow-sm transition hover:bg-white/95 sm:my-4 sm:text-[0.72rem]";

function MagazineSpaceSection({ publication }: { publication: ApiPublication }) {
  const src = (publication.publication_main_image_url ?? "").trim();
  if (!src) return null;
  const idPub = (publication.id_publication ?? "").trim();
  const informerHref = idPub
    ? `/publications/informer/${encodeURIComponent(idPub)}`
    : null;
  const externalHref = publicationExternalHref(publication.redirectionLink ?? undefined);
  const readHref = informerHref ?? externalHref ?? "/publications/informer";
  const revistaTitle = (publication.revista ?? "").trim() || "Magazine";
  const dateLabel = formatMagazinePublicationDate(publication.date);
  const dateIso = (publication.date ?? "").trim();

  const flipbook = (
    <div
      className={`mx-auto w-full ${MAGAZINE_FLIPBOOK_MAX_W} overflow-visible pt-3 pb-9 sm:pt-4 sm:pb-12`}
    >
      <PublicationFlipbook title={revistaTitle} imageUrl={src} />
    </div>
  );

  const coverInner = informerHref ? (
    <Link href={informerHref} className="block rounded-md">
      {flipbook}
    </Link>
  ) : externalHref ? (
    <a
      href={readHref}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-md"
    >
      {flipbook}
    </a>
  ) : (
    <Link href={readHref} className="block rounded-md">
      {flipbook}
    </Link>
  );

  const readInner = informerHref ? (
    <Link href={informerHref} className={MAGAZINE_READ_BTN}>
      Read magazine
    </Link>
  ) : externalHref ? (
    <a
      href={readHref}
      target="_blank"
      rel="noopener noreferrer"
      className={MAGAZINE_READ_BTN}
    >
      Read magazine
    </a>
  ) : (
    <Link href={readHref} className={MAGAZINE_READ_BTN}>
      Read magazine
    </Link>
  );

  return (
    <div className={`${RELATED_RAIL_PANEL} overflow-visible`}>
      <p className={MAGAZINE_PANEL_HEADING}>{portalLastMagazineHeading()}</p>
      <p
        className={`${MAGAZINE_PUB_TITLE_BASE} ${
          dateLabel ? "mb-1 sm:mb-1.5" : "mb-3 sm:mb-4"
        }`}
      >
        {revistaTitle}
      </p>
      {dateLabel ? (
        <p className={MAGAZINE_PUB_DATE}>
          <time dateTime={dateIso || undefined}>{dateLabel}</time>
        </p>
      ) : null}
      {coverInner}
      {readInner}
    </div>
  );
}

function productTagLabel(product: ApiProduct): string {
  const company = (product.company_name ?? "").trim();
  if (company) return company;
  return PortalName;
}

function RelatedProductCard({ product }: { product: ApiProduct }) {
  const src = (product.main_image_src ?? "").trim() || "/file.svg";
  const title = product.product_name?.trim() || "Product";
  const tag = productTagLabel(product);

  return (
    <Link
      href={`/directory/products/${encodeURIComponent(product.id_product)}`}
      className={RELATED_RAIL_CARD}
    >
      <div className={RELATED_RAIL_THUMB}>
        <Image
          src={src}
          alt=""
          fill
          className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
          sizes={RELATED_THUMB_SIZES}
          unoptimized
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col items-start justify-center gap-1.5 text-left">
        <p className={RELATED_PRODUCT_TITLE}>{title}</p>
        <span className={RELATED_PRODUCT_TAG}>{tag}</span>
      </div>
    </Link>
  );
}

function RelatedProductsSection({ products: productList }: { products: ApiProduct[] }) {
  if (productList.length === 0) return null;
  return (
    <div className={RELATED_RAIL_PANEL}>
      <p className={RELATED_RAIL_HEADING}>Related products</p>
      <div className="flex flex-col gap-4">
        {productList.map((product) => (
          <RelatedProductCard key={product.id_product} product={product} />
        ))}
      </div>
    </div>
  );
}

function RelatedArticleCard({ article }: { article: ApiArticle }) {
  const src = (article.article_main_image_url ?? "").trim() || "/file.svg";
  const title = article.articleTitle?.trim() || "Article";
  const portalTag = portalLabelForArticle(article.portal_id);

  return (
    <Link
      href={`/articles/${encodeURIComponent(article.id_article)}`}
      className={RELATED_RAIL_CARD}
    >
      <div className="flex min-w-0 flex-1 flex-col items-end justify-center gap-1.5 text-right">
        <p className={RELATED_ARTICLE_TITLE}>{title}</p>
        <span className={RELATED_RAIL_TAG}>{portalTag}</span>
      </div>
      <div className={RELATED_RAIL_THUMB}>
        <Image
          src={src}
          alt=""
          fill
          className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
          sizes={RELATED_THUMB_SIZES}
          unoptimized
        />
      </div>
    </Link>
  );
}

function RelatedArticlesSection({ articles }: { articles: ApiArticle[] }) {
  if (articles.length === 0) return null;
  return (
    <div className={RELATED_RAIL_PANEL}>
      <p className={RELATED_RAIL_HEADING}>Related articles</p>
      <div className="flex flex-col gap-4">
        {articles.map((article) => (
          <RelatedArticleCard key={article.id_article} article={article} />
        ))}
      </div>
    </div>
  );
}

export default function RightBanner() {
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [publications, setPublications] = useState<ApiPublication[]>([]);
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [articles, setArticles] = useState<ApiArticle[]>([]);
  const pathname = usePathname();

  useEffect(() => {
    const parseJson = async <T,>(res: Response): Promise<T | null> => {
      if (!res.ok) return null;
      try {
        return (await res.json()) as T;
      } catch {
        return null;
      }
    };

    Promise.all([
      fetch(BANNERS_API).then((r) => parseJson<BannerItem[]>(r)),
      fetch(PUBLICATIONS_API).then((r) => parseJson<ApiPublication[]>(r)),
      fetch(PRODUCTS_API).then((r) => parseJson<ApiProduct[]>(r)),
      fetch(ARTICLES_API).then((r) => parseJson<ApiArticle[]>(r)),
    ]).then(([b, pub, prod, art]) => {
      setBanners(Array.isArray(b) ? b : []);
      setPublications(Array.isArray(pub) ? pub : []);
      setProducts(Array.isArray(prod) ? prod : []);
      setArticles(Array.isArray(art) ? art : []);
    });
  }, []);

  const rightBanners = useMemo(
    () => pickNBannersByPriority(banners, "right", 4, pathname),
    [banners, pathname]
  );

  const featuredPublication = publications[0] ?? null;

  const relatedProductsFour = useMemo(() => {
    const withImg = products.filter((p) => (p.main_image_src ?? "").trim());
    const pool = withImg.length ? withImg : products;
    if (pool.length === 0) return [];
    return shuffle([...pool]).slice(0, Math.min(4, pool.length));
  }, [products]);

  const relatedArticlesFour = useMemo(() => {
    if (articles.length === 0) return [];
    return shuffle([...articles]).slice(0, Math.min(4, articles.length));
  }, [articles]);

  const slots = useMemo(() => {
    const b = rightBanners;
    const nodes: ReactNode[] = [];

    const push = (el: ReactNode) => {
      if (el) nodes.push(el);
    };

    if (b[0]) push(<RightAdStrip key="rb-0" banner={b[0]} />);
    if (featuredPublication) {
      const block = <MagazineSpaceSection key="mag" publication={featuredPublication} />;
      push(block);
    }
    if (b[1]) push(<RightAdStrip key="rb-1" banner={b[1]} />);
    if (relatedProductsFour.length > 0) {
      push(<RelatedProductsSection key="prod" products={relatedProductsFour} />);
    }
    if (b[2]) push(<RightAdStrip key="rb-2" banner={b[2]} />);
    if (relatedArticlesFour.length > 0) {
      push(<RelatedArticlesSection key="art" articles={relatedArticlesFour} />);
    }
    if (b[3]) push(<RightAdStrip key="rb-3" banner={b[3]} />);

    return nodes;
  }, [rightBanners, featuredPublication, relatedProductsFour, relatedArticlesFour]);

  if (slots.length === 0) {
    return (
      <div
        className="sticky top-28 min-h-[100px] w-full rounded-lg bg-gray-100"
        aria-hidden
      />
    );
  }

  return (
    <div className="sticky top-28 mb-6 flex w-full flex-col gap-4 pr-2 pb-6 pt-5">
      {slots}
    </div>
  );
}
