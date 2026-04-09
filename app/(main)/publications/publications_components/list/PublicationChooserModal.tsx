"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import PublicationFlipbook from "./PublicationFlipbook";
import {
  formatPublicationDate,
  type Publication,
} from "./publicationListUtils";

interface PublicationChooserModalProps {
  publication: Publication | null;
  open: boolean;
  onClose: () => void;
}

export default function PublicationChooserModal({
  publication,
  open,
  onClose,
}: PublicationChooserModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open || !publication?.id) return;
    const t = window.setTimeout(() => {
      panelRef.current?.querySelector<HTMLElement>("a")?.focus();
    }, 0);
    return () => window.clearTimeout(t);
  }, [open, publication?.id]);

  if (!open || !publication?.id) return null;

  const id = encodeURIComponent(publication.id);
  const flipbookHref = `/publications/flipbook/${id}/0`;
  const informerHref = `/publications/informer/${id}`;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      role="presentation"
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        aria-hidden
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="publication-chooser-title"
        className="relative z-[101] w-full max-w-2xl rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 z-10 flex justify-end border-b border-gray-100 bg-white/95 px-3 py-2 backdrop-blur-sm">
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
            aria-label="Close"
          >
            <span className="text-2xl leading-none" aria-hidden>
              ×
            </span>
          </button>
        </div>

        <div className="px-6 pb-6 pt-2 sm:px-8">
          <div className="mx-auto max-w-[220px]">
            <PublicationFlipbook
              title={publication.title}
              imageUrl={publication.publicationMainImageUrl}
            />
          </div>

          <div className="mt-6 space-y-2 text-center">
            <h2
              id="publication-chooser-title"
              className="text-2xl font-bold text-gray-900"
            >
              {publication.title}
            </h2>
            {publication.number > 0 && (
              <p className="text-sm font-medium text-gray-500">
                Issue {publication.number}
                {publication.year > 0 ? ` · ${publication.year}` : ""}
              </p>
            )}
            <p className="text-sm text-gray-500">
              {formatPublicationDate(publication.publicationDate)}
            </p>
            {publication.description ? (
              <p className="text-left text-base leading-relaxed text-gray-600 pt-2">
                {publication.description}
              </p>
            ) : null}
          </div>

          <div className="mt-8 space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-5">
              <Link
                href={flipbookHref}
                className="flex min-h-[3.25rem] shrink-0 items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-center text-base font-semibold text-white shadow-md transition hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 sm:min-w-[11.5rem] sm:max-w-[11.5rem]"
              >
                Read as flipbook
              </Link>
              <p className="text-sm leading-relaxed text-gray-600 sm:min-w-0 sm:flex-1 sm:pt-1">
                <span className="font-semibold text-gray-800">Flipbook.</span>{" "}
                An e-magazine with page-by-page navigation, like a digital
                edition you turn through in order.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-5">
              <Link
                href={informerHref}
                className="flex min-h-[3.25rem] shrink-0 items-center justify-center rounded-xl border-2 border-slate-900 bg-white px-4 py-3 text-center text-base font-semibold text-slate-900 transition hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 sm:min-w-[11.5rem] sm:max-w-[11.5rem]"
              >
                Read as informer
              </Link>
              <p className="text-sm leading-relaxed text-gray-600 sm:min-w-0 sm:flex-1 sm:pt-1">
                <span className="font-semibold text-gray-800">Informer.</span>{" "}
                The same content organized around your interests: start with a
                concise overview, then open only the sections you want to
                explore in more depth.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
