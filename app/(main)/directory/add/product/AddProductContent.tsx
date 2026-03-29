"use client";

import { FC, useEffect, useState } from "react";
import Link from "next/link";
import AuthenticationService from "@/apiClient/AuthenticationService";
import apiClient from "@/app/apiClient";

interface UserCurrentCompany {
  id_company: string;
  userPosition?: string;
}

interface UserProfile {
  userCurrentCompany?: UserCurrentCompany;
}

const AddProductContent: FC = () => {
  const [isLogged, setIsLogged] = useState<boolean | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    AuthenticationService.isAuthenticated().then((auth) => {
      if (!cancelled) setIsLogged(auth);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isLogged) {
      setCompanyId(null);
      return;
    }
    let cancelled = false;
    apiClient
      .get<UserProfile>("/api/v1/users/me")
      .then((res) => {
        if (cancelled) return;
        const id = res.data?.userCurrentCompany?.id_company;
        setCompanyId(id ?? null);
      })
      .catch(() => {
        if (!cancelled) setCompanyId(null);
      });
    return () => {
      cancelled = true;
    };
  }, [isLogged]);

  const authLinks = (
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
  );

  return (
    <article className="max-w-3xl mx-auto py-10 px-4 sm:px-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Create a product</h1>
      <div className="prose prose-gray max-w-none text-gray-600 space-y-4">
        <p>
          To add a product to the directory, you need a company linked to your
          account—products are always created under a company.
        </p>
        <p>
          To add a company to the directory, you need an account. Use Log in or
          Sign up below if you have not registered yet.
        </p>
      </div>
      {authLinks}
      {isLogged === true && companyId && (
        <p className="mt-8 text-sm text-gray-600">
          You have a company linked to your profile.{" "}
          <Link
            href={`/directory/products/create/${encodeURIComponent(companyId)}`}
            className="text-blue-600 hover:text-blue-800 font-semibold underline"
          >
            Continue to create a product
          </Link>
          .
        </p>
      )}
      {isLogged === true && !companyId && (
        <p className="mt-8 text-sm text-gray-600">
          You are signed in, but no company is linked to your profile yet.{" "}
          <Link
            href="/directory/add/company"
            className="text-blue-600 hover:text-blue-800 font-semibold underline"
          >
            Create a company first
          </Link>{" "}
          (or link a company from your profile).
        </p>
      )}
    </article>
  );
};

export default AddProductContent;
