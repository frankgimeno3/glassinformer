"use client";

import { FC, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import AuthenticationService from "@/apiClient/AuthenticationService";
import apiClient from "@/app/apiClient";

interface EmployeeCompany {
  employee_rel_id: string;
  id_company: string;
  employee_role: string;
  company_name: string;
  country?: string;
  company_main_image?: string;
}

const AddProductContent: FC = () => {
  const [isLogged, setIsLogged] = useState<boolean | null>(null);
  const [employeeCompanies, setEmployeeCompanies] = useState<EmployeeCompany[] | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    AuthenticationService.isAuthenticated().then((auth) => {
      if (cancelled) return;
      setIsLogged(auth);
      if (auth !== true) {
        setEmployeeCompanies(null);
        setSelectedCompanyId(null);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (isLogged !== true) return;
    let cancelled = false;
    apiClient
      .get<{ companies: EmployeeCompany[] }>("/api/v1/users/me/employee-companies")
      .then((res) => {
        if (cancelled) return;
        const list = Array.isArray(res.data?.companies) ? res.data.companies : [];
        setEmployeeCompanies(list);
      })
      .catch(() => {
        if (!cancelled) setEmployeeCompanies([]);
      });
    return () => {
      cancelled = true;
    };
  }, [isLogged]);

  const selectedCompany = useMemo(() => {
    if (!selectedCompanyId || !Array.isArray(employeeCompanies)) return null;
    return employeeCompanies.find((c) => c.id_company === selectedCompanyId) ?? null;
  }, [employeeCompanies, selectedCompanyId]);

  return (
    <article className="max-w-3xl mx-auto py-10 px-4 sm:px-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        Request product creation
      </h1>
      <div className="prose prose-gray max-w-none text-gray-600 space-y-4">
        <p>
          Plynium lets you manually create products by entering their data in
          structured forms. To prevent massive and fraudulent creation of
          malicious content, product creation requests must be approved by the
          portal before they are published.
        </p>
        <p>
          To create content for a company, you must appear as an employee of
          that company (an active relationship in <code>employee_relations</code>).
        </p>
      </div>

      {isLogged === false && (
        <>
          <div className="flex flex-wrap gap-3 mt-6">
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg font-semibold text-blue-700 bg-white border-2 border-blue-600 hover:bg-blue-50 transition-colors"
            >
              Sign up
            </Link>
          </div>
          <p className="mt-6 text-sm text-gray-600">
            Sign in to see your employee relationships and request product
            creation.
          </p>
        </>
      )}

      {isLogged === true && employeeCompanies === null && (
        <p className="mt-8 text-sm text-gray-600">Loading your companies…</p>
      )}

      {isLogged === true && Array.isArray(employeeCompanies) && employeeCompanies.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Select a company to create products for
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {employeeCompanies.map((c) => {
              const selected = c.id_company === selectedCompanyId;
              return (
                <button
                  key={c.employee_rel_id || c.id_company}
                  type="button"
                  onClick={() => setSelectedCompanyId(c.id_company)}
                  className={[
                    "text-left rounded-xl border p-4 transition-colors",
                    selected
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 bg-white hover:bg-gray-50",
                  ].join(" ")}
                >
                  <div className="flex items-start gap-3">
                    <div className="h-12 w-12 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                      {c.company_main_image ? (
                        <Image
                          src={c.company_main_image}
                          alt=""
                          width={48}
                          height={48}
                          unoptimized
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-400 text-sm font-semibold">
                          {String(c.company_name || "C").slice(0, 1).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-gray-900 truncate">
                        {c.company_name || c.id_company}
                      </div>
                      <div className="text-sm text-gray-600">
                        {c.employee_role ? `Role: ${c.employee_role}` : "Role: employee"}
                        {c.country ? ` · ${c.country}` : ""}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 break-all">
                        {c.id_company}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {selectedCompany && (
            <div className="mt-6 rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm text-gray-700">
                  Selected company:{" "}
                  <span className="font-semibold text-gray-900">
                    {selectedCompany.company_name || selectedCompany.id_company}
                  </span>
                </div>
                <Link
                  href={`/directory/products/create/${encodeURIComponent(
                    selectedCompany.id_company
                  )}`}
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  Open product creation form
                </Link>
              </div>
              <p className="mt-2 text-xs text-gray-600">
                Your request will be reviewed by the portal before the product is published.
              </p>
            </div>
          )}
        </section>
      )}

      {isLogged === true && Array.isArray(employeeCompanies) && employeeCompanies.length === 0 && (
        <section className="mt-8">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
            <div className="font-semibold">No active employee relationship found</div>
            <p className="mt-1 text-sm">
              You do not appear as an employee of any company yet, so you cannot
              request product creation for a company.
            </p>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/directory/add/company"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Request a company profile
            </Link>
            <Link
              href="/directory"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg font-semibold text-blue-700 bg-white border-2 border-blue-600 hover:bg-blue-50 transition-colors"
            >
              Browse the directory to join a company
            </Link>
          </div>
        </section>
      )}
    </article>
  );
};

export default AddProductContent;
