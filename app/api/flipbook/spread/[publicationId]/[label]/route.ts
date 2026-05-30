import { NextRequest } from "next/server";
import { loadFlipbookModelForPublicationId } from "@/app/(main)/publications/flipbook/flipbook_lib/loadFlipbookModel";

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
  const spread = model.findSpreadByLabel(label);
  if (!spread) {
    return new Response(JSON.stringify({ error: "Invalid spread label" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const prevSpread = model.getPrevSpread(spread);
  const nextSpread = model.getNextSpread(spread);
  const viewData = model.getSpreadViewData(spread);

  return Response.json({
    viewData,
    prevSpreadLabel: prevSpread?.label ?? null,
    nextSpreadLabel: nextSpread?.label ?? null,
    spreadLabel: spread.label,
    currentPosition: spread.index + 1,
    totalSteps: spread.total,
  });
}
