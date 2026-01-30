"use client";

import React, { FC, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import companiesContents from "@/app/contents/companiesContents.json";
import productsData from "@/app/contents/productsContents.json";
import usersData from "@/app/contents/usersData.json";

interface UserInCompany {
  id_user: string;
  userPosition: string;
  userRole: string;
}

interface CompanyItem {
  id_company: string;
  company_name: string;
  country: string;
  main_description: string;
  region: string;
  productsArray: string[];
  userArray: UserInCompany[];
}

interface Product {
  id_product: string;
  product_name: string;
  product_description: string;
  tagsArray: string[];
  id_company: string;
  company_name: string;
}

interface UserData {
  id_user: string;
  userName: string;
  userSurnames: string;
}

function getUserDisplayName(id_user: string): string {
  const users = usersData as UserData[];
  const user = users.find((u) => u.id_user === id_user);
  if (!user) return id_user;
  return `${user.userName} ${user.userSurnames}`.trim();
}

const CompanyProfile: FC = () => {
  const params = useParams();
  const router = useRouter();
  const idCompany = params?.id_company as string;
  const [company, setCompany] = useState<CompanyItem | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (idCompany) {
      const foundCompany = (companiesContents as CompanyItem[]).find(
        (c) => c.id_company === idCompany
      );

      if (foundCompany) {
        setCompany(foundCompany);
        const companyProducts = (productsData as Product[]).filter(
          (p) => p.id_company === foundCompany.id_company
        );
        setProducts(companyProducts);
      }
      setLoading(false);
    }
  }, [idCompany]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <p className="text-center text-gray-600 text-lg">Loading company...</p>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <p className="text-center text-red-500 text-lg">Company not found</p>
          <button
            onClick={() => router.push("/directory")}
            className="mt-4 px-4 py-2 bg-blue-950 text-white rounded-xl mx-auto block"
          >
            Back to Directory
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <button
          onClick={() => router.push("/directory")}
          className="mb-6 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm"
        >
          ← Back to Directory
        </button>

        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-8">
          {company.company_name}
        </h1>

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
                    {getUserDisplayName(member.id_user)}
                  </p>
                  <p className="text-sm text-gray-600 capitalize mt-1">
                    {member.userPosition}
                    <span className="text-gray-400 mx-1">·</span>
                    {member.userRole}
                  </p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <Link
                  key={product.id_product}
                  href={`/directory/products/${product.id_product}`}
                  className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {product.product_name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {product.product_description}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {product.tagsArray.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {tag}
                      </span>
                    ))}
                    {product.tagsArray.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{product.tagsArray.length - 3}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyProfile;
