import { createEndpoint } from "../../../../server/createEndpoint.js";
import { NextResponse } from "next/server";
import Joi from "joi";
import "../../../../server/database/models.js";
import { PanelTicketModel } from "../../../../server/database/models.js";

export const runtime = "nodejs";

const createSchema = Joi.object({
  name: Joi.string().trim().min(1).max(200).required(),
  email: Joi.string().trim().email().max(320).required(),
  subject: Joi.string().trim().min(1).max(500).required(),
  message: Joi.string().trim().min(1).max(20000).required(),
});

function createTicketId() {
  return `notif-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
}

export const POST = createEndpoint(async (_request, body) => {
  const full = `FROM: ${body.name} WITH EMAIL: ${body.email}\n\n${body.message}`;

  const row = await PanelTicketModel.create({
    panel_ticket_id: createTicketId(),
    panel_ticket_type: "other",
    panel_ticket_category: null,
    panel_ticket_state: "pending",
    panel_ticket_date: new Date(),
    panel_ticket_brief_description: body.subject,
    panel_ticket_full_description: full,
    panel_ticket_related_to_user_id_array: [],
    panel_ticket_updates_array: [],
  });

  return NextResponse.json({ ok: true, panel_ticket_id: row.panel_ticket_id });
}, createSchema, false);

