"use client";

import React, { FC, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CompanyService } from "@/apiClient/CompanyService";
import CompanyContactForm from "../../components/CompanyContactForm";
import CompanyProductsTable from "../../components/CompanyProductsTable";
import CompanyNotFoundView from "../../components/CompanyNotFoundView";
import OtherPortalCard from "../../components/OtherPortalCard";
import AuthenticationService from "@/apiClient/AuthenticationService";
import apiClient from "@/app/apiClient";

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

  const isLinkedToCompany = Boolean(
    isLogged && company && userProfile?.userCurrentCompany?.id_company === company.id_company
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <p className="text-center text-gray-600 text-lg">Loading company...</p>
        </div>
      </div>
    );
  }

  if (otherPortal) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <button
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
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <CompanyNotFoundView idCompany={idCompany || ""} isLogged={isLogged} />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
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
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">
            {company.company_name}
          </h1>
          {isLinkedToCompany && (
            <Link
              href="/logged/companies"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              Edit data
            </Link>
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
              <p className="text-lg text-gray-900">{company.country}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Region</h3>
              <p className="text-lg text-gray-900 capitalize">{company.region}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Products</h3>
              <p className="text-lg text-gray-900">{products.length} products</p>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Description</h2>
          <p className="text-gray-700 leading-relaxed">{company.main_description}</p>
        </div>

        {/* Team */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Team</h2>
          {(company.userArray ?? []).length === 0 ? (
            <p className="text-gray-500">No team members for this company.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(company.userArray ?? []).map((member) => (
                <div
                  key={member.id_user}
                  className="bg-white rounded-lg shadow-md p-4 border border-gray-200"
                >
                  <p className="text-lg font-semibold text-gray-900">
                    {member.id_user}
                  </p>
                  {(member.userPosition != null || member.userRole != null) && (
                    <p className="text-sm text-gray-600 capitalize mt-1">
                      {[member.userPosition, member.userRole].filter(Boolean).join(" · ")}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Products Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Products</h2>
          {products.length === 0 ? (
            <p className="text-gray-500">No products available for this company.</p>
          ) : (
            <CompanyProductsTable products={products} />
          )}
        </div>

        <CompanyContactForm />
      </div>
    </div>
  );
};

export default CompanyProfile;
