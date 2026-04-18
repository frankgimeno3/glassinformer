import {createEndpoint} from "../../../server/createEndpoint.js";
import {NextResponse} from "next/server";
import {getAllPublications, createPublication} from "../../../server/features/publication/PublicationService.js";
import Joi from "joi";

// Ensure Node.js runtime (not Edge) for database connections
export const runtime = "nodejs";

export const GET = createEndpoint(async () => {
    const publications = await getAllPublications();
    return NextResponse.json(publications);
}, null, false);

export const POST = createEndpoint(async (request, body) => {
    const publication = await createPublication(body);
    return NextResponse.json(publication);
}, Joi.object({
    // Canonical RDS columns (public.publications_db)
    publication_id: Joi.string().required(),
    magazine_id: Joi.string().allow("").optional(),
    publication_main_image_url: Joi.string().allow("").optional(),
    publication_edition_name: Joi.string().allow("").optional(),
    publication_theme: Joi.string().allow("").optional(),
    publication_status: Joi.string().allow("").optional(),
    publication_format: Joi.string().allow("").optional(),
}), true);

