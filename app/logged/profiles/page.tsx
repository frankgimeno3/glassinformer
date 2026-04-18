"use client";

import React, { FC, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CompanyService } from "@/apiClient/CompanyService";

const DEFAULT_AVATAR_SRC =
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=256&h=256&fit=crop&q=80";

interface UserRow {
  id_user: string;
  userName: string;
  userSurnames: string;
  userDescription: string;
  userMainImageSrc: string;
  userCurrentCompany?: { id_company: string; userPosition: string };
}

const ProfilesList: FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [companyNameById, setCompanyNameById] = useState<Map<string, string>>(
    new Map()
  );
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  const qParam = searchParams.get("q") ?? "";
  const companyParam = searchParams.get("company") ?? "";
  const positionParam = searchParams.get("position") ?? "";

  const updateUrlParams = (next: {
    q?: string;
    company?: string;
    position?: string;
  }) => {
    const sp = new URLSearchParams(searchParams.toString());
    const setOrDelete = (key: string, value: string | undefined) => {
      const v = (value ?? "").trim();
      if (!v) sp.delete(key);
      else sp.set(key, v);
    };
    setOrDelete("q", next.q ?? qParam);
    setOrDelete("company", next.company ?? companyParam);
    setOrDelete("position", next.position ?? positionParam);
    const qs = sp.toString();
    router.replace(qs ? `/logged/profiles?${qs}` : "/logged/profiles", {
      scroll: false,
    });
  };

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/v1/users", { credentials: "include" });
        if (!res.ok) {
          setError("Failed to load profiles.");
          setUsers([]);
          return;
        }
        const data = await res.json();
        setUsers(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        setError("Failed to load profiles.");
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const data = await CompanyService.getAllCompanies();
        const map = new Map<string, string>();
        (Array.isArray(data) ? data : []).forEach((c: any) => {
          const id = String(c?.id_company ?? "").trim();
          const name = String(c?.company_name ?? "").trim();
          if (id) map.set(id, name || id);
        });
        setCompanyNameById(map);
      } catch {
        setCompanyNameById(new Map());
      }
    };
    fetchCompanies();
  }, []);

  const filteredUsers = useMemo(() => {
    const q = qParam.trim().toLowerCase();
    const companyQ = companyParam.trim().toLowerCase();
    const positionQ = positionParam.trim().toLowerCase();
    if (!q && !companyQ && !positionQ) return users;
    return users.filter((u) => {
      const fullName = `${u.userName ?? ""} ${u.userSurnames ?? ""}`.trim().toLowerCase();
      const desc = (u.userDescription ?? "").trim().toLowerCase();
      const position = (u.userCurrentCompany?.userPosition ?? "").trim().toLowerCase();
      const companyId = (u.userCurrentCompany?.id_company ?? "").trim();
      const companyName = (companyNameById.get(companyId) ?? companyId).toLowerCase();

      if (q) {
        const ok =
          fullName.includes(q) ||
          desc.includes(q) ||
          position.includes(q) ||
          companyName.includes(q);
        if (!ok) return false;
      }
      if (companyQ) {
        if (!companyName.includes(companyQ)) return false;
      }
      if (positionQ) {
        if (!position.includes(positionQ)) return false;
      }
      return true;
    });
  }, [users, qParam, companyParam, positionParam, companyNameById]);

  useEffect(() => {
    setCurrentPage(1);
  }, [qParam, companyParam, positionParam]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / ITEMS_PER_PAGE));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="px-6 py-10 text-gray-600 text-center">
        <p>Loading profiles…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-6 py-10 max-w-3xl mx-auto text-gray-700">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-10 py-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-7">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">Profiles</h1>
            <p className="mt-1 text-sm text-gray-600">
              Browse portal profiles. Click a row to open a profile.
            </p>
          </div>
          <Link
            href="/logged/profiles/me"
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-blue-950 text-white text-sm font-semibold hover:bg-blue-900 transition-colors"
          >
            My profile
          </Link>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="p-4 sm:p-5 border-b border-gray-200">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="sm:col-span-1">
                <label
                  htmlFor="profiles-q"
                  className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1"
                >
                  Search
                </label>
                <input
                  id="profiles-q"
                  type="text"
                  value={qParam}
                  onChange={(e) => updateUrlParams({ q: e.target.value })}
                  placeholder="Name, description, company, position…"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-950/20 focus:border-blue-950"
                />
              </div>
              <div className="sm:col-span-1">
                <label
                  htmlFor="profiles-company"
                  className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1"
                >
                  Company
                </label>
                <input
                  id="profiles-company"
                  type="text"
                  value={companyParam}
                  onChange={(e) => updateUrlParams({ company: e.target.value })}
                  placeholder="Company name…"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-950/20 focus:border-blue-950"
                />
              </div>
              <div className="sm:col-span-1">
                <label
                  htmlFor="profiles-position"
                  className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1"
                >
                  Position
                </label>
                <input
                  id="profiles-position"
                  type="text"
                  value={positionParam}
                  onChange={(e) => updateUrlParams({ position: e.target.value })}
                  placeholder="Role / title…"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-950/20 focus:border-blue-950"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="hidden lg:table-cell px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    About
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-5 py-10 text-center text-gray-500"
                    >
                      No profiles found.
                    </td>
                  </tr>
                ) : (
                  currentUsers.map((u) => {
                    const profileHref = `/logged/profiles/${encodeURIComponent(
                      u.id_user
                    )}`;
                    const fullName =
                      `${u.userName ?? ""} ${u.userSurnames ?? ""}`.trim() ||
                      "—";
                    const companyId = u.userCurrentCompany?.id_company ?? "";
                    const companyName =
                      (companyId && companyNameById.get(companyId)) || companyId || "—";
                    const position = u.userCurrentCompany?.userPosition || "—";
                    return (
                      <tr
                        key={u.id_user}
                        role="link"
                        tabIndex={0}
                        onClick={() => router.push(profileHref)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            router.push(profileHref);
                          }
                        }}
                        className="cursor-pointer hover:bg-blue-50/40 transition-colors focus:outline-none focus:bg-blue-50/60"
                      >
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={u.userMainImageSrc || DEFAULT_AVATAR_SRC}
                              alt={fullName}
                              className="h-10 w-10 rounded-full object-cover border border-gray-200"
                            />
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">
                                {fullName}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                View profile →
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-900 whitespace-nowrap">
                          {companyName}
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-900 whitespace-nowrap">
                          {position}
                        </td>
                        <td className="hidden lg:table-cell px-5 py-4 text-sm text-gray-600 max-w-[520px] truncate">
                          {u.userDescription || "—"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {filteredUsers.length > 0 ? (
            <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-4 border-t border-gray-200">
              <div className="text-sm text-gray-700">
                Page <span className="font-semibold">{safePage}</span> of{" "}
                <span className="font-semibold">{totalPages}</span>
                <span className="text-gray-500">
                  {" "}
                  · Showing {startIndex + 1}–{Math.min(endIndex, filteredUsers.length)} of{" "}
                  {filteredUsers.length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className={`px-3 py-2 rounded-lg border text-sm font-semibold transition-colors ${
                    safePage === 1
                      ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                      : "bg-white text-gray-800 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  ← Previous
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  className={`px-3 py-2 rounded-lg border text-sm font-semibold transition-colors ${
                    safePage === totalPages
                      ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                      : "bg-white text-gray-800 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  Next →
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ProfilesList;
