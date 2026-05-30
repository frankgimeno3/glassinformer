"use client";

import React, { FC, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Reveal from "@/app/general_components/motion/Reveal";
import { getEmployeeCompanies } from "./employeeCompaniesClient";

type EmployeeCompany = {
  employee_rel_id: string;
  id_company: string;
  employee_role: string;
  company_name: string;
  country: string;
  company_main_image: string;
};

type AdminCompany = {
  company_administrator_id: string;
  id_company: string;
  admin_role_name: string;
  rights: Record<string, boolean>;
  company_name: string;
  country: string;
  company_main_image: string;
  main_description: string;
};

type DisplayCompany = {
  id_company: string;
  company_name: string;
  country: string;
  company_main_image: string;
  main_description?: string;
  isEmployee: boolean;
  employee_role?: string;
  isAdmin: boolean;
  admin_role_name?: string;
};

const MyCompanies: FC = () => {
  const router = useRouter();
  const [employeeCompanies, setEmployeeCompanies] = useState<EmployeeCompany[]>([]);
  const [adminCompanies, setAdminCompanies] = useState<AdminCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [rowsRevealed, setRowsRevealed] = useState(false);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const data = await getEmployeeCompanies();
        setEmployeeCompanies((data.companies as EmployeeCompany[]) ?? []);
        setAdminCompanies((data.adminCompanies as AdminCompany[]) ?? []);
      } catch (error) {
        console.error("Error fetching companies:", error);
        setEmployeeCompanies([]);
        setAdminCompanies([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  const displayCompanies = useMemo(() => {
    const map = new Map<string, DisplayCompany>();
    for (const c of employeeCompanies) {
      const id = String(c?.id_company || "");
      if (!id) continue;
      const existing = map.get(id);
      const next: DisplayCompany = {
        id_company: id,
        company_name: String(c?.company_name || existing?.company_name || ""),
        country: String(c?.country || existing?.country || ""),
        company_main_image: String(c?.company_main_image || existing?.company_main_image || ""),
        main_description: existing?.main_description,
        isEmployee: true,
        employee_role: String(c?.employee_role || "employee"),
        isAdmin: Boolean(existing?.isAdmin),
        admin_role_name: existing?.admin_role_name,
      };
      map.set(id, next);
    }
    for (const c of adminCompanies) {
      const id = String(c?.id_company || "");
      if (!id) continue;
      const existing = map.get(id);
      const next: DisplayCompany = {
        id_company: id,
        company_name: String(c?.company_name || existing?.company_name || ""),
        country: String(c?.country || existing?.country || ""),
        company_main_image: String(c?.company_main_image || existing?.company_main_image || ""),
        main_description: String(c?.main_description || existing?.main_description || ""),
        isEmployee: Boolean(existing?.isEmployee),
        employee_role: existing?.employee_role,
        isAdmin: true,
        admin_role_name: String(c?.admin_role_name || ""),
      };
      map.set(id, next);
    }
    return [...map.values()].sort((a, b) =>
      (a.company_name || "").localeCompare(b.company_name || "", undefined, { sensitivity: "base" })
    );
  }, [employeeCompanies, adminCompanies]);

  const hasAnyAdminRole = useMemo(() => displayCompanies.some((c) => c.isAdmin), [displayCompanies]);

  useEffect(() => {
    setRowsRevealed(true);
  }, []);

  const getRowDelayMs = (index: number) => {
    const totalMs = 1000;
    const transitionMs = 500;
    const maxDelay = Math.max(0, totalMs - transitionMs);
    const visibleCount = Math.max(1, Math.min(displayCompanies.length, 10));
    if (visibleCount <= 1) return 0;
    const step = maxDelay / (visibleCount - 1);
    return Math.round(Math.min(index, visibleCount - 1) * step);
  };

  if (loading) {
    return (
      <div className="w-full">
        <div className="mx-auto w-full max-w-7xl px-3 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
            <p className="text-gray-600 font-serif text-lg">Loading companies...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white">
      <div className="mx-auto w-full max-w-7xl px-3 sm:px-6 lg:px-8 pb-12 sm:pb-16 pt-16 sm:pt-24">
        <header className="mb-14">
          <Reveal delayMs={0}>
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-2xl">
                <h1 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900 tracking-tight">
                  My companies
                </h1>
                <p className="mt-2 text-sm sm:text-base text-gray-600">
                  Companies where you have an active employee relation or an administrator role.
                </p>
              </div>

              <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-[520px]">
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-gray-900">
                        Request Company Profile Creation
                      </div>
                      <div className="mt-1 text-sm text-gray-600">
                        Ask our team to create a company profile for your organization in the directory.
                      </div>
                    </div>
                    <Link
                      href="/logged/companies/create"
                      className="inline-flex shrink-0 items-center justify-center px-4 py-2 bg-blue-950 text-white rounded-lg font-medium hover:bg-blue-950/90 transition-colors"
                    >
                      Request
                    </Link>
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-gray-900">
                        Working in a company in our directory?
                      </div>
                      <div className="mt-1 text-sm text-gray-600">
                        Search our companies directory for the company you work in and request to join as a member.
                      </div>
                    </div>
                    <Link
                      href="/logged/companies/join"
                      className="inline-flex shrink-0 items-center justify-center px-4 py-2 border border-blue-950 text-blue-950 rounded-lg font-medium hover:bg-blue-950/10 transition-colors"
                    >
                      Join
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </header>

        {displayCompanies.length > 0 ? (
          <div className="pb-24">
            <div className="w-full">
              <Reveal delayMs={120}>
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Company
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Country
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Employee role
                        </th>
                        {hasAnyAdminRole && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Administration roles
                          </th>
                        )}
                        <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {displayCompanies.map((company, rowIdx) => (
                        <tr
                          key={company.id_company}
                          style={
                            {
                              ["--gi-reveal-delay" as any]: `${getRowDelayMs(rowIdx)}ms`,
                            } as React.CSSProperties
                          }
                          className={[
                            "gi-row-reveal",
                            rowsRevealed ? "gi-row-reveal--visible" : "gi-row-reveal--hidden",
                            "hover:bg-gray-50 transition-colors cursor-pointer",
                          ].join(" ")}
                          role="link"
                          tabIndex={0}
                          onClick={() => router.push(`/logged/companies/${company.id_company}`)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              router.push(`/logged/companies/${company.id_company}`);
                            }
                          }}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="h-10 w-10 shrink-0 overflow-hidden rounded border border-gray-200 bg-gray-50">
                                {company.company_main_image ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={company.company_main_image}
                                    alt={company.company_name || "Company"}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-xs font-semibold uppercase tracking-wider text-gray-400">
                                    Co
                                  </div>
                                )}
                              </div>
                              <span className="min-w-0 truncate font-medium text-gray-900">
                                {company.company_name || "Company"}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {company.country || "—"}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {company.isEmployee ? (
                              <span className="inline-flex items-center rounded-full border border-blue-950/15 bg-blue-950/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-950">
                                {company.employee_role || "employee"}
                              </span>
                            ) : (
                              "—"
                            )}
                          </td>
                          {hasAnyAdminRole && (
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {company.isAdmin ? (
                                <span className="inline-flex items-center rounded-full border border-emerald-900/15 bg-emerald-900/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-900">
                                  {company.admin_role_name || "admin"}
                                </span>
                              ) : (
                                "—"
                              )}
                            </td>
                          )}
                          <td className="hidden lg:table-cell px-6 py-4 text-sm text-gray-900 max-w-md truncate">
                            {company.main_description || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Reveal>

              <Reveal delayMs={150}>
                <div className="pt-10 text-center">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    No more companies to show
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <Reveal delayMs={180}>
              <div className="w-full max-w-3xl rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
                <p className="text-gray-700 font-serif text-lg">
                  You don&apos;t have any active employee relations or admin roles yet.
                </p>
                <p className="mt-2 text-sm text-gray-600">
                  Create a company or request to join an existing one.
                </p>
              </div>
            </Reveal>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCompanies;
