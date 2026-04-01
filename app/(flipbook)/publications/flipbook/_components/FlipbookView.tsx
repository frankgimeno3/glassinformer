"use client";

import {
  useRef,
  useState,
  useCallback,
  useEffect,
  useLayoutEffect,
} from "react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type {
  ArticleContentBlock,
  FlipbookPage,
  Company,
} from "../_types/flipbook";
import { getUnsplashImageUrl } from "../_lib/unsplash";
import {
  fetchAndCacheSpread,
  getCachedSpread,
  setCachedSpread,
  type SpreadPayload,
} from "../_lib/spread-cache";
import FlipbookNav from "./FlipbookNav";

const ZOOM_MIN = 0.5;
const ZOOM_MAX = 2;
const ZOOM_STEP = 0.1;
const ZOOM_ANIMATION_DURATION_MS = 1200;
const TURN_DURATION_MS = 1400;

/** Query que mantiene el modo inmersivo / pantalla completa al cambiar de spread */
const FLIPBOOK_FS_PARAM = "fs";
const FLIPBOOK_FS_VALUE = "1";

/** Indicador neutro mientras llega el contenido (p. ej. datos del spread desde API/RDS). */
export function FlipbookLoadingSpinner({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      className={`flex items-center justify-center ${className}`}
      role="status"
      aria-live="polite"
      aria-label="Cargando"
    >
      <span className="sr-only">Cargando</span>
      <div
        className="h-10 w-10 shrink-0 rounded-full border-2 border-stone-300/55 border-t-stone-400/75 animate-spin motion-reduce:animate-none motion-reduce:border-stone-400/50"
        aria-hidden
      />
    </div>
  );
}

export function flipbookSpreadPath(
  flipbookBasePath: string,
  spreadLabel: string,
  immersive: boolean
): string {
  const path = `${flipbookBasePath}/${spreadLabel}`;
  return immersive ? `${path}?${FLIPBOOK_FS_PARAM}=${FLIPBOOK_FS_VALUE}` : path;
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/** Proporción 228×297 mm (como hoja revista) */
const PAGE_ASPECT_RATIO = 228 / 297;

/** Gap entre páginas (mismo que gap-4) y estilo base de cada slot del spread */
const GAP_PX = 16;
const SPREAD_SLOT_STYLE: Record<string, string | number> = {
  aspectRatio: `${PAGE_ASPECT_RATIO}`,
  width: "min(35vw, 739px)",
  minWidth: "min(90vw, 216px)",
};

interface PageWithCompany {
  page: FlipbookPage;
  company?: Company;
  loremParagraphs: string[];
}

export interface ArticleIndexEntry {
  page_number: number;
  titulo: string;
}

export interface FlipbookViewProps {
  publicationId: string;
  /** Ruta base sin barra final, p. ej. `/publications/flipbook/mi-id` */
  flipbookBasePath: string;
  currentStep: number;
  spreadLabel: string;
  prevSpreadLabel: string | null;
  nextSpreadLabel: string | null;
  firstSpreadLabel?: string | null;
  lastSpreadLabel?: string | null;
  viewData: PageWithCompany[];
  articleIndex: ArticleIndexEntry[];
  nextStep: number | null;
  prevStep: number | null;
  currentPosition: number;
  totalSteps: number;
  prefetchSpreadLabels: string[];
}

type EffectiveSide = "left" | "right";

function effectiveSide(page: FlipbookPage): EffectiveSide {
  if (page.page_type === "cover" || page.page_side === "cover") return "right";
  if (page.page_side === "end" || page.page_type === "backCover") return "left";
  return page.page_side === "left" ? "left" : "right";
}

/** Reparte viewData en left/right según effectiveSide. */
function splitSpread(
  data: PageWithCompany[]
): { left?: PageWithCompany; right?: PageWithCompany } {
  const out: { left?: PageWithCompany; right?: PageWithCompany } = {};
  for (const item of data) {
    const side = effectiveSide(item.page);
    if (side === "left") out.left = item;
    else out.right = item;
  }
  return out;
}

/** Zonas: tercio exterior (33%) + (top 5% | bottom 5% | borde exterior 10%). Click: borde 10% o buffer 100px. */
function hitTestZones(
  pageRect: DOMRect,
  clientX: number,
  clientY: number,
  side: EffectiveSide
): { pointer: boolean; click: boolean } {
  const { left, top, width, height } = pageRect;
  const x = clientX - left;
  const y = clientY - top;
  const third = width / 3;
  const top5 = height * 0.05;
  const bottom5 = height - height * 0.05;
  const edge10 = width * 0.1;
  const inOuterThird =
    side === "left" ? x < third : x > width - third;
  const inTopBottom = y < top5 || y > bottom5;
  const inOuterEdge = side === "left" ? x < edge10 : x > width - edge10;
  const pointer = inOuterThird && (inTopBottom || inOuterEdge);
  const inBuffer100 =
    side === "left"
      ? clientX >= pageRect.left - 100 && clientX < pageRect.left
      : clientX > pageRect.right && clientX <= pageRect.right + 100;
  const click = inOuterEdge || inBuffer100;
  return { pointer, click };
}

function getTypeLabel(page: FlipbookPage): string {
  switch (page.page_type) {
    case "advertiserIndex":
      return "Índice de anunciantes";
    case "Summary":
      return "Sumario de contenidos";
    case "cover":
      return "Portada";
    case "advert":
      return "Publicidad";
    case "backCover":
      return "Contraportada";
    default:
      return "Artículo";
  }
}

function ArticleContentBlocks({ blocks }: { blocks: ArticleContentBlock[] }) {
  const bodyText =
    "text-justify text-[11px] leading-[1.42] text-stone-900 [hyphens:auto]";
  const rowSplit =
    "col-span-2 grid grid-cols-1 items-start gap-y-2 sm:grid-cols-2 sm:gap-x-3 sm:gap-y-0";
  const imgCell =
    "relative aspect-[5/3] min-h-[76px] w-full overflow-hidden rounded-sm bg-stone-200 sm:aspect-[4/3] sm:min-h-[104px]";

  return (
    <div
      lang="es"
      className="mt-2 grid min-h-0 flex-1 auto-rows-min grid-cols-2 gap-x-3 gap-y-2.5 overflow-y-auto pr-0.5"
    >
      {blocks.map((block, i) => {
        const key = `${i}-${block.kind}`;
        switch (block.kind) {
          case "onlytext": {
            if (!block.text) return null;
            const flow = block.textFlow ?? "newspaper";
            if (flow === "half") {
              return (
                <div key={key} className="col-span-1 min-w-0">
                  <p className={bodyText}>{block.text}</p>
                </div>
              );
            }
            if (flow === "block") {
              return (
                <div key={key} className="col-span-2 min-w-0">
                  <p className={bodyText}>{block.text}</p>
                </div>
              );
            }
            return (
              <div key={key} className="col-span-2 min-w-0">
                <p className={`${bodyText} columns-2 gap-x-4`}>{block.text}</p>
              </div>
            );
          }
          case "onlyimage":
            return block.src ? (
              <div key={key} className="col-span-2 min-w-0">
                <div className="relative aspect-[16/7] max-h-[9.5rem] w-full overflow-hidden rounded-sm bg-stone-200 sm:max-h-40">
                  <Image
                    src={block.src}
                    alt=""
                    fill
                    draggable={false}
                    className="pointer-events-none object-cover select-none"
                    sizes="(max-width: 1200px) 90vw, 400px"
                  />
                </div>
              </div>
            ) : null;
          case "imagetext":
            return (
              <div key={key} className={rowSplit}>
                {block.src ? (
                  <div className={imgCell}>
                    <Image
                      src={block.src}
                      alt=""
                      fill
                      draggable={false}
                      className="pointer-events-none object-cover select-none"
                      sizes="200px"
                    />
                  </div>
                ) : (
                  <div className="min-h-0 min-w-0" />
                )}
                {block.text ? (
                  <p className={`min-w-0 ${bodyText}`}>{block.text}</p>
                ) : (
                  <div className="min-h-0 min-w-0" />
                )}
              </div>
            );
          case "textimage":
            return (
              <div key={key} className={rowSplit}>
                {block.text ? (
                  <p className={`min-w-0 ${bodyText}`}>{block.text}</p>
                ) : (
                  <div className="min-h-0 min-w-0" />
                )}
                {block.src ? (
                  <div className={imgCell}>
                    <Image
                      src={block.src}
                      alt=""
                      fill
                      draggable={false}
                      className="pointer-events-none object-cover select-none"
                      sizes="200px"
                    />
                  </div>
                ) : (
                  <div className="min-h-0 min-w-0" />
                )}
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}

/** Logo tipo cabecera de revista para la portada */
function MagazineLogo() {
  return (
    <div className="flex flex-col items-center justify-center py-6 text-center">
      <div
        className="mb-1 text-[10px] font-medium tracking-[0.35em] text-amber-300/90 uppercase"
        style={{ textShadow: "0 2px 12px rgba(0, 0, 0, 0.72)" }}
      >
        La revista del sector del vidrio
      </div>
      <div
        className="font-serif text-4xl font-bold tracking-tight text-white md:text-5xl"
        style={{ textShadow: "0 3px 18px rgba(0, 0, 0, 0.78)" }}
      >
        Glass
      </div>
      <div
        className="-mt-1 font-serif text-3xl font-bold tracking-[0.2em] text-amber-400 md:text-4xl"
        style={{ textShadow: "0 3px 18px rgba(0, 0, 0, 0.78)" }}
      >
        INFORMER
      </div>
      <div className="mt-2 h-px w-24 bg-amber-500/70 shadow-[0_0_16px_rgba(251,191,36,0.45)]" />
    </div>
  );
}

function PageCard({
  data,
  articleIndex,
  disableBackdropDuringTurn = false,
}: {
  data: PageWithCompany;
  articleIndex: ArticleIndexEntry[];
  disableBackdropDuringTurn?: boolean;
}) {
  const { page, company, loremParagraphs } = data;
  const imageUrl = page.imageUrl ?? getUnsplashImageUrl(page.page_id);
  const articleHeroSrc =
    page.mainImage ?? page.imageUrl ?? getUnsplashImageUrl(page.page_id);
  const typeLabel = page.sectionLabel ?? getTypeLabel(page);
  const hasBgImage =
    page.page_type === "cover" ||
    page.page_type === "advert" ||
    page.page_type === "backCover";
  const isArticle = page.page_type === "article";
  const showLorem =
    page.page_type === "article" ||
    page.page_type === "advert" ||
    page.page_type === "backCover";
  const isSummary = page.page_type === "Summary";

  return (
    <div
      className="relative flex flex-col overflow-hidden rounded-lg border border-stone-400/50 shadow-2xl"
      style={{
        aspectRatio: `${PAGE_ASPECT_RATIO}`,
        width: "min(35vw, 739px)",
        minWidth: "min(90vw, 216px)",
      }}
    >
      {/* Base blanca siempre presente: evita transparencia durante el giro 3D */}
      <div className="absolute inset-0 rounded-lg bg-white" aria-hidden />
      {/* Fondo imagen: solo cover, advert, backCover */}
      {hasBgImage && (
        <div className="absolute inset-0">
          <Image
            src={imageUrl}
            alt=""
            fill
            draggable={false}
            className={`pointer-events-none select-none ${page.page_type === "cover" ? "scale-105 object-cover saturate-[1.08] brightness-[0.92]" : "object-cover"}`}
            sizes="(max-width: 1200px) 90vw, 739px"
          />
          <div
            className={`absolute inset-0 ${page.page_type === "cover" ? "bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.18),transparent_34%),linear-gradient(to_bottom,rgba(12,10,9,0.28),rgba(12,10,9,0.62))]" : "bg-stone-900/50"}`}
            aria-hidden
          />
        </div>
      )}

      {/* Fondo claro para article, Summary, advertiserIndex */}
      {!hasBgImage && (
        <div className="absolute inset-0 bg-stone-100" aria-hidden />
      )}

      <div
        className={`relative z-10 flex flex-1 flex-col ${hasBgImage ? "text-white" : "text-stone-800"}`}
      >
        {/* Cover: logo centrado; temario y datos del número fijados en la base */}
        {page.page_type === "cover" && (
          <>
            {(page.coverTemarioLines?.length || page.coverIssueLines?.length) ? (
              <div className="pointer-events-none absolute bottom-4 left-4 right-4 z-20 max-h-[42%] overflow-y-auto rounded-xl border border-white/12 bg-black/48 px-3.5 py-3.5 shadow-[0_14px_40px_rgba(0,0,0,0.42)] backdrop-blur-[4px] sm:bottom-5 sm:left-5 sm:right-5 sm:px-4 sm:py-4">
                {page.coverTemarioLines && page.coverTemarioLines.length > 0 ? (
                  <div className={page.coverIssueLines && page.coverIssueLines.length > 0 ? "mb-3 border-b border-white/15 pb-2.5" : ""}>
                    <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.22em] text-amber-200/95">
                      Temario
                    </p>
                    <ul className="space-y-1 text-left text-[11px] leading-[1.3] text-white/95">
                      {page.coverTemarioLines.map((line, i) => (
                        <li key={i}>{line}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {page.coverIssueLines && page.coverIssueLines.length > 0 ? (
                  <div className="text-left">
                    <p className="mb-1.5 text-[8px] font-semibold uppercase tracking-[0.22em] text-amber-200/95">
                      Datos del número
                    </p>
                    {page.coverIssueThematic ? (
                      <p className="mb-2 text-[11px] font-semibold leading-tight text-amber-100">
                        {page.coverIssueThematic}
                      </p>
                    ) : null}
                    <ul className="space-y-1 text-[10px] leading-snug text-stone-100/95">
                      {page.coverIssueLines.map((line, i) => (
                        <li key={i}>{line}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ) : null}
            <div className="relative z-10 flex shrink-0 flex-col items-center pt-4">
              <MagazineLogo />
              {page.coverRevista ? (
                <p
                  className="mt-2 max-w-[90%] px-3 text-center text-base font-semibold leading-tight text-white sm:text-lg"
                  style={{ textShadow: "0 3px 18px rgba(0, 0, 0, 0.76)" }}
                >
                  {page.coverRevista}
                </p>
              ) : null}
            </div>
            <div
              className="relative z-10 mt-auto px-5 pb-5 text-center text-[11px] text-stone-300"
              style={{ textShadow: "0 2px 10px rgba(0, 0, 0, 0.72)" }}
            >
              {!page.coverIssueLines?.length && page.coverTagline ? (
                <span className="mb-1.5 block text-stone-200/85">
                  {page.coverTagline}
                </span>
              ) : null}
              Portada
            </div>
          </>
        )}

        {/* Article: imagen arriba → título → subtítulo → 3 columnas */}
        {isArticle && (
          <>
            <div className="relative h-[24%] min-h-[100px] w-full shrink-0 overflow-hidden">
              <Image
                src={articleHeroSrc}
                alt=""
                fill
                draggable={false}
                className="pointer-events-none object-cover select-none"
                sizes="(max-width: 1200px) 90vw, 739px"
              />
            </div>
            <div className="flex min-h-0 flex-1 flex-col px-4 pb-4 pt-3">
              <div className="mb-0.5 text-[9px] font-medium uppercase tracking-wider text-amber-800">
                {typeLabel}
              </div>
              <h2 className="text-lg font-bold leading-tight text-stone-900 sm:text-xl">
                {page.titulo}
              </h2>
              {page.subtitulo && (
                <p className="mt-0.5 text-xs leading-snug text-stone-600">
                  {page.subtitulo}
                </p>
              )}
              {page.articleContents && page.articleContents.length > 0 ? (
                <ArticleContentBlocks blocks={page.articleContents} />
              ) : (
                <div className="mt-2 flex-1 text-justify text-[11px] leading-[1.42] text-stone-800 columns-2 gap-x-4">
                  {loremParagraphs.map((para, i) => (
                    <p key={i} className="mb-2 break-inside-avoid">
                      {para}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Advert, backCover: contenido sobre imagen de fondo */}
        {(page.page_type === "advert" || page.page_type === "backCover") && (
          <div className="flex flex-1 flex-col p-6">
            <div className="mb-1 text-[10px] font-medium uppercase tracking-wider text-amber-200">
              {typeLabel}
            </div>
            <div className="text-sm text-stone-300">
              Página {page.page_number + 1}
            </div>
            {page.titulo && (
              <h2 className="mt-2 text-lg font-bold text-white">
                {page.titulo}
              </h2>
            )}
            {showLorem && loremParagraphs.length > 0 && (
              <div className="mt-3 flex-1 text-justify text-[12px] leading-relaxed text-stone-200 columns-3 gap-3">
                {loremParagraphs.map((para, i) => (
                  <p key={i} className="mb-2 break-inside-avoid">
                    {para}
                  </p>
                ))}
              </div>
            )}
            {page.page_type === "backCover" && (
              <div className="mt-4 text-sm text-stone-400">
                © Revista Glass Informer. Todos los derechos reservados.
              </div>
            )}
          </div>
        )}

        {/* Summary, advertiserIndex: sin imagen de fondo */}
        {(isSummary || page.page_type === "advertiserIndex") && (
          <div className="flex flex-1 flex-col p-6">
            <div className="mb-1 text-[10px] font-medium uppercase tracking-wider text-amber-700">
              {typeLabel}
            </div>
            <div className="text-sm text-stone-500">
              Página {page.page_number + 1}
            </div>
            {isSummary && (
              <div className="mt-4 flex-1">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-stone-600">
                  Índice de contenidos
                </h3>
                <ul className="space-y-2 text-sm text-stone-700">
                  {articleIndex.map((entry) => (
                    <li key={entry.page_number} className="flex gap-2">
                      <span className="shrink-0 font-medium text-amber-700">
                        {entry.page_number + 1}.
                      </span>
                      <span>{entry.titulo}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {page.page_type === "advertiserIndex" && (
              <div className="mt-4 text-sm italic text-stone-600">
                Índice de anunciantes de este número.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Topo: empresa, abajo a la derecha (sin backdrop-blur durante giro para evitar mezcla) */}
      {company && (
        <div
          className={`absolute bottom-4 right-4 z-10 max-w-[220px] rounded-lg p-3 shadow-xl ${disableBackdropDuringTurn ? (hasBgImage ? "border border-amber-400/60 bg-stone-900" : "border border-stone-300 bg-white") : `backdrop-blur-sm ${hasBgImage ? "border border-amber-400/60 bg-stone-900/90" : "border border-stone-300 bg-white/95"}`}`}
        >
          <div className={`mb-0.5 text-[10px] font-medium uppercase tracking-wider ${hasBgImage ? "text-amber-300" : "text-amber-600"}`}>
            Anunciante
          </div>
          <div className={`text-sm font-semibold ${hasBgImage ? "text-white" : "text-stone-800"}`}>
            {company.company_name}
          </div>
          <a
            href={`mailto:${company.company_email}`}
            className={`mt-0.5 block truncate text-xs hover:underline ${hasBgImage ? "text-amber-200" : "text-amber-700"}`}
          >
            {company.company_email}
          </a>
          <div className={`text-[10px] ${hasBgImage ? "text-stone-400" : "text-stone-500"}`}>
            {company.company_phone}
          </div>
          <a
            href={company.company_web}
            target="_blank"
            rel="noopener noreferrer"
            className={`mt-0.5 block truncate text-[10px] hover:underline ${hasBgImage ? "text-amber-200" : "text-amber-600"}`}
          >
            {company.company_web}
          </a>
        </div>
      )}
    </div>
  );
}

function clampPan(
  pan: { x: number; y: number },
  viewportW: number,
  viewportH: number,
  contentW: number,
  contentH: number,
  zoom: number
): { x: number; y: number } {
  const scaledW = contentW * zoom;
  const scaledH = contentH * zoom;
  const minX = viewportW / 2 - scaledW + contentW / 2;
  const maxX = contentW / 2 - viewportW / 2;
  const minY = viewportH / 2 - scaledH + contentH / 2;
  const maxY = contentH / 2 - viewportH / 2;
  const clamp = (v: number, lo: number, hi: number) =>
    Math.max(lo, Math.min(hi, v));
  return {
    x: minX <= maxX ? clamp(pan.x, minX, maxX) : 0,
    y: minY <= maxY ? clamp(pan.y, minY, maxY) : 0,
  };
}

/** Escena de giro: underlay z0, estático z10, hoja z50. Una sola cara opaca; swap en t=0.5 + scaleX(-1). Micro shrink al final. */
function TurnScene({
  fromSpread,
  toSpread,
  turnDir,
  turnProgress,
  articleIndex,
  stageSize,
  turningCardSize,
  turnGapPx,
}: {
  fromSpread: PageWithCompany[];
  toSpread: PageWithCompany[];
  turnDir: "prev" | "next";
  turnProgress: number;
  articleIndex: ArticleIndexEntry[];
  stageSize: { w: number; h: number };
  turningCardSize?: { w: number; h: number } | null;
  turnGapPx?: number;
}) {
  const fromLR = splitSpread(fromSpread);
  const toLR = splitSpread(toSpread);
  const gap = turnGapPx ?? 0;

  const firstHalf = turnProgress < 0.5;
  const t1 = firstHalf ? turnProgress / 0.5 : (turnProgress - 0.5) / 0.5;
  const angle =
    turnDir === "next"
      ? firstHalf
        ? -90 * t1
        : -90 - 90 * t1
      : firstHalf
        ? 90 * t1
        : 90 + 90 * t1;
  const zTweak = 1.5 * Math.sin(Math.PI * turnProgress) * (turnDir === "next" ? 1 : -1);
  const f = easeInOutCubic(turnProgress);
  const tx = (turnDir === "next" ? -1 : 1) * gap * f;

  const END_SHRINK_START = 0.85;
  const END_SCALE = 0.985;
  const endT = Math.max(0, Math.min(1, (turnProgress - END_SHRINK_START) / (1 - END_SHRINK_START)));
  const shrink = 1 - (1 - END_SCALE) * easeInOutCubic(endT);

  const slotClass = "flex shrink-0 items-stretch justify-center";
  const cardStyle = SPREAD_SLOT_STYLE;
  const layoutClass = "absolute inset-0 flex items-stretch justify-center";
  const layoutStyle = { gap: GAP_PX };
  const sheetSlotStyle = {
    ...cardStyle,
    ...(turningCardSize ? { width: turningCardSize.w, height: turningCardSize.h } : {}),
  };
  const placeholderSlotStyle = { ...cardStyle, visibility: "hidden" as const, pointerEvents: "none" as const };
  const sheetTransformOrigin = turnDir === "next" ? "0% 50%" : "100% 50%";
  const sheetTransform =
    `translateX(${tx}px) translateZ(60px) rotateY(${angle}deg) rotateZ(${zTweak}deg) scale(${shrink})`;

  const showFrom = firstHalf;
  const fromPage = turnDir === "next" ? fromLR.right : fromLR.left;
  const toFacingPage = turnDir === "next" ? toLR.left : toLR.right;
  const flipContent = !firstHalf;

  const underlayRevealThreshold = 0.98;
  const showUnderlayLeft = fromLR.left != null || turnProgress >= underlayRevealThreshold;
  const showUnderlayRight = fromLR.right != null || turnProgress >= underlayRevealThreshold;

  return (
    <div
      className="relative w-full h-full"
      style={{
        width: stageSize.w,
        height: stageSize.h,
        position: "relative",
        isolation: "isolate",
        transform: "translateZ(0)",
        willChange: "transform",
      }}
    >
      {/* Underlay: spread destino — z0; ocultar slot que estaba vacío en FROM hasta el final (cover/end) */}
      <div className={layoutClass} style={{ position: "absolute", inset: 0, zIndex: 0, ...layoutStyle }}>
        <div className={slotClass} style={showUnderlayLeft && toLR.left ? cardStyle : placeholderSlotStyle} aria-hidden={!(showUnderlayLeft && toLR.left)}>
          {showUnderlayLeft && toLR.left ? (
            <PageCard data={toLR.left} articleIndex={articleIndex} disableBackdropDuringTurn />
          ) : (
            <div className="w-full h-full" style={{ visibility: "hidden", pointerEvents: "none" }} aria-hidden />
          )}
        </div>
        <div className={slotClass} style={showUnderlayRight && toLR.right ? cardStyle : placeholderSlotStyle} aria-hidden={!(showUnderlayRight && toLR.right)}>
          {showUnderlayRight && toLR.right ? (
            <PageCard data={toLR.right} articleIndex={articleIndex} disableBackdropDuringTurn />
          ) : (
            <div className="w-full h-full" style={{ visibility: "hidden", pointerEvents: "none" }} aria-hidden />
          )}
        </div>
      </div>

      {/* Sombra proyectada sobre underlay (solo overlay, opacity en gradient) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          background: `linear-gradient(${turnDir === "next" ? "to left" : "to right"}, transparent 60%, rgba(0,0,0,${0.15 * Math.sin(Math.PI * turnProgress)}) 100%)`,
        }}
      />

      {/* Lado estático (from): solo el lado que NO gira; el que gira va en placeholder para no dejar copia */}
      <div
        className={layoutClass}
        style={{ position: "absolute", inset: 0, zIndex: 10, perspective: "2400px", ...layoutStyle }}
      >
        <div className={slotClass} style={turnDir === "next" && fromLR.left ? cardStyle : placeholderSlotStyle} aria-hidden={!(turnDir === "next" && fromLR.left)}>
          {turnDir === "next" && fromLR.left ? (
            <PageCard data={fromLR.left} articleIndex={articleIndex} disableBackdropDuringTurn />
          ) : (
            <div className="w-full h-full" style={{ visibility: "hidden", pointerEvents: "none" }} aria-hidden />
          )}
        </div>
        <div className={slotClass} style={turnDir === "prev" && fromLR.right ? cardStyle : placeholderSlotStyle} aria-hidden={!(turnDir === "prev" && fromLR.right)}>
          {turnDir === "prev" && fromLR.right ? (
            <PageCard data={fromLR.right} articleIndex={articleIndex} disableBackdropDuringTurn />
          ) : (
            <div className="w-full h-full" style={{ visibility: "hidden", pointerEvents: "none" }} aria-hidden />
          )}
        </div>
      </div>

      {/* Hoja que gira — z50, dos slots fijos; sheet en el slot que gira */}
      <div
        className={layoutClass}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 50,
          pointerEvents: "none",
          perspective: "2400px",
          ...layoutStyle,
        }}
      >
        {turnDir === "next" ? (
          <>
            <div className={slotClass} style={placeholderSlotStyle} aria-hidden />
            {(fromLR.right ?? toLR.left) && (
              <div
                className={slotClass}
                style={{
                  ...sheetSlotStyle,
                  overflow: "hidden",
                  transformStyle: "preserve-3d",
                  transformOrigin: sheetTransformOrigin,
                  transform: sheetTransform,
                  willChange: "transform",
                }}
              >
                <div className="relative w-full h-full" style={{ height: "100%" }}>
                  <div className="absolute inset-0" style={{ zIndex: 1 }}>
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        transform: flipContent ? "scaleX(-1)" : undefined,
                      }}
                    >
                      {showFrom && fromPage ? (
                        <PageCard data={fromPage} articleIndex={articleIndex} disableBackdropDuringTurn />
                      ) : toFacingPage ? (
                        <PageCard data={toFacingPage} articleIndex={articleIndex} disableBackdropDuringTurn />
                      ) : (
                        <div className="h-full w-full rounded-lg bg-white" aria-hidden />
                      )}
                    </div>
                  </div>
                  <div
                    className="absolute inset-0 pointer-events-none rounded-lg"
                    style={{
                      zIndex: 5,
                      background: `linear-gradient(to right, rgba(0,0,0,${0.25 * turnProgress}) 0%, transparent 30%)`,
                    }}
                  />
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {(fromLR.left ?? toLR.right) && (
              <div
                className={slotClass}
                style={{
                  ...sheetSlotStyle,
                  overflow: "hidden",
                  transformStyle: "preserve-3d",
                  transformOrigin: sheetTransformOrigin,
                  transform: sheetTransform,
                  willChange: "transform",
                }}
              >
                <div className="relative w-full h-full" style={{ height: "100%" }}>
                  <div className="absolute inset-0" style={{ zIndex: 1 }}>
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        transform: flipContent ? "scaleX(-1)" : undefined,
                      }}
                    >
                      {showFrom && fromPage ? (
                        <PageCard data={fromPage} articleIndex={articleIndex} disableBackdropDuringTurn />
                      ) : toFacingPage ? (
                        <PageCard data={toFacingPage} articleIndex={articleIndex} disableBackdropDuringTurn />
                      ) : (
                        <div className="h-full w-full rounded-lg bg-white" aria-hidden />
                      )}
                    </div>
                  </div>
                  <div
                    className="absolute inset-0 pointer-events-none rounded-lg"
                    style={{
                      zIndex: 5,
                      background: `linear-gradient(to left, rgba(0,0,0,${0.25 * turnProgress}) 0%, transparent 30%)`,
                    }}
                  />
                </div>
              </div>
            )}
            <div className={slotClass} style={placeholderSlotStyle} aria-hidden />
          </>
        )}
      </div>
    </div>
  );
}

const EDGE_PERCENT = 10;
const BUFFER_PX = 100;

function requestFullscreenOnElement(el: HTMLElement): Promise<void> {
  const extended = el as HTMLElement & {
    webkitRequestFullscreen?: () => void;
  };
  if (typeof el.requestFullscreen === "function") {
    return el.requestFullscreen().catch(() => undefined);
  }
  if (typeof extended.webkitRequestFullscreen === "function") {
    extended.webkitRequestFullscreen();
    return Promise.resolve();
  }
  return Promise.resolve();
}

function exitFullscreenIfActive(el: HTMLElement | null): Promise<void> {
  if (!document.fullscreenElement) return Promise.resolve();
  if (el && document.fullscreenElement !== el) return Promise.resolve();
  const doc = document as Document & { webkitExitFullscreen?: () => void };
  if (typeof document.exitFullscreen === "function") {
    return document.exitFullscreen().catch(() => undefined);
  }
  if (typeof doc.webkitExitFullscreen === "function") {
    doc.webkitExitFullscreen();
    return Promise.resolve();
  }
  return Promise.resolve();
}

export default function FlipbookView({
  publicationId,
  flipbookBasePath,
  currentStep,
  spreadLabel,
  prevSpreadLabel,
  nextSpreadLabel,
  firstSpreadLabel,
  lastSpreadLabel,
  viewData,
  articleIndex,
  nextStep,
  prevStep,
  currentPosition,
  totalSteps,
  prefetchSpreadLabels,
}: FlipbookViewProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [pointerCursor, setPointerCursor] = useState(false);
  const [isTurning, setIsTurning] = useState(false);
  const [turnDir, setTurnDir] = useState<"prev" | "next" | null>(null);
  const [fromSpread, setFromSpread] = useState<PageWithCompany[] | null>(null);
  const [toSpread, setToSpread] = useState<PageWithCompany[] | null>(null);
  const [turnProgress, setTurnProgress] = useState(0);
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [stageSize, setStageSize] = useState<{ w: number; h: number } | null>(null);
  const [turningCardSize, setTurningCardSize] = useState<{ w: number; h: number } | null>(null);
  const [turnGapPx, setTurnGapPx] = useState(0);
  const gapRef = useRef(0);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const immersive =
    searchParams.get(FLIPBOOK_FS_PARAM) === FLIPBOOK_FS_VALUE;
  const immersiveShellRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const leftSlotRef = useRef<HTMLDivElement>(null);
  const rightSlotRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const zoomRef = useRef(zoom);
  const zoomAnimationRef = useRef<number | null>(null);
  const turnAnimationRef = useRef<number | null>(null);

  zoomRef.current = zoom;

  const exitImmersive = useCallback(() => {
    const shell = immersiveShellRef.current;
    void exitFullscreenIfActive(shell);
    const params = new URLSearchParams(searchParams.toString());
    params.delete(FLIPBOOK_FS_PARAM);
    const q = params.toString();
    router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  const enterImmersive = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(FLIPBOOK_FS_PARAM, FLIPBOOK_FS_VALUE);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [pathname, router, searchParams]);

  const toggleImmersive = useCallback(() => {
    if (immersive) exitImmersive();
    else enterImmersive();
  }, [immersive, exitImmersive, enterImmersive]);

  useLayoutEffect(() => {
    if (!immersive) return;
    const el = immersiveShellRef.current;
    if (!el) return;
    void requestFullscreenOnElement(el);
  }, [immersive, pathname, spreadLabel]);

  useEffect(() => {
    if (!immersive) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [immersive]);

  useEffect(() => {
    if (pendingHref && spreadLabel === pendingHref) {
      setIsTurning(false);
      setTurnDir(null);
      setFromSpread(null);
      setToSpread(null);
      setTurnProgress(0);
      setPendingHref(null);
      setStageSize(null);
      setTurningCardSize(null);
      setTurnGapPx(0);
      gapRef.current = 0;
    }
  }, [pendingHref, spreadLabel]);

  useEffect(() => {
    setCachedSpread(publicationId, spreadLabel, {
      viewData,
      articleIndex,
      prevSpreadLabel,
      nextSpreadLabel,
      spreadLabel,
      currentStep,
      currentPosition,
      totalSteps,
    });
  }, [
    articleIndex,
    currentPosition,
    currentStep,
    nextSpreadLabel,
    prevSpreadLabel,
    publicationId,
    spreadLabel,
    totalSteps,
    viewData,
  ]);

  useEffect(() => {
    const labelsToPrefetch = prefetchSpreadLabels.filter(
      (label) => label !== spreadLabel
    );
    if (labelsToPrefetch.length === 0) return;

    let cancelled = false;

    const run = async () => {
      await Promise.all(
        labelsToPrefetch.map(async (label) => {
          if (cancelled || getCachedSpread(publicationId, label)) return;
          try {
            await fetchAndCacheSpread(publicationId, label);
          } catch {
            // Best-effort prefetch: ignore background failures.
          }
        })
      );
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [prefetchSpreadLabels, publicationId, spreadLabel]);

  const applyPanClamp = useCallback(() => {
    const vp = viewportRef.current;
    const content = contentRef.current;
    if (!vp || !content) return;
    const vpRect = vp.getBoundingClientRect();
    const cw = content.offsetWidth;
    const ch = content.offsetHeight;
    setPan((p) =>
      clampPan(p, vpRect.width, vpRect.height, cw, ch, zoom)
    );
  }, [zoom]);

  useEffect(() => {
    applyPanClamp();
  }, [zoom, applyPanClamp, viewData]);

  useEffect(() => {
    return () => {
      if (zoomAnimationRef.current !== null) {
        cancelAnimationFrame(zoomAnimationRef.current);
      }
    };
  }, []);

  const animateZoom = useCallback(
    (targetZoom: number, onComplete?: () => void) => {
      if (zoomAnimationRef.current !== null) {
        cancelAnimationFrame(zoomAnimationRef.current);
      }
      const startZoom = zoomRef.current;
      const startTime = performance.now();

      const tick = () => {
        const elapsed = performance.now() - startTime;
        const t = Math.min(1, elapsed / ZOOM_ANIMATION_DURATION_MS);
        const eased = easeInOutCubic(t);
        const value = startZoom + (targetZoom - startZoom) * eased;
        setZoom(value);
        if (t < 1) {
          zoomAnimationRef.current = requestAnimationFrame(tick);
        } else {
          zoomAnimationRef.current = null;
          onComplete?.();
        }
      };
      zoomAnimationRef.current = requestAnimationFrame(tick);
    },
    []
  );

  const handleDoubleClick = useCallback(() => {
    const target = zoomRef.current === 1 ? 1.5 : 1;
    animateZoom(target, () => {
      if (target <= 1) setPan({ x: 0, y: 0 });
    });
  }, [animateZoom]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (zoom <= 1) return;
      e.preventDefault();
      setIsDragging(true);
      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        panX: pan.x,
        panY: pan.y,
      };
    },
    [zoom, pan]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging) return;
      if (zoom <= 1) {
        const { left: leftPage, right: rightPage } = splitSpread(viewData);
        let inPointer = false;
        if (leftPage && leftSlotRef.current) {
          const rect = leftSlotRef.current.getBoundingClientRect();
          const { pointer } = hitTestZones(rect, e.clientX, e.clientY, "left");
          if (pointer) inPointer = true;
        }
        if (!inPointer && rightPage && rightSlotRef.current) {
          const rect = rightSlotRef.current.getBoundingClientRect();
          const { pointer } = hitTestZones(rect, e.clientX, e.clientY, "right");
          if (pointer) inPointer = true;
        }
        setPointerCursor(inPointer);
      } else {
        setPointerCursor(false);
      }
    },
    [zoom, isDragging, viewData]
  );

  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e: MouseEvent) => {
      const vp = viewportRef.current;
      const content = contentRef.current;
      if (!vp || !content) return;
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      const newPan = {
        x: dragStartRef.current.panX + dx,
        y: dragStartRef.current.panY + dy,
      };
      const vpRect = vp.getBoundingClientRect();
      const clamped = clampPan(
        newPan,
        vpRect.width,
        vpRect.height,
        content.offsetWidth,
        content.offsetHeight,
        zoomRef.current
      );
      setPan(clamped);
    };
    const onUp = () => setIsDragging(false);
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (isDragging) return;
    setPointerCursor(false);
  }, [isDragging]);

  const zoomIn = useCallback(() => {
    const target = Math.min(ZOOM_MAX, zoomRef.current + ZOOM_STEP);
    if (target <= zoomRef.current) return;
    animateZoom(target);
  }, [animateZoom]);

  const zoomOut = useCallback(() => {
    const target = Math.max(ZOOM_MIN, zoomRef.current - ZOOM_STEP);
    if (target >= zoomRef.current) return;
    animateZoom(target, () => {
      if (target <= 1) setPan({ x: 0, y: 0 });
    });
  }, [animateZoom]);

  const requestNavigate = useCallback(
    (direction: "prev" | "next") => {
      if (isTurning) return;
      if (zoomRef.current > 1) return;
      const targetLabel =
        direction === "prev" ? prevSpreadLabel : nextSpreadLabel;
      if (!targetLabel) return;

      const reducedMotion =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reducedMotion) {
        router.push(
          flipbookSpreadPath(flipbookBasePath, targetLabel, immersive)
        );
        return;
      }

      const content = contentRef.current;
      const turningSlot = direction === "next" ? rightSlotRef.current : leftSlotRef.current;
      if (content) {
        setStageSize({
          w: content.offsetWidth,
          h: content.offsetHeight,
        });
      }
      if (turningSlot) {
        const rect = turningSlot.getBoundingClientRect();
        setTurningCardSize({ w: rect.width, h: rect.height });
      } else {
        setTurningCardSize(null);
      }
      const elL = leftSlotRef.current;
      const elR = rightSlotRef.current;
      let gapPx = 0;
      if (elL && elR) {
        const rectL = elL.getBoundingClientRect();
        const rectR = elR.getBoundingClientRect();
        gapPx = rectR.left - rectL.right;
      }
      gapPx = Math.max(0, gapPx);
      gapRef.current = gapPx;
      setTurnGapPx(gapPx);
      setFromSpread([...viewData]);
      setIsTurning(true);
      setTurnDir(direction);
      setTurnProgress(0);

      const loadAndAnimate = (payload: SpreadPayload) => {
        setToSpread(payload.viewData);
        const startTime = performance.now();

        const tick = () => {
          const elapsed = performance.now() - startTime;
          const t = Math.min(1, elapsed / TURN_DURATION_MS);
          const eased = easeInOutCubic(t);
          setTurnProgress(eased);
          if (t < 1) {
            turnAnimationRef.current = requestAnimationFrame(tick);
          } else {
            turnAnimationRef.current = null;
            router.push(
              flipbookSpreadPath(flipbookBasePath, targetLabel, immersive)
            );
            setPendingHref(targetLabel);
          }
        };
        turnAnimationRef.current = requestAnimationFrame(tick);
      };

      const cached = getCachedSpread(publicationId, targetLabel);
      if (cached) {
        loadAndAnimate(cached);
        return;
      }
      fetchAndCacheSpread(publicationId, targetLabel)
        .then((payload) => {
          loadAndAnimate(payload);
        })
        .catch(() => {
          setIsTurning(false);
          setTurnDir(null);
          setFromSpread(null);
          setToSpread(null);
          setTurnProgress(0);
          setStageSize(null);
          setTurningCardSize(null);
          setTurnGapPx(0);
          gapRef.current = 0;
          router.push(
            flipbookSpreadPath(flipbookBasePath, targetLabel, immersive)
          );
        });
    },
    [
      isTurning,
      prevSpreadLabel,
      nextSpreadLabel,
      viewData,
      router,
      publicationId,
      flipbookBasePath,
      immersive,
    ]
  );

  useEffect(() => {
    return () => {
      if (turnAnimationRef.current !== null) {
        cancelAnimationFrame(turnAnimationRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (immersive) {
          e.preventDefault();
          exitImmersive();
          return;
        }
        if (zoomRef.current <= 1) return;
        animateZoom(1, () => setPan({ x: 0, y: 0 }));
        return;
      }
      if (e.key === "ArrowLeft" && prevSpreadLabel) {
        requestNavigate("prev");
        return;
      }
      if (e.key === "ArrowRight" && nextSpreadLabel) {
        requestNavigate("next");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    animateZoom,
    prevSpreadLabel,
    nextSpreadLabel,
    requestNavigate,
    immersive,
    exitImmersive,
  ]);

  const spreadLR = splitSpread(viewData);

  return (
    <div
      ref={immersiveShellRef}
      className={
        immersive
          ? "flipbook-layout fixed inset-0 z-[10000] flex h-dvh max-h-dvh min-h-0 flex-col overflow-hidden"
          : "flipbook-layout flex min-h-0 flex-1 flex-col pb-20"
      }
    >
      <div
        ref={viewportRef}
        className={
          immersive
            ? "relative flex min-h-0 flex-1 items-center justify-center overflow-hidden px-4 py-4"
            : "relative flex min-h-0 flex-1 items-center justify-center overflow-hidden px-4 py-8"
        }
        onDoubleClick={handleDoubleClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        style={{
          cursor: zoom > 1
            ? (isDragging ? "grabbing" : "grab")
            : pointerCursor
              ? "pointer"
              : "default",
          pointerEvents: isTurning ? "none" : undefined,
          userSelect: isDragging ? "none" : undefined,
        }}
      >
        <div
          className="relative inline-block"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "0 0",
            ...(isTurning && stageSize
              ? {
                  isolation: "isolate",
                  width: stageSize.w,
                  height: stageSize.h,
                  flexShrink: 0,
                }
              : {}),
          }}
        >
          {isTurning && fromSpread && toSpread && turnDir && stageSize && (
            <div
              className="absolute left-0 top-0 flex items-center justify-center"
              style={{
                width: stageSize.w,
                height: stageSize.h,
                position: "relative",
                isolation: "isolate",
              }}
            >
              <TurnScene
                fromSpread={fromSpread}
                toSpread={toSpread}
                turnDir={turnDir}
                turnProgress={turnProgress}
                articleIndex={articleIndex}
                stageSize={stageSize}
                turningCardSize={turningCardSize}
                turnGapPx={turnGapPx}
              />
            </div>
          )}
          {isTurning && fromSpread && !toSpread && stageSize && (
            <div
              className="absolute left-0 top-0 z-[60] flex items-center justify-center rounded-lg bg-stone-100/35 backdrop-blur-[1px]"
              style={{ width: stageSize.w, height: stageSize.h }}
            >
              <FlipbookLoadingSpinner />
            </div>
          )}
          <div
            ref={contentRef}
            className="flex items-stretch justify-center"
            style={{
              gap: GAP_PX,
              ...(isTurning && fromSpread && toSpread && turnDir && stageSize
                ? {
                    visibility: "hidden",
                    pointerEvents: "none",
                    width: stageSize.w,
                    height: stageSize.h,
                  }
                : undefined),
            }}
          >
            <div
              ref={leftSlotRef}
              className="relative flex shrink-0 items-stretch justify-center"
              style={SPREAD_SLOT_STYLE}
            >
              {spreadLR.left ? (
                <>
                  <PageCard data={spreadLR.left} articleIndex={articleIndex} />
                  {prevSpreadLabel && (
                    <div
                      className="absolute top-0 h-full cursor-pointer"
                      style={{
                        left: -BUFFER_PX,
                        width: `calc(${EDGE_PERCENT}% + ${BUFFER_PX}px)`,
                        pointerEvents: "auto",
                        zIndex: 10,
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        requestNavigate("prev");
                      }}
                      aria-label="Página anterior"
                    />
                  )}
                </>
              ) : (
                <div
                  className="w-full h-full"
                  style={{ visibility: "hidden", pointerEvents: "none" }}
                  aria-hidden
                />
              )}
            </div>
            <div
              ref={rightSlotRef}
              className="relative flex shrink-0 items-stretch justify-center"
              style={SPREAD_SLOT_STYLE}
            >
              {spreadLR.right ? (
                <>
                  <PageCard data={spreadLR.right} articleIndex={articleIndex} />
                  {nextSpreadLabel && (
                    <div
                      className="absolute top-0 h-full cursor-pointer"
                      style={{
                        left: `calc(100% - ${EDGE_PERCENT}%)`,
                        width: `calc(${EDGE_PERCENT}% + ${BUFFER_PX}px)`,
                        pointerEvents: "auto",
                        zIndex: 10,
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        requestNavigate("next");
                      }}
                      aria-label="Página siguiente"
                    />
                  )}
                </>
              ) : (
                <div
                  className="w-full h-full"
                  style={{ visibility: "hidden", pointerEvents: "none" }}
                  aria-hidden
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <FlipbookNav
        getSpreadHref={(label) =>
          flipbookSpreadPath(flipbookBasePath, label, immersive)
        }
        spreadLabel={spreadLabel}
        totalSteps={totalSteps}
        prevSpreadLabel={prevSpreadLabel}
        nextSpreadLabel={nextSpreadLabel}
        firstSpreadLabel={firstSpreadLabel}
        lastSpreadLabel={lastSpreadLabel}
        isTurning={isTurning}
        requestNavigate={requestNavigate}
        router={router}
        zoom={zoom}
        zoomIn={zoomIn}
        zoomOut={zoomOut}
        zoomMin={ZOOM_MIN}
        zoomMax={ZOOM_MAX}
        immersive={immersive}
        onToggleImmersive={toggleImmersive}
      />
    </div>
  );
}
