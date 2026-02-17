"use client";

import React, { FC, useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { DEFAULT_USER_ID } from "../constants";
import { CompanyService } from "@/apiClient/CompanyService";

interface UserInCompany {
  id_user: string;
  userPosition: string;
  userRole: string;
}

interface CompanyItem {
  id_company: string;
  company_name: string;
  main_description: string;
  userArray?: UserInCompany[];
}

const MyCompanies: FC = () => {
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

  const myCompanies = useMemo(
    () =>
      companies.filter(
        (c) =>
          Array.isArray(c.userArray) &&
          c.userArray.some((u) => u.id_user === DEFAULT_USER_ID)
      ),
    [companies]
  );

  if (loading) {
    return (
      <div className="p-12 bg-white min-h-screen">
        <p className="text-gray-600">Loading companies...</p>
      </div>
    );
  }

  return (
    <div className="p-12 bg-white min-h-screen">
      <h1 className="text-2xl font-serif font-bold text-gray-900 mb-6 uppercase tracking-wider">
        Companies in which you are an employee
      </h1>

      {myCompanies.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {myCompanies.map((company) => (
            <Link
              key={company.id_company}
              href={`/logged/companies/${company.id_company}`}
              className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow block"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {company.company_name}
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                {company.main_description}
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 text-center max-w-lg mx-auto">
          <p className="text-gray-600 mb-6">
            You still don&apos;t appear as an employee of any company.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/logged/companies/create"
              className="px-4 py-2 rounded-lg bg-blue-950 hover:bg-blue-950/90 text-white text-center uppercase tracking-wider"
            >
              Create company
            </Link>
            <Link
              href="/logged/companies/join"
              className="px-4 py-2 rounded-lg border border-blue-950 text-blue-950 hover:bg-blue-950/10 text-center uppercase tracking-wider"
            >
              Join company
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyCompanies;
