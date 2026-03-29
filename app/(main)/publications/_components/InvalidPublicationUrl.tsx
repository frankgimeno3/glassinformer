import Link from "next/link";

type Variant = "flipbook" | "informer";

export default function InvalidPublicationUrl({ variant }: { variant: Variant }) {
  const modeLabel = variant === "flipbook" ? "flipbook" : "informer";

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center bg-gray-950 px-6 py-16 text-center text-white">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-400/95">
        URL incorrecta
      </p>
      <h1 className="mt-3 text-2xl font-semibold sm:text-3xl">
        Esta dirección no es válida
      </h1>
      <p className="mt-4 max-w-md text-base text-white/70">
        No existe ninguna publicación con el identificador de esta URL en este
        portal, o el enlace está mal escrito. Las rutas de{" "}
        <span className="text-white/90">{modeLabel}</span> solo funcionan con un
        id de publicación existente.
      </p>
      <Link
        href="/publications/informer"
        className="mt-10 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-blue-950 shadow-sm transition hover:bg-white/95"
      >
        Volver al listado de publicaciones
      </Link>
    </div>
  );
}
