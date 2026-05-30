"use client";

import React, { FC, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CompanyService } from "@/apiClient/CompanyService";
import CompanyContactForm from "../../components/CompanyContactForm";
import CompanyProductsTable from "../../components/CompanyProductsTable";
import CompanyNotFoundView from "../../components/CompanyNotFoundView";
import OtherPortalCard from "../../components/OtherPortalCard";
import AuthenticationService from "@/apiClient/AuthenticationService";
import apiClient from "@/app/apiClient";
import countriesRegions from "@/app/general_components/countries_regions.json";
import WorkHereRequestModal from "../../components/WorkHereRequestModal";
import ContentPageShell from "@/app/general_components/ContentPageShell";
import ConfirmModal from "../../components/ConfirmModal";

type RegionValue =
  | "europe"
  | "africa"
  | "asia"
  | "north america"
  | "center & south america"
  | "oceania";

function normalizeCountryKey(value: string) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics
    .replace(/[’']/g, "'")
    .replace(/[^a-z0-9\s'()-]/g, "")
    .replace(/\s+/g, " ");
}

function toTitleCaseRegion(value: string) {
  const v = String(value ?? "").trim();
  if (!v) return "";
  return v
    .split(" ")
    .map((w) => (w === "&" ? "&" : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(" ");
}

const REGION_BY_COUNTRY = (() => {
  const map = new Map<string, RegionValue>();
  const list = Array.isArray(countriesRegions) ? (countriesRegions as any[]) : [];
  for (const item of list) {
    const c = normalizeCountryKey(String(item?.country ?? ""));
    const r = String(item?.region ?? "").trim().toLowerCase() as RegionValue;
    if (!c || !r) continue;
    map.set(c, r);
  }
  return map;
})();

interface UserInCompany {
  id_user: string;
  userPosition?: string;
  userRole?: string;
}

interface CompanyItem {
  id_company: string;
  company_name: string;
  country: string;
  main_description: string;
  region: string;
  company_main_image?: string;
  productsArray: string[];
  userArray: UserInCompany[];
  products?: Product[];
}

interface Product {
  id_product: string;
  product_name: string;
  product_description: string;
  tagsArray: string[];
  id_company: string;
  company_name: string;
}

interface UserProfile {
  id_user?: string;
  userCurrentCompany?: { id_company: string; userPosition: string };
}

const CompanyProfile: FC = () => {
  const params = useParams();
  const router = useRouter();
  const idCompany = params?.id_company as string;
  const [company, setCompany] = useState<CompanyItem | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLogged, setIsLogged] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [otherPortal, setOtherPortal] = useState<{ portalId: number | null; company: CompanyItem } | null>(null);
  const [workHereOpen, setWorkHereOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEmployee, setIsEmployee] = useState(false);
  const [team, setTeam] = useState<{ user_id: string; employee_role: string; user_name: string; user_surnames: string; user_main_image_src: string }[]>([]);
  const [draft, setDraft] = useState<{ company_name: string; country: string; main_description: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imageDraft, setImageDraft] = useState<string>("");

  useEffect(() => {
    if (!idCompany) {
      setLoading(false);
      return;
    }
    const fetchCompany = async () => {
      try {
        setLoading(true);
        setOtherPortal(null);
        const data = await CompanyService.getCompanyById(idCompany) as
          | CompanyItem
          | { inCurrentPortal: boolean; portalId?: number; company: CompanyItem };
        if (data && typeof data === "object" && "inCurrentPortal" in data) {
          const resp = data as { inCurrentPortal: boolean; portalId?: number; company: CompanyItem };
          if (resp.inCurrentPortal) {
            setCompany(resp.company);
            setProducts(resp.company?.products ?? []);
          } else {
            setOtherPortal({ portalId: resp.portalId ?? null, company: resp.company });
            setCompany(null);
            setProducts([]);
          }
        } else {
          setCompany(data as CompanyItem);
          setProducts((data as CompanyItem)?.products ?? []);
        }
      } catch (error: unknown) {
        const err = error as { message?: string; data?: unknown; status?: number };
        console.error("Error fetching company:", err?.message ?? err?.data ?? error);
        setCompany(null);
        setProducts([]);
        setOtherPortal(null);
      } finally {
        setLoading(false);
      }
    };
    fetchCompany();
  }, [idCompany]);

  useEffect(() => {
    let cancelled = false;
    AuthenticationService.isAuthenticated().then((auth) => {
      if (cancelled) return;
      setIsLogged(auth);
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!isLogged) {
      setUserProfile(null);
      return;
    }
    let cancelled = false;
    apiClient.get<UserProfile>("/api/v1/users/me").then((res) => {
      if (cancelled) return;
      setUserProfile(res.data);
    }).catch(() => {
      if (!cancelled) setUserProfile(null);
    });
    return () => { cancelled = true; };
  }, [isLogged]);

  useEffect(() => {
    if (!isLogged || !idCompany) {
      setIsAdmin(false);
      return;
    }
    let cancelled = false;
    apiClient.get<{ isAdmin: boolean }>(`/api/v1/companies/${encodeURIComponent(idCompany)}/admin-status`)
      .then((res) => {
        if (cancelled) return;
        setIsAdmin(Boolean(res.data?.isAdmin));
      })
      .catch(() => {
        if (!cancelled) setIsAdmin(false);
      });
    return () => { cancelled = true; };
  }, [isLogged, idCompany]);

  useEffect(() => {
    if (!isLogged || !idCompany) {
      setIsEmployee(false);
      return;
    }
    let cancelled = false;
    apiClient.get<{ isEmployee: boolean }>(`/api/v1/companies/${encodeURIComponent(idCompany)}/employee-status`)
      .then((res) => {
        if (cancelled) return;
        setIsEmployee(Boolean(res.data?.isEmployee));
      })
      .catch(() => {
        if (!cancelled) setIsEmployee(false);
      });
    return () => { cancelled = true; };
  }, [isLogged, idCompany]);

  useEffect(() => {
    if (!idCompany) return;
    let cancelled = false;
    apiClient.get(`/api/v1/companies/${encodeURIComponent(idCompany)}/team`)
      .then((res) => {
        if (cancelled) return;
        setTeam(Array.isArray(res.data) ? res.data : []);
      })
      .catch(() => {
        if (!cancelled) setTeam([]);
      });
    return () => { cancelled = true; };
  }, [idCompany]);

  const isLinkedToCompany = Boolean(
    isLogged && company && userProfile?.userCurrentCompany?.id_company === company.id_company
  );

  const canEdit = isLogged && isAdmin;
  const canRequestWorkHere = isLogged && !canEdit && !isEmployee;
  const companyImage = String(company?.company_main_image ?? "").trim();
  const hasChanges = useMemo(() => {
    if (!draft || !company) return false;
    return (
      draft.company_name !== (company.company_name ?? "") ||
      draft.country !== (company.country ?? "") ||
      draft.main_description !== (company.main_description ?? "")
    );
  }, [draft, company]);

  useEffect(() => {
    if (!company) return;
    setDraft({
      company_name: company.company_name ?? "",
      country: company.country ?? "",
      main_description: company.main_description ?? "",
    });
    setImageDraft(String(company.company_main_image ?? "").trim());
  }, [company?.id_company]);

  if (loading) {
    return (
      <ContentPageShell>
        <p className="text-center text-gray-600 text-lg">Loading company...</p>
      </ContentPageShell>
    );
  }

  if (otherPortal) {
    return (
      <ContentPageShell>
        <button
          type="button"
          onClick={() => router.push("/directory")}
          className="mb-6 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm"
        >
          ← Back to Directory
        </button>
        <OtherPortalCard
          type="company"
          item={otherPortal.company}
          portalId={otherPortal.portalId}
          onBack={() => router.push("/directory")}
        />
      </ContentPageShell>
    );
  }

  if (!company) {
    return (
      <CompanyNotFoundView idCompany={idCompany || ""} isLogged={isLogged} />
    );
  }

  const handleSave = async () => {
    if (!draft) return;
    setSaveError(null);
    setSaving(true);
    try {
      const res = await apiClient.put(`/api/v1/companies/${encodeURIComponent(company.id_company)}`, {
        company_name: draft.company_name,
        country: draft.country,
        main_description: draft.main_description,
      });
      const data = res.data;
      // optimistic refresh: re-fetch company to keep portal redirection behavior
      const fresh = await CompanyService.getCompanyById(company.id_company) as any;
      if (fresh && typeof fresh === "object" && "inCurrentPortal" in fresh) {
        const f = fresh as { inCurrentPortal: boolean; company: CompanyItem };
        if (f.inCurrentPortal) setCompany(f.company);
      } else if (data) {
        setCompany((prev) => prev ? { ...prev, ...data.company } : prev);
      }
    } catch (e: any) {
      setSaveError(e?.response?.data?.message || e?.message || "Could not save changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveImage = async () => {
    const nextUrl = String(imageDraft ?? "").trim();
    setSaveError(null);
    setSaving(true);
    try {
      await apiClient.put(`/api/v1/companies/${encodeURIComponent(company.id_company)}`, {
        company_main_image: nextUrl,
      });
      const fresh = await CompanyService.getCompanyById(company.id_company) as any;
      if (fresh && typeof fresh === "object" && "inCurrentPortal" in fresh) {
        const f = fresh as { inCurrentPortal: boolean; company: CompanyItem };
        if (f.inCurrentPortal) setCompany(f.company);
      }
      setImageModalOpen(false);
    } catch (e: any) {
      setSaveError(e?.response?.data?.message || e?.message || "Could not update image.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ContentPageShell>
        <div className="flex flex-col gap-2">
          {isLogged && (
            <Link href={"/logged/companies"}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm w-50"
            >
              ← Back to my companies
            </Link>
          )}
          <Link href={"/directory"}
            className="mb-6 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm w-50"
          >
            ← Back to Directory
          </Link>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">{company.company_name}</h1>
        </div>

        {/* Company image */}
        <div className="mb-8">
          <div className="flex items-center justify-between gap-3 mb-3">
            <h2 className="text-2xl font-bold text-gray-900">Image</h2>
            {canEdit && (
              <button
                type="button"
                onClick={() => setImageModalOpen(true)}
                className="px-4 py-2 rounded-lg bg-blue-950 hover:bg-blue-950/90 text-white uppercase tracking-wider text-sm"
              >
                Edit image
              </button>
            )}
          </div>
          {companyImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={companyImage}
              alt=""
              className="w-full max-w-3xl rounded-lg border border-gray-200 bg-white object-cover"
            />
          ) : (
            <div className="w-full max-w-3xl h-56 rounded-lg border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-gray-500">
              No image available
            </div>
          )}
        </div>

        {/* Company Information */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Company ID</h3>
              <p className="text-lg text-gray-900">{company.id_company}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Country</h3>
              {canEdit && draft ? (
                <input
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                  value={draft.country}
                  onChange={(e) => setDraft({ ...draft, country: e.target.value })}
                />
              ) : (
                <p className="text-lg text-gray-900">{company.country}</p>
              )}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Region</h3>
              <p className="text-lg text-gray-900">
                {toTitleCaseRegion(
                  REGION_BY_COUNTRY.get(normalizeCountryKey(company.country)) ?? company.region
                ) || "—"}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Products</h3>
              <p className="text-lg text-gray-900">{products.length} products</p>
            </div>
          </div>
          {canEdit && draft && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Company name</h3>
              <input
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                value={draft.company_name}
                onChange={(e) => setDraft({ ...draft, company_name: e.target.value })}
              />
            </div>
          )}
          {canEdit && (
            <div className="mt-4 flex items-center gap-3">
              <button
                type="button"
                disabled={!hasChanges || saving}
                onClick={() => void handleSave()}
                className="px-4 py-2 rounded-lg bg-blue-950 hover:bg-blue-950/90 text-white uppercase tracking-wider text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Saving…" : "Save changes"}
              </button>
              {saveError && <p className="text-sm text-red-700">{saveError}</p>}
            </div>
          )}
        </div>

        {/* Description */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Description</h2>
          {canEdit && draft ? (
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
              rows={5}
              value={draft.main_description}
              onChange={(e) => setDraft({ ...draft, main_description: e.target.value })}
            />
          ) : (
            <p className="text-gray-700 leading-relaxed">{company.main_description}</p>
          )}
        </div>

        {/* Team */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Team</h2>
            {canRequestWorkHere && (
              <button
                type="button"
                onClick={() => setWorkHereOpen(true)}
                className="px-4 py-2 rounded-lg bg-blue-950 hover:bg-blue-950/90 text-white uppercase tracking-wider text-sm"
              >
                Do you work here?
              </button>
            )}
          </div>
          {(team ?? []).length === 0 ? (
            <p className="text-gray-500">No team members for this company.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(team ?? []).map((member) => (
                <div
                  key={member.user_id}
                  className="bg-white rounded-lg shadow-md p-4 border border-gray-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-200 shrink-0">
                      {member.user_main_image_src ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={member.user_main_image_src} alt="" className="h-full w-full object-cover" />
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <p className="text-lg font-semibold text-gray-900 truncate">
                        {[member.user_name, member.user_surnames].filter(Boolean).join(" ") || member.user_id}
                      </p>
                      <p className="text-sm text-gray-600 capitalize mt-1">{member.employee_role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Products Section */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Products</h2>
            <div className="flex flex-wrap gap-2">
              {isLogged && isEmployee && !canEdit && (
                <Link
                  href={`/directory/products/create/${encodeURIComponent(company.id_company)}`}
                  className="px-4 py-2 rounded-lg border border-blue-950 text-blue-950 hover:bg-blue-950/10 uppercase tracking-wider text-sm"
                >
                  Request product creation
                </Link>
              )}
              {canEdit && (
                <Link
                  href={`/directory/products/create/${encodeURIComponent(company.id_company)}`}
                  className="px-4 py-2 rounded-lg bg-blue-950 hover:bg-blue-950/90 text-white uppercase tracking-wider text-sm"
                >
                  Add product
                </Link>
              )}
            </div>
          </div>
          {products.length === 0 ? (
            <p className="text-gray-500">No products available for this company.</p>
          ) : (
            <CompanyProductsTable products={products} />
          )}
        </div>

        {!canEdit && !isEmployee && <CompanyContactForm />}

        {canRequestWorkHere && (
          <WorkHereRequestModal
            open={workHereOpen}
            onClose={() => setWorkHereOpen(false)}
            companyName={company.company_name || "this company"}
          />
        )}

        <ConfirmModal open={imageModalOpen} onClose={() => setImageModalOpen(false)} title="Edit company image URL">
          <div className="space-y-3">
            <p className="text-sm text-gray-700">
              Current URL: <span className="font-mono break-all">{companyImage || "—"}</span>
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="company-image-url">
                New image URL
              </label>
              <input
                id="company-image-url"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-950/30 focus:border-blue-950 outline-none"
                value={imageDraft}
                onChange={(e) => setImageDraft(e.target.value)}
                placeholder="https://..."
                disabled={saving}
              />
            </div>
            {saveError && <p className="text-sm text-red-700">{saveError}</p>}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => void handleSaveImage()}
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-blue-950 hover:bg-blue-950/90 text-white uppercase tracking-wider text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Saving…" : "Save image"}
              </button>
            </div>
          </div>
        </ConfirmModal>
    </ContentPageShell>
  );
};

export default CompanyProfile;
