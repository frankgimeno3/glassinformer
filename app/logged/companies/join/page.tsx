"use client";

import React, { FC, useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { CompanyService } from "@/apiClient/CompanyService";
import JoinRequestModal, { CompanyOption } from "./joinComponents/JoinRequestModal";

interface CompanyItem {
  id_company: string;
  company_name: string;
  main_description: string;
}

const JoinCompany: FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<CompanyOption | null>(null);
  const [companies, setCompanies] = useState<CompanyItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const data = await CompanyService.getAllCompanies();
        setCompanies(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching companies:", error);
        setCompanies([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  const matches = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return companies.filter((c) =>
      c.company_name.toLowerCase().includes(q)
    );
  }, [companies, searchQuery]);

  const openModal = (company: CompanyItem) => {
    setSelectedCompany({
      id_company: company.id_company,
      company_name: company.company_name,
      main_description: company.main_description,
    });
    setModalOpen(true);
  };

  const handleConfirm = (description: string) => {
    console.log("Join request:", { company: selectedCompany, description });
    setModalOpen(false);
    setSelectedCompany(null);
  };

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-2xl font-serif font-bold text-gray-900 mb-6 uppercase tracking-wider">
        Join company
      </h1>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1 uppercase tracking-wider">
          Search by company name
        </label>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Type company name..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-950/30 focus:border-blue-950"
        />
      </div>

      {searchQuery.trim() && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          {matches.length > 0 ? (
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700 uppercase tracking-wider">
                    Company name
                  </th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700 uppercase tracking-wider w-40">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {matches.map((company) => (
                  <tr key={company.id_company} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-900 font-medium">
                      {company.company_name}
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-sm line-clamp-2">
                      {company.main_description}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => openModal(company)}
                        className="px-3 py-1.5 rounded-lg bg-blue-950 hover:bg-blue-950/90 text-white text-sm uppercase tracking-wider"
                      >
                        Send join request
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="px-4 py-8 text-center text-gray-500">
              No companies match &quot;{searchQuery}&quot;.
            </div>
          )}
        </div>
      )}

      <div className="mt-6">
        <Link
          href="/logged/companies"
          className="text-blue-950 hover:underline uppercase tracking-wider text-sm"
        >
          ← Back to My Company
        </Link>
      </div>

      <JoinRequestModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedCompany(null);
        }}
        company={selectedCompany}
        onConfirm={handleConfirm}
      />
    </div>
  );
};

export default JoinCompany;
