"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import {
  mockInformerArticleSlides,
  mockInformerEditorialSlides,
  mockInformerPublicationMeta,
  mockInformerTopics,
  type InformerSlide,
} from "../_lib/mockInformerData";

type PublicationHeaderProps = {
  publicationId: string;
  revista: string;
  numero: string | null;
  date: string | null;
  flipbookHref: string;
};

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function phaseLabel(p: number): string {
  if (p === 1) return "Presentación";
  if (p === 2) return "Temario";
  if (p === 3) return "Editorial";
  return "Tu selección";
}

export default function InformerPhaseFlow({
  publicationId,
  revista,
  numero,
  date,
  flipbookHref,
}: PublicationHeaderProps) {
  const [phase, setPhase] = useState(1);
  const [topicEnabled, setTopicEnabled] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(mockInformerTopics.map((t) => [t.id, true]))
  );
  const [slideIndex, setSlideIndex] = useState(0);
  const expandedRef = useRef<HTMLDivElement | null>(null);
  const informerColumnRef = useRef<HTMLDivElement | null>(null);
  const [informerNavLayout, setInformerNavLayout] = useState<{
    left: number;
    width: number;
  } | null>(null);

  useLayoutEffect(() => {
    const el = informerColumnRef.current;
    if (!el) return;

    const sync = () => {
      const r = el.getBoundingClientRect();
      setInformerNavLayout({ left: r.left, width: r.width });
    };

    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    window.addEventListener("resize", sync);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", sync);
    };
  }, []);

  const articleSlides = useMemo(
    () =>
      mockInformerArticleSlides.filter(
        (s) => s.topicId && topicEnabled[s.topicId]
      ),
    [topicEnabled]
  );

  const editorialSlides = mockInformerEditorialSlides;
  const currentSlides: InformerSlide[] =
    phase === 3 ? editorialSlides : phase === 4 ? articleSlides : [];
  const slide = currentSlides[slideIndex];
  const lastSlide = currentSlides.length - 1;
  const hasSlides = currentSlides.length > 0;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [slideIndex, phase]);

  const scrollToExpanded = useCallback(() => {
    expandedRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const goPrevSlideOrPhase = useCallback(() => {
    if (phase === 3 || phase === 4) {
      if (slideIndex > 0) {
        setSlideIndex((i) => i - 1);
        return;
      }
      if (phase === 4) {
        setPhase(3);
        setSlideIndex(Math.max(0, editorialSlides.length - 1));
        return;
      }
      setPhase(2);
    }
  }, [phase, slideIndex, editorialSlides.length]);

  const goNextSlideOrPhase = useCallback(() => {
    if (phase !== 3 && phase !== 4) return;
    if (slideIndex < lastSlide) {
      setSlideIndex((i) => i + 1);
      return;
    }
    if (phase === 3) {
      setPhase(4);
      setSlideIndex(0);
    }
  }, [phase, slideIndex, lastSlide]);

  const toggleTopic = (id: string) => {
    setTopicEnabled((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const issuePart = numero ? `N.º ${numero}` : "";
  const datePart = date ?? "";
  const meta = mockInformerPublicationMeta;

  return (
    <div className="flex min-h-[100dvh] flex-col bg-zinc-950 text-zinc-100">
      <div
        ref={informerColumnRef}
        className="relative mx-auto flex w-full max-w-lg flex-1 flex-col px-4 sm:px-5"
      >
      <header className="sticky top-0 z-30 w-full border-b border-white/10 bg-zinc-950/95 py-3 backdrop-blur-md supports-[backdrop-filter]:bg-zinc-950/80">
        <div className="flex w-full items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-400/90">
              Informer · {phaseLabel(phase)}
            </p>
            <h1 className="truncate text-base font-semibold text-white sm:text-lg">
              {revista}
            </h1>
            <p className="text-xs text-zinc-400">
              {[issuePart, datePart].filter(Boolean).join(" · ")}
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1.5">
            <span className="rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] font-medium text-zinc-300">
              Fase {phase} / 4
            </span>
            <Link
              href={flipbookHref}
              className="text-[11px] font-medium text-amber-400/90 underline-offset-2 hover:underline"
            >
              Ver como publicación
            </Link>
          </div>
        </div>
        {(phase === 3 || phase === 4) && hasSlides && (
          <div className="mt-2 flex w-full items-center justify-between gap-2">
            <button
              type="button"
              onClick={goPrevSlideOrPhase}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-zinc-300 hover:bg-white/10 hover:text-white"
            >
              <ChevronLeftIcon className="size-4" />
              Atrás
            </button>
            <span className="text-[11px] tabular-nums text-zinc-500">
              {slideIndex + 1} / {currentSlides.length}
            </span>
          </div>
        )}
      </header>

      <main className="w-full flex-1 pb-32 pt-4">
        {phase === 1 && (
          <div className="space-y-6">
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/60 shadow-lg">
              <div className="aspect-[16/10] w-full bg-zinc-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={meta.coverImageUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="space-y-3 p-4 sm:p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Datos de la publicación
                </p>
                <dl className="grid grid-cols-1 gap-2 text-sm">
                  <div className="flex justify-between gap-4 border-b border-white/5 py-2">
                    <dt className="text-zinc-500">Revista</dt>
                    <dd className="text-right font-medium text-white">{revista}</dd>
                  </div>
                  <div className="flex justify-between gap-4 border-b border-white/5 py-2">
                    <dt className="text-zinc-500">Año</dt>
                    <dd className="text-right font-medium">{meta.year}</dd>
                  </div>
                  {(issuePart || datePart) && (
                    <div className="flex justify-between gap-4 border-b border-white/5 py-2">
                      <dt className="text-zinc-500">Número / fecha</dt>
                      <dd className="text-right font-medium">
                        {[issuePart, datePart].filter(Boolean).join(" · ")}
                      </dd>
                    </div>
                  )}
                  <div className="flex justify-between gap-4 border-b border-white/5 py-2">
                    <dt className="text-zinc-500">Temática</dt>
                    <dd className="text-right font-medium text-amber-100/90">
                      {meta.thematic}
                    </dd>
                  </div>
                  <div className="pt-1">
                    <dt className="text-zinc-500">ID (referencia)</dt>
                    <dd className="mt-1 break-all font-mono text-xs text-zinc-400">
                      {publicationId}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            <section className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 sm:p-5">
              <h2 className="text-sm font-semibold text-amber-100">
                Cómo está organizado este Informer
              </h2>
              <ol className="mt-3 list-decimal space-y-2 pl-4 text-sm leading-relaxed text-zinc-300">
                <li>
                  <strong className="text-white">Presentación:</strong> contexto
                  de la publicación (estás aquí).
                </li>
                <li>
                  <strong className="text-white">Temario:</strong> eliges
                  bloques temáticos; puedes desmarcar lo que no quieras leer.
                </li>
                <li>
                  <strong className="text-white">Editorial:</strong> contenido
                  obligatorio de la revista, en tarjetas breves.
                </li>
                <li>
                  <strong className="text-white">Tu selección:</strong> solo las
                  noticias de los temas que mantuviste activos.
                </li>
              </ol>
              <p className="mt-4 text-sm leading-relaxed text-zinc-300">
                La lectura funciona como un{" "}
                <strong className="text-white">“Tinder” de noticias</strong>: vas
                pasando tarjetas con flechas, ves un resumen con imagen y, si
                quieres más, despliegas el texto ampliado hacia abajo sin perder
                el hilo.
              </p>
              <p className="mt-2 text-xs text-zinc-500">{meta.tagline}</p>
            </section>

            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => setPhase(2)}
                className="flex w-full items-center justify-center rounded-xl bg-amber-500 px-4 py-3.5 text-sm font-semibold text-zinc-950 shadow-lg shadow-amber-500/20 transition hover:bg-amber-400 active:scale-[0.99]"
              >
                Continuar al temario
              </button>
              <Link
                href={flipbookHref}
                className="w-full rounded-xl border border-amber-500/35 bg-amber-500/10 py-3 text-center text-sm font-medium text-amber-200 transition hover:bg-amber-500/20"
              >
                Abrir versión flipbook
              </Link>
            </div>
          </div>
        )}

        {phase === 2 && (
          <div className="space-y-6">
            <p className="text-sm leading-relaxed text-zinc-400">
              Desmarca los temas que no te interesen. Por defecto todo está
              seleccionado; en la última fase solo verás noticias de lo que
              dejes marcado.
            </p>
            <ul className="space-y-3">
              {mockInformerTopics.map((t) => (
                <li key={t.id}>
                  <label className="flex cursor-pointer gap-3 rounded-2xl border border-white/10 bg-zinc-900/50 p-4 transition hover:border-amber-500/30 hover:bg-zinc-900">
                    <input
                      type="checkbox"
                      checked={topicEnabled[t.id] ?? false}
                      onChange={() => toggleTopic(t.id)}
                      className="mt-1 size-4 shrink-0 rounded border-white/20 bg-zinc-800 text-amber-500 focus:ring-amber-500/50"
                    />
                    <span className="min-w-0">
                      <span className="block font-medium text-white">
                        {t.label}
                      </span>
                      <span className="mt-0.5 block text-xs text-zinc-500">
                        {t.hint}
                      </span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                <button
                  type="button"
                  onClick={() => setPhase(1)}
                  className="rounded-xl border border-white/15 px-4 py-3 text-sm font-medium text-zinc-200 hover:bg-white/10"
                >
                  Volver
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSlideIndex(0);
                    setPhase(3);
                  }}
                  className="rounded-xl bg-amber-500 px-4 py-3 text-sm font-semibold text-zinc-950 hover:bg-amber-400"
                >
                  Ver editorial
                </button>
              </div>
              <Link
                href={flipbookHref}
                className="w-full rounded-xl border border-white/15 py-3 text-center text-sm font-medium text-amber-300/90 hover:bg-white/5"
              >
                Abrir versión flipbook
              </Link>
            </div>
          </div>
        )}

        {phase === 3 && hasSlides && slide && (
          <>
            <InformerSlideView
              slide={slide}
              badge="Editorial"
              expandedRef={expandedRef}
            />
            <FloatingNav
              layoutBox={informerNavLayout}
              flipbookHref={flipbookHref}
              onPrev={goPrevSlideOrPhase}
              onNext={goNextSlideOrPhase}
              onDown={scrollToExpanded}
              disablePrev={false}
              disableNext={false}
              nextLabel={
                slideIndex >= lastSlide ? "Siguiente fase" : "Siguiente"
              }
            />
          </>
        )}

        {phase === 4 && !hasSlides && (
          <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6 text-center">
            <p className="text-sm text-zinc-300">
              No quedan noticias para mostrar: has desmarcado todos los temas.
              Vuelve al temario para activar al menos uno.
            </p>
            <button
              type="button"
              onClick={() => setPhase(2)}
              className="mt-4 rounded-xl bg-amber-500 px-4 py-3 text-sm font-semibold text-zinc-950 hover:bg-amber-400"
            >
              Ir al temario
            </button>
            <Link
              href={flipbookHref}
              className="mt-3 block text-sm font-medium text-amber-300/90 underline-offset-2 hover:underline"
            >
              Ver versión flipbook (todo el contenido)
            </Link>
          </div>
        )}

        {phase === 4 && hasSlides && slide && (
          <>
            <InformerSlideView
              slide={slide}
              badge="Tu selección"
              expandedRef={expandedRef}
            />
            <FloatingNav
              layoutBox={informerNavLayout}
              flipbookHref={flipbookHref}
              onPrev={goPrevSlideOrPhase}
              onNext={() => {
                if (slideIndex < lastSlide) setSlideIndex((i) => i + 1);
              }}
              onDown={scrollToExpanded}
              disablePrev={false}
              disableNext={slideIndex >= lastSlide}
              nextLabel="Siguiente"
            />
          </>
        )}
      </main>
      </div>
    </div>
  );
}

function FloatingNav({
  layoutBox,
  flipbookHref,
  onPrev,
  onNext,
  onDown,
  disablePrev,
  disableNext,
  nextLabel,
}: {
  layoutBox: { left: number; width: number } | null;
  flipbookHref: string;
  onPrev: () => void;
  onNext: () => void;
  onDown: () => void;
  disablePrev: boolean;
  disableNext: boolean;
  nextLabel: string;
}) {
  return (
    <div
      className="pointer-events-none fixed bottom-0 z-40 flex justify-center pb-[max(1rem,env(safe-area-inset-bottom))] pt-8"
      style={{
        left: layoutBox?.left ?? 0,
        width: layoutBox?.width ?? "100%",
        background:
          "linear-gradient(to top, rgba(9,9,11,0.92) 0%, rgba(9,9,11,0.5) 45%, transparent 100%)",
      }}
    >
      <div className="pointer-events-auto flex w-full flex-col items-center gap-2">
        <div className="flex gap-3">
        <button
          type="button"
          aria-label="Anterior"
          disabled={disablePrev}
          onClick={onPrev}
          className="flex size-14 items-center justify-center rounded-full border border-white/15 bg-zinc-900/90 text-white shadow-lg backdrop-blur-sm transition hover:bg-zinc-800 disabled:pointer-events-none disabled:opacity-35"
        >
          <ChevronLeftIcon />
        </button>
        <button
          type="button"
          aria-label="Ampliar contenido"
          onClick={onDown}
          className="flex size-14 items-center justify-center rounded-full border border-amber-500/40 bg-amber-500/20 text-amber-100 shadow-lg backdrop-blur-sm transition hover:bg-amber-500/30"
        >
          <ChevronDownIcon />
        </button>
        <button
          type="button"
          aria-label={nextLabel}
          disabled={disableNext}
          onClick={onNext}
          className="flex size-14 items-center justify-center rounded-full border border-white/15 bg-zinc-900/90 text-white shadow-lg backdrop-blur-sm transition hover:bg-zinc-800 disabled:pointer-events-none disabled:opacity-35"
        >
          <ChevronRightIcon />
        </button>
        </div>
        <Link
          href={flipbookHref}
          className="rounded-full border border-amber-500/30 bg-zinc-900/80 px-4 py-2 text-[11px] font-medium text-amber-200/95 shadow-md backdrop-blur-sm hover:bg-zinc-800/90"
        >
          Flipbook
        </Link>
      </div>
    </div>
  );
}

function InformerSlideView({
  slide,
  badge,
  expandedRef,
}: {
  slide: InformerSlide;
  badge: string;
  expandedRef: RefObject<HTMLDivElement | null>;
}) {
  const { links } = slide;
  return (
    <>
      <article className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/40 shadow-xl">
        <p className="px-4 pt-4 text-[10px] font-semibold uppercase tracking-widest text-amber-400/90">
          {badge}
        </p>
        <div className="aspect-[4/3] w-full bg-zinc-800 sm:aspect-[16/10]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={slide.imageUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
        <div className="space-y-3 p-4 sm:p-5">
          <h2 className="text-lg font-semibold leading-snug text-white sm:text-xl">
            {slide.title}
          </h2>
          <p className="text-sm leading-relaxed text-zinc-300">
            {slide.summaryShort}
          </p>
          <p className="text-xs text-zinc-500">
            Usa la flecha hacia abajo para ampliar y ver enlaces.
          </p>
        </div>
      </article>

      <div
        ref={expandedRef}
        className="mt-6 scroll-mt-24 rounded-2xl border border-white/10 bg-zinc-900/70 p-4 sm:p-5"
      >
        <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Ampliado
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-zinc-200">
          {slide.summaryExpanded}
        </p>
        {(links?.productProfile ||
          links?.companyProfile ||
          links?.fullArticle) && (
          <div className="mt-5 space-y-2 border-t border-white/10 pt-4">
            <p className="text-xs font-medium text-zinc-500">
              Ir a más detalle
            </p>
            <ul className="flex flex-col gap-2">
              {links.productProfile && (
                <li>
                  <a
                    href={links.productProfile}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-amber-200 hover:bg-white/10"
                  >
                    Perfil del producto
                  </a>
                </li>
              )}
              {links.companyProfile && (
                <li>
                  <a
                    href={links.companyProfile}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-amber-200 hover:bg-white/10"
                  >
                    Perfil de la empresa
                  </a>
                </li>
              )}
              {links.fullArticle && (
                <li>
                  <a
                    href={links.fullArticle}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white hover:bg-white/10"
                  >
                    Artículo completo
                  </a>
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </>
  );
}
