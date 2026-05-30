import { createEndpoint } from "../../../../server/createEndpoint.js";
import { NextResponse } from "next/server";
import Joi from "joi";
import "../../../../server/database/models.js";
import { PanelTicketModel, PanelTicketAdvertisementModel } from "../../../../server/database/models.js";

export const runtime = "nodejs";

const createSchema = Joi.object({
  name: Joi.string().trim().min(1).max(200).required(),
  email: Joi.string().trim().email().max(320).required(),
  subject: Joi.string().trim().min(1).max(500).required(),
  message: Joi.string().trim().min(1).max(20000).required(),
  ticket_type: Joi.string().trim().valid("other", "advertisement").default("other"),
  contact_phone: Joi.string().trim().max(128).allow("").optional(),
  interest: Joi.string().trim().max(512).allow("").optional(),
  company_country: Joi.string().trim().max(255).allow("").default(""),
  phone_country_prefix: Joi.string().trim().max(32).allow("").default(""),
  phone_number: Joi.string().trim().max(64).allow("").default(""),
  terms_accepted: Joi.boolean().default(false),
  services_array: Joi.array().items(Joi.string().trim().min(1).max(255)).max(500).default([]),
}).custom((value, helpers) => {
  if (value.ticket_type === "advertisement") {
    if (value.terms_accepted !== true) {
      return helpers.error("any.custom", { message: "terms_accepted must be true" });
    }
    if (!String(value.phone_number || "").trim()) {
      return helpers.error("any.custom", { message: "phone_number is required" });
    }
    if (!String(value.company_country || "").trim()) {
      return helpers.error("any.custom", { message: "company_country is required" });
    }
  }
  return value;
});

function createTicketId() {
  return `notif-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
}

export const POST = createEndpoint(async (_request, body) => {
  const contactPhone =
    body.ticket_type === "advertisement"
      ? `${String(body.phone_country_prefix || "").trim()} ${String(body.phone_number || "").trim()}`.trim()
      : String(body.contact_phone ?? "").trim();

  const sequelize = PanelTicketModel.sequelize;
  if (!sequelize) {
    throw new Error("Database not configured.");
  }

  const t = await sequelize.transaction();
  try {
    const row = await PanelTicketModel.create(
      {
        panel_ticket_id: createTicketId(),
        panel_ticket_type: body.ticket_type || "other",
        panel_ticket_state: "pending",
        panel_ticket_date: new Date(),
        panel_ticket_brief_description: body.subject,
        panel_ticket_full_description: body.message,
        panel_ticket_contact_name: body.name,
        panel_ticket_contact_email: body.email,
        panel_ticket_contact_phone: contactPhone,
        panel_ticket_interest: body.interest ?? "",
        panel_ticket_related_to_user_id_array: [],
        panel_ticket_updates_array: [],
      },
      { transaction: t }
    );

    if (body.ticket_type === "advertisement") {
      await PanelTicketAdvertisementModel.create(
        {
          ticket_id: row.panel_ticket_id,
          contact_full_name: body.name,
          contact_email: body.email,
          company_country: String(body.company_country || "").trim(),
          phone_country_prefix: String(body.phone_country_prefix || "").trim(),
          phone_number: String(body.phone_number || "").trim(),
          interest: body.interest ?? "",
          message: body.message,
          terms_accepted: true,
          services_array: Array.isArray(body.services_array) ? body.services_array : [],
        },
        { transaction: t }
      );
    }

    await t.commit();
    return NextResponse.json({ ok: true, panel_ticket_id: row.panel_ticket_id });
  } catch (err) {
    await t.rollback();
    throw err;
  }
}, createSchema, false);
