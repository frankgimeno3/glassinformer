import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { getPublicationForPage } from "@/app/(main)/publications/_lib/getPublicationForPage";
import { loadFlipbookModelForPublicationId } from "@/app/(main)/publications/flipbook/flipbook_lib/loadFlipbookModel";
import FlipbookView, {
  FlipbookLoadingSpinner,
  type FlipbookViewProps,
} from "../../flipbook_components/FlipbookView";

type PageProps = {
  params: Promise<{ id: string; spread: string }>;
  searchParams?: Promise<{ fs?: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const pub = await getPublicationForPage(id);
  if (!pub) {
    return {
      title: "URL incorrecta · Flipbook",
      description: "Esta dirección de publicación no es válida.",
      robots: { index: false, follow: true },
    };
  }
  return {
    title: `${pub.revista} · Flipbook`,
    description: [pub["número"] ? `N.º ${pub["número"]}` : null, pub.date]
      .filter(Boolean)
      .join(" · "),
  };
}

export default async function FlipbookSpreadPage({
  params,
  searchParams,
}: PageProps) {
  const { id, spread: pageParam } = await params;
  const sp = searchParams ? await searchParams : {};
  const immersiveQs = sp.fs === "1" ? "?fs=1" : "";

  const loaded = await loadFlipbookModelForPublicationId(id);
  if (!loaded) notFound();

  const { model } = loaded;
  const spread = model.findSpreadByLabel(pageParam);
  if (!spread) {
    const fallback = model.spreads[0];
    if (fallback && fallback.label !== pageParam) {
      redirect(
        `/publications/flipbook/${encodeURIComponent(id)}/${encodeURIComponent(fallback.label)}${immersiveQs}`
      );
    }
    notFound();
  }

  if (pageParam !== spread.label) {
    redirect(
      `/publications/flipbook/${encodeURIComponent(id)}/${encodeURIComponent(spread.label)}${immersiveQs}`
    );
  }

  const flipbookBasePath = `/publications/flipbook/${encodeURIComponent(id)}`;
  const prevSpread = model.getPrevSpread(spread);
  const nextSpread = model.getNextSpread(spread);
  const firstSpread = model.spreads[0] ?? null;
  const lastSpread = model.spreads[model.spreads.length - 1] ?? null;
  const viewData = model.getSpreadViewData(spread);

  const flipbookProps: FlipbookViewProps = {
    publicationId: id,
    flipbookBasePath,
    spreadLabel: spread.label,
    prevSpreadLabel: prevSpread?.label ?? null,
    nextSpreadLabel: nextSpread?.label ?? null,
    firstSpreadLabel: firstSpread?.label ?? null,
    lastSpreadLabel: lastSpread?.label ?? null,
    viewData,
    currentPosition: spread.index + 1,
    totalSteps: spread.total,
    prefetchSpreadLabels: model.getPrefetchLabels(spread),
  };

  return (
    <Suspense
      fallback={
        <div className="flipbook-layout flex min-h-[40vh] items-center justify-center">
          <FlipbookLoadingSpinner />
        </div>
      }
    >
      <FlipbookView {...flipbookProps} />
    </Suspense>
  );
}
