import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { getPublicationForPage } from "@/app/(main)/publications/_lib/getPublicationForPage";
import { loadFlipbookModelForPublicationId } from "@/app/(main)/publications/_lib/loadFlipbookModel";
import { resolveParagraphsForPage } from "../../_lib/flipbook-data";
import FlipbookView, {
  FlipbookLoadingSpinner,
  type FlipbookViewProps,
  type ArticleIndexEntry,
} from "../../_components/FlipbookView";
import type { FlipbookPage, Company } from "../../_types/flipbook";

interface PageWithCompany {
  page: FlipbookPage;
  company?: Company;
  loremParagraphs: string[];
}

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
  const step = model.parseSpreadParam(pageParam);
  if (step === null) {
    notFound();
  }
  const spreadLabel = model.getSpreadLabel(step);
  if (pageParam !== spreadLabel) {
    redirect(
      `/publications/flipbook/${encodeURIComponent(id)}/${spreadLabel}${immersiveQs}`
    );
  }

  const flipbookBasePath = `/publications/flipbook/${encodeURIComponent(id)}`;

  const pageNumbers = model.getPageNumbersForStep(step);
  const nextStep = model.getNextStep(step);
  const prevStep = model.getPrevStep(step);
  const steps = model.getViewSteps();
  const articleIndex: ArticleIndexEntry[] = model.getArticleIndex();
  const prevSpreadLabel =
    prevStep !== null ? model.getSpreadLabel(prevStep) : null;
  const nextSpreadLabel =
    nextStep !== null ? model.getSpreadLabel(nextStep) : null;
  const firstSpreadLabel =
    steps.length > 0 ? model.getSpreadLabel(steps[0]) : null;
  const lastSpreadLabel =
    steps.length > 0 ? model.getSpreadLabel(steps[steps.length - 1]) : null;

  const viewData: PageWithCompany[] = pageNumbers
    .map((num) => {
      const p = model.getPageByNumber(num);
      if (!p) return null;
      const company = p.relatedTo
        ? model.getCompanyById(p.relatedTo)
        : undefined;
      return {
        page: p,
        company,
        loremParagraphs: resolveParagraphsForPage(p),
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const currentPosition = steps.indexOf(step) + 1;
  const currentStepIndex = steps.indexOf(step);
  const prefetchSpreadLabels =
    currentStepIndex >= 0
      ? steps
          .slice(currentStepIndex, currentStepIndex + 6)
          .map((candidateStep) => model.getSpreadLabel(candidateStep))
      : [spreadLabel];

  const flipbookProps: FlipbookViewProps = {
    publicationId: id,
    flipbookBasePath,
    currentStep: step,
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
    totalSteps: steps.length,
    prefetchSpreadLabels,
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
