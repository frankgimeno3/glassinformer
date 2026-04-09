import Link from "next/link";
import { notFound } from "next/navigation";
import {
  embedSrcFromRedirectionLink,
  getPublicationForPage,
} from "../_lib/getPublicationForPage";

type Variant = "flipbook" | "informer";

export default async function PublicationViewer({
  id,
  variant,
}: {
  id: string;
  variant: Variant;
}) {
  const pub = await getPublicationForPage(id);
  if (!pub) notFound();

  const src = embedSrcFromRedirectionLink(pub.redirectionLink ?? "");
  const label = variant === "flipbook" ? "Flipbook" : "Informer";
  const issuePart = pub["número"] ? `N.º ${pub["número"]}` : "";
  const datePart = pub.date ?? "";

  return (
    <div className="flex min-h-screen flex-col bg-gray-950 text-white">
      <header className="shrink-0 border-b border-white/10 px-4 py-3 md:px-6">
        <p className="text-xs font-medium uppercase tracking-wide text-white/50">
          {label}
        </p>
        <h1 className="text-lg font-semibold md:text-xl">{pub.revista}</h1>
        <p className="text-sm text-white/70">
          {[issuePart, datePart].filter(Boolean).join(" · ")}
        </p>
        {variant === "informer" ? (
          <div className="mt-3">
            <Link
              href={`/publications/flipbook/${encodeURIComponent(id)}`}
              className="inline-flex items-center justify-center rounded-lg border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white hover:bg-white/20"
            >
              VIEW AS A PUBLICATION
            </Link>
          </div>
        ) : null}
      </header>
      <main className="relative min-h-0 flex-1 bg-black">
        {src ? (
          <iframe
            title={pub.revista}
            src={src}
            className="absolute inset-0 h-full w-full min-h-[70vh] border-0"
            allow="fullscreen; autoplay"
            referrerPolicy="no-referrer-when-downgrade"
          />
        ) : (
          <div className="flex h-[60vh] items-center justify-center px-6 text-center text-white/60">
            Esta publicación no tiene enlace de contenido configurado.
          </div>
        )}
      </main>
    </div>
  );
}
