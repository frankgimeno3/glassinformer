import PanelTicketModel from "../panel_ticket/PanelTicketModel.js";
import PanelTicketCompanyDataModel from "../panel_ticket/PanelTicketCompanyDataModel.js";
import "../../database/models.js";
import { getProfileUserByEmail } from "../userProfile/UserProfileService.js";

function newTicketId() {
    return `creq-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * @param {object} opts
 * @param {string} opts.requesterEmail - Cognito session email
 * @param {string} opts.companyName
 * @param {string} opts.country
 * @param {string} opts.mainDescription
 * @param {string} opts.companyWebsite
 * @param {boolean} opts.listAsEmployee
 * @param {string} opts.visibleRole - required when listAsEmployee
 */
export async function createDirectoryCompanyRequest(opts) {
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

    const companyName = String(opts.companyName || "").trim();
    const country = String(opts.country || "").trim();
    const mainDescription = String(opts.mainDescription || "").trim();
    const companyWebsite = String(opts.companyWebsite || "").trim();
    const listAsEmployee = Boolean(opts.listAsEmployee);
    const visibleRole = String(opts.visibleRole || "").trim();

    if (!companyName || !country || !mainDescription) {
        throw new Error("Company name, country and description are required");
    }
    if (listAsEmployee && !visibleRole) {
        throw new Error("Role is required when listing as an employee");
    }

    const ticketId = newTicketId();
    const brief = `Directory company request: ${companyName} (${country})`;

    await PanelTicketModel.create({
        panel_ticket_id: ticketId,
        panel_ticket_type: "company",
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

    const companyPayload = {
        ticket_id: ticketId,
        ticket_company_name: companyName,
        ticket_company_tax_name: "",
        ticket_company_tax_id: "",
        ticket_company_creator_role: listAsEmployee ? visibleRole : "",
        ticket_company_website: companyWebsite,
        ticket_company_country: country,
        ticket_company_description: mainDescription,
        ticket_company_list_as_employee: listAsEmployee,
    };

    try {
        await PanelTicketCompanyDataModel.create(companyPayload);
    } catch (e) {
        const msg = String(e?.original?.message || e?.parent?.message || e?.message || "");
        const pgCode = e?.original?.code || e?.parent?.code;
        // 42703 = undefined_column (locale-independent). Message checks cover EN/MySQL-style text.
        const missingListCol =
            e?.name === "SequelizeDatabaseError" &&
            msg.includes("ticket_company_list_as_employee") &&
            (pgCode === "42703" ||
                msg.includes("does not exist") ||
                msg.includes("Unknown column") ||
                /\bno existe\b/i.test(msg));
        if (!missingListCol) throw e;
        const { ticket_company_list_as_employee: _omit, ...withoutListFlag } = companyPayload;
        const fieldKeys = Object.keys(withoutListFlag);
        // Without ticket_company_list_as_employee in the DB, Postgres INSERT would succeed but
        // Sequelize still builds RETURNING for every model attribute; disable returning on retry.
        await PanelTicketCompanyDataModel.create(withoutListFlag, {
            fields: fieldKeys,
            returning: false,
        });
    }

    return { ticketId, userId };
}
