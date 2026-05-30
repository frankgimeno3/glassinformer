"use client";

import {
  useRef,
  useState,
  useCallback,
  useEffect,
  useLayoutEffect,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { SpreadViewData } from "../flipbook_lib/slotTypes";
import {
  fetchAndCacheSpread,
  getCachedSpread,
  setCachedSpread,
  type SpreadPayload,
} from "../flipbook_lib/spread-cache";
import FlipbookNav from "./FlipbookNav";
import { FlipbookSlotPageCard } from "./FlipbookSlotPageCard";

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

/** ProporciÃ³n 228Ã—297 mm (como hoja revista) */
const PAGE_ASPECT_RATIO = 228 / 297;

/** Gap entre pÃ¡ginas (mismo que gap-4) y estilo base de cada slot del spread */
const GAP_PX = 16;
const SPREAD_SLOT_STYLE: Record<string, string | number> = {
  aspectRatio: `${PAGE_ASPECT_RATIO}`,
  width: "min(35vw, 739px)",
  minWidth: "min(90vw, 216px)",
};

export interface FlipbookViewProps {
  publicationId: string;
  /** Ruta base sin barra final, p. ej. `/publications/flipbook/mi-id` */
  flipbookBasePath: string;
  spreadLabel: string;
  prevSpreadLabel: string | null;
  nextSpreadLabel: string | null;
  firstSpreadLabel?: string | null;
  lastSpreadLabel?: string | null;
  viewData: SpreadViewData;
  currentPosition: number;
  totalSteps: number;
  prefetchSpreadLabels: string[];
}

function spreadSlots(data: SpreadViewData) {
  return { left: data.leftSlot, right: data.rightSlot };
}

/** Zonas: tercio exterior (33%) + (top 5% | bottom 5% | borde exterior 10%). Click: borde 10% o buffer 100px. */
function hitTestZones(
  pageRect: DOMRect,
  clientX: number,
  clientY: number,
  side: "left" | "right"
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

/** Escena de giro: underlay z0, estÃ¡tico z10, hoja z50. Una sola cara opaca; swap en t=0.5 + scaleX(-1). Micro shrink al final. */
function TurnScene({
  fromSpread,
  toSpread,
  turnDir,
  turnProgress,
  stageSize,
  turningCardSize,
  turnGapPx,
}: {
  fromSpread: SpreadViewData;
  toSpread: SpreadViewData;
  turnDir: "prev" | "next";
  turnProgress: number;
  stageSize: { w: number; h: number };
  turningCardSize?: { w: number; h: number } | null;
  turnGapPx?: number;
}) {
  const fromLR = spreadSlots(fromSpread);
  const toLR = spreadSlots(toSpread);
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
      {/* Underlay: spread destino â€” z0; ocultar slot que estaba vacÃ­o en FROM hasta el final (cover/end) */}
      <div className={layoutClass} style={{ position: "absolute", inset: 0, zIndex: 0, ...layoutStyle }}>
        <div className={slotClass} style={showUnderlayLeft && toLR.left ? cardStyle : placeholderSlotStyle} aria-hidden={!(showUnderlayLeft && toLR.left)}>
          {showUnderlayLeft && toLR.left ? (
            <FlipbookSlotPageCard slot={toLR.left} isLeftPage />
          ) : (
            <div className="w-full h-full" style={{ visibility: "hidden", pointerEvents: "none" }} aria-hidden />
          )}
        </div>
        <div className={slotClass} style={showUnderlayRight && toLR.right ? cardStyle : placeholderSlotStyle} aria-hidden={!(showUnderlayRight && toLR.right)}>
          {showUnderlayRight && toLR.right ? (
            <FlipbookSlotPageCard slot={toLR.right} isLeftPage={false} />
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

      {/* Lado estÃ¡tico (from): solo el lado que NO gira; el que gira va en placeholder para no dejar copia */}
      <div
        className={layoutClass}
        style={{ position: "absolute", inset: 0, zIndex: 10, perspective: "2400px", ...layoutStyle }}
      >
        <div className={slotClass} style={turnDir === "next" && fromLR.left ? cardStyle : placeholderSlotStyle} aria-hidden={!(turnDir === "next" && fromLR.left)}>
          {turnDir === "next" && fromLR.left ? (
            <FlipbookSlotPageCard slot={fromLR.left} isLeftPage />
          ) : (
            <div className="w-full h-full" style={{ visibility: "hidden", pointerEvents: "none" }} aria-hidden />
          )}
        </div>
        <div className={slotClass} style={turnDir === "prev" && fromLR.right ? cardStyle : placeholderSlotStyle} aria-hidden={!(turnDir === "prev" && fromLR.right)}>
          {turnDir === "prev" && fromLR.right ? (
            <FlipbookSlotPageCard slot={fromLR.right} isLeftPage={false} />
          ) : (
            <div className="w-full h-full" style={{ visibility: "hidden", pointerEvents: "none" }} aria-hidden />
          )}
        </div>
      </div>

      {/* Hoja que gira â€” z50, dos slots fijos; sheet en el slot que gira */}
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
                        <FlipbookSlotPageCard slot={fromPage} isLeftPage={false} />
                      ) : toFacingPage ? (
                        <FlipbookSlotPageCard slot={toFacingPage} isLeftPage />
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
                        <FlipbookSlotPageCard slot={fromPage} isLeftPage />
                      ) : toFacingPage ? (
                        <FlipbookSlotPageCard slot={toFacingPage} isLeftPage={false} />
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
  spreadLabel,
  prevSpreadLabel,
  nextSpreadLabel,
  firstSpreadLabel,
  lastSpreadLabel,
  viewData,
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
  const [fromSpread, setFromSpread] = useState<SpreadViewData | null>(null);
  const [toSpread, setToSpread] = useState<SpreadViewData | null>(null);
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
      prevSpreadLabel,
      nextSpreadLabel,
      spreadLabel,
      currentPosition,
      totalSteps,
    });
  }, [
    currentPosition,
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
        const { left: leftPage, right: rightPage } = spreadSlots(viewData);
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
      setFromSpread({ ...viewData });
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

  const spreadLR = spreadSlots(viewData);

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
                  <FlipbookSlotPageCard slot={spreadLR.left} isLeftPage />
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
                      aria-label="PÃ¡gina anterior"
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
                  <FlipbookSlotPageCard slot={spreadLR.right} isLeftPage={false} />
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
                      aria-label="PÃ¡gina siguiente"
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
