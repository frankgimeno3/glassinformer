import PanelTicketModel from "../panel_ticket/PanelTicketModel.js";
import PanelTicketProductDataModel from "../panel_ticket/PanelTicketProductDataModel.js";
import "../../database/models.js";
import { getProfileUserByEmail } from "../userProfile/UserProfileService.js";
import { QueryTypes } from "sequelize";

function newTicketId() {
  return `preq-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function assertActiveEmployeeRelation(sequelize, userId, companyId) {
  const uid = String(userId || "").trim();
  const cid = String(companyId || "").trim();
  if (!uid || !cid) throw new Error("Invalid user/company");
  const rows = await sequelize.query(
    `SELECT 1
     FROM public.employee_relations er
     WHERE er.employee_user_id = :uid::uuid
       AND er.employee_company_id = :cid
       AND er.employee_rel_status = 'active'
     LIMIT 1`,
    { replacements: { uid, cid }, type: QueryTypes.SELECT }
  );
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error("You must be an active employee of this company to request product creation.");
  }
}

/**
 * Creates a directory product request (panel_tickets + panel_ticket_product_data).
 * @param {object} opts
 * @param {string} opts.requesterEmail - Cognito session email
 * @param {string} opts.companyId
 * @param {string} opts.productName
 * @param {string} opts.productDescription
 * @param {number|null} opts.price
 * @param {string} opts.mainImageSrc
 * @param {string[]} opts.tagsArray
 */
export async function createDirectoryProductRequest(opts) {
  if (!PanelTicketModel.sequelize) {
    throw new Error("Database not configured");
  }
  const email = String(opts.requesterEmail || "").trim();
  if (!email) {
    throw new Error("Authentication required");
  }
  const profile = await getProfileUserByEmail(email);
  if (!profile?.id_user) {
    throw new Error("User profile not found");
  }
  const userId = String(profile.id_user).trim();

  const companyId = String(opts.companyId || "").trim();
  const productName = String(opts.productName || "").trim();
  const productDescription = String(opts.productDescription || "").trim();
  const mainImageSrc = String(opts.mainImageSrc || "").trim();
  const tagsArray = Array.isArray(opts.tagsArray) ? opts.tagsArray.map((t) => String(t || "").trim()).filter(Boolean) : [];

  const price = opts.price == null ? null : Number(opts.price);
  if (!companyId || !productName) {
    throw new Error("Company and product name are required");
  }
  if (price != null && (Number.isNaN(price) || price < 0)) {
    throw new Error("Price must be a non-negative number");
  }

  await assertActiveEmployeeRelation(PanelTicketModel.sequelize, userId, companyId);

  const ticketId = newTicketId();
  const brief = `Directory product request: ${productName} (company: ${companyId})`;

  await PanelTicketModel.create({
    panel_ticket_id: ticketId,
    panel_ticket_type: "product",
    panel_ticket_state: "pending",
    panel_ticket_date: new Date(),
    panel_ticket_brief_description: brief,
    panel_ticket_full_description: "",
    panel_ticket_contact_name: "",
    panel_ticket_contact_email: email,
    panel_ticket_contact_phone: "",
    panel_ticket_interest: "",
    panel_ticket_related_to_user_id_array: [userId],
    panel_ticket_updates_array: [],
  });

  await PanelTicketProductDataModel.create({
    ticket_id: ticketId,
    ticket_product_name: productName,
    ticket_product_description: productDescription,
    ticket_product_price: price ?? 0,
    ticket_product_company_id: companyId,
    ticket_product_main_image_src: mainImageSrc,
    ticket_product_categories_array: tagsArray,
    updated_at: new Date(),
  });

  return { ticketId, userId };
}

