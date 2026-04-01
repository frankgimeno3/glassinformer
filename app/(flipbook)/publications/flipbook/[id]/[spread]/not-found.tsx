import Link from "next/link";

export default function FlipbookSpreadNotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 bg-stone-200 p-8 text-center">
      <p className="text-stone-700">
        Esta página del flipbook no existe o la dirección no es válida.
      </p>
      <Link
        href="/publications/informer"
        className="font-medium text-amber-800 underline hover:text-amber-950"
      >
        Volver a publicaciones
      </Link>
    </div>
  );
}
