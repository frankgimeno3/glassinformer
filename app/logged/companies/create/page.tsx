"use client";

import React, { FC, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const CreateCompany: FC = () => {
  const router = useRouter();
  const [companyName, setCompanyName] = useState("");
  const [country, setCountry] = useState("");
  const [mainDescription, setMainDescription] = useState("");
  const [region, setRegion] = useState("");
  const [productsInput, setProductsInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const productsArray = productsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const payload = {
      id_company: `comp-${Date.now()}`,
      company_name: companyName,
      country,
      main_description: mainDescription,
      region,
      productsArray,
      userArray: [],
    };
    console.log("Create company payload:", payload);
    router.push("/logged/companies");
  };

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-serif font-bold text-gray-900 mb-6 uppercase tracking-wider">
        Create company
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
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
            className="px-6 py-2 rounded-lg bg-blue-950 hover:bg-blue-950/90 text-white uppercase tracking-wider"
          >
            Create company
          </button>
          <Link
            href="/logged/companies"
            className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 uppercase tracking-wider"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
};

export default CreateCompany;
