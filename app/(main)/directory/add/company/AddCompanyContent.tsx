"use client";

import { FC, useEffect, useState } from "react";
import Link from "next/link";
import AuthenticationService from "@/apiClient/AuthenticationService";

const AddCompanyContent: FC = () => {
  const [isLogged, setIsLogged] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    AuthenticationService.isAuthenticated().then((auth) => {
      if (!cancelled) setIsLogged(auth);
    });
    return () => {
      cancelled = true;
    };
  }, []);

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
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Create a company</h1>
      <div className="prose prose-gray max-w-none text-gray-600 space-y-4">
        <p>
          You need an account to create a company in the directory. Sign in if you
          already have one, or create an account to get started.
        </p>
      </div>
      {authLinks}
      {isLogged === true && (
        <p className="mt-8 text-sm text-gray-600">
          You are signed in.{" "}
          <Link
            href="/directory/companies/create"
            className="text-blue-600 hover:text-blue-800 font-semibold underline"
          >
            Continue to the create company form
          </Link>
          .
        </p>
      )}
    </article>
  );
};

export default AddCompanyContent;
