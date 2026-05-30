"use client";

import React, { FC, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ContentPageShell from "@/app/general_components/ContentPageShell";

const CreateCompany: FC = () => {
  const router = useRouter();
  const [companyName, setCompanyName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [country, setCountry] = useState("");
  const [mainDescription, setMainDescription] = useState("");
  const [region, setRegion] = useState("");
  const [productsInput, setProductsInput] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    setIsSubmitting(true);
    const productsArray = productsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const message = [
      `Company: ${companyName}`,
      `Country: ${country}`,
      `Region: ${region}`,
      `Products: ${productsArray.join(", ") || "(none)"}`,
      "",
      mainDescription,
    ].join("\n");

    try {
      const res = await fetch("/api/v1/panel-tickets/public", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: companyName,
          email: contactEmail.trim(),
          subject: `Directory — new company: ${companyName}`,
          message,
          ticket_type: "other",
          contact_phone: "",
          interest: "company_directory_create",
        }),
      });
      if (!res.ok) {
        throw new Error(`Could not open support ticket (HTTP ${res.status})`);
      }
      router.push("/logged/companies");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ContentPageShell maxWidthClass="max-w-2xl">
      <h1 className="text-2xl font-serif font-bold text-gray-900 mb-6 uppercase tracking-wider">
        Create company
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {submitError && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{submitError}</p>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 uppercase tracking-wider">
            Company name
          </label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-950/30 focus:border-blue-950"
            placeholder="e.g. GlassTech Solutions"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 uppercase tracking-wider">
            Contact email
          </label>
          <input
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-950/30 focus:border-blue-950"
            placeholder="you@company.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 uppercase tracking-wider">
            Country
          </label>
          <input
            type="text"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-950/30 focus:border-blue-950"
            placeholder="e.g. United States"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 uppercase tracking-wider">
            Main description
          </label>
          <textarea
            value={mainDescription}
            onChange={(e) => setMainDescription(e.target.value)}
            required
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-950/30 focus:border-blue-950"
            placeholder="Brief description of the company"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 uppercase tracking-wider">
            Region
          </label>
          <input
            type="text"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-950/30 focus:border-blue-950"
            placeholder="e.g. north america, europe"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 uppercase tracking-wider">
            Products (comma-separated IDs)
          </label>
          <input
            type="text"
            value={productsInput}
            onChange={(e) => setProductsInput(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-950/30 focus:border-blue-950"
            placeholder="e.g. prod-001, prod-002"
          />
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 rounded-lg bg-blue-950 hover:bg-blue-950/90 text-white uppercase tracking-wider disabled:opacity-60"
          >
            {isSubmitting ? "Submitting…" : "Create company"}
          </button>
          <Link
            href="/logged/companies"
            className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 uppercase tracking-wider"
          >
            Cancel
          </Link>
        </div>
      </form>
    </ContentPageShell>
  );
};

export default CreateCompany;
