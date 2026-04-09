import { NextRequest } from "next/server";
import { loadFlipbookModelForPublicationId } from "@/app/(main)/publications/flipbook/flipbook_lib/loadFlipbookModel";
import { resolveParagraphsForPage } from "@/app/(main)/publications/flipbook/flipbook_lib/flipbook-data";
import type { FlipbookPage, Company } from "@/app/(main)/publications/flipbook/flipbook_types/flipbook";

interface PageWithCompany {
  page: FlipbookPage;
  company?: Company;
  loremParagraphs: string[];
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ publicationId: string; label: string }> }
) {
  const { publicationId, label } = await params;
  const loaded = await loadFlipbookModelForPublicationId(publicationId);
  if (!loaded) {
    return new Response(JSON.stringify({ error: "Publication not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }
  const { model } = loaded;
  const step = model.parseSpreadParam(label);
  if (step === null) {
    return new Response(JSON.stringify({ error: "Invalid spread label" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }
  const pageNumbers = model.getPageNumbersForStep(step);
  const nextStep = model.getNextStep(step);
  const prevStep = model.getPrevStep(step);
  const steps = model.getViewSteps();
  const articleIndex = model.getArticleIndex();
  const spreadLabel = model.getSpreadLabel(step);
  const prevSpreadLabel =
    prevStep !== null ? model.getSpreadLabel(prevStep) : null;
  const nextSpreadLabel =
    nextStep !== null ? model.getSpreadLabel(nextStep) : null;

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

  return Response.json({
    viewData,
    articleIndex,
    prevSpreadLabel,
    nextSpreadLabel,
    spreadLabel,
    currentStep: step,
    currentPosition,
    totalSteps: steps.length,
  });
}
