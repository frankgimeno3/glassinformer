'use client';

import React, { FC, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CompaniesTable from './components/CompaniesTable';
import ProductsTable from './components/ProductsTable';
import ConfirmModal from './components/ConfirmModal';
import AuthenticationService from '@/apiClient/AuthenticationService';
import apiClient from '@/app/apiClient';
import { CompanyService } from '@/apiClient/CompanyService';

interface UserCurrentCompany {
  id_company: string;
  userPosition: string;
}

interface UserProfile {
  id_user: string;
  userCurrentCompany?: UserCurrentCompany;
}

interface DirectoryProps {}

const Directory: FC<DirectoryProps> = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'companies' | 'products'>('companies');
  const [isLogged, setIsLogged] = useState<boolean | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [modalCompanyOpen, setModalCompanyOpen] = useState(false);
  const [modalProductOpen, setModalProductOpen] = useState(false);
  const [userCompanies, setUserCompanies] = useState<{ id_company: string; company_name: string }[]>([]);

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
      setUser(null);
      return;
    }
    let cancelled = false;
    apiClient.get<UserProfile>('/api/v1/users/me').then((res) => {
      if (cancelled) return;
      setUser(res.data);
    }).catch(() => {
      if (!cancelled) setUser(null);
    });
    return () => { cancelled = true; };
  }, [isLogged]);

  useEffect(() => {
    if (!modalProductOpen || !user?.userCurrentCompany?.id_company) {
      setUserCompanies([]);
      return;
    }
    const id = user.userCurrentCompany.id_company;
    let cancelled = false;
    CompanyService.getCompanyById(id)
      .then((company) => {
        if (cancelled) return;
        setUserCompanies([{ id_company: company.id_company, company_name: company.company_name }]);
      })
      .catch(() => {
        if (!cancelled) setUserCompanies([]);
      });
    return () => { cancelled = true; };
  }, [modalProductOpen, user?.userCurrentCompany]);

  const currentCompany = user?.userCurrentCompany && !Array.isArray(user.userCurrentCompany)
    ? user.userCurrentCompany
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex space-x-4 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('companies')}
            className={`px-6 py-3 font-semibold text-lg transition-colors ${
              activeTab === 'companies'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Search Companies
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-6 py-3 font-semibold text-lg transition-colors ${
              activeTab === 'products'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Search Products
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">
            {activeTab === 'companies' ? 'Companies' : 'Products'} Directory
          </h1>
          {isLogged && (
            <>
              {activeTab === 'companies' && (
                <button
                  type="button"
                  onClick={() => setModalCompanyOpen(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                >
                  Add companies
                </button>
              )}
              {activeTab === 'products' && (
                <button
                  type="button"
                  onClick={() => setModalProductOpen(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                >
                  Add Products
                </button>
              )}
            </>
          )}
        </div>

        {activeTab === 'companies' ? <CompaniesTable /> : <ProductsTable />}
      </div>

      <ConfirmModal open={modalCompanyOpen} onClose={() => setModalCompanyOpen(false)}>
        <div className="space-y-4">
          <p className="text-gray-700">Are you sure you want to add a new company?</p>
          {currentCompany?.id_company && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800 font-medium">You already work at a company linked to your profile.</p>
              <p className="text-sm text-amber-700 mt-1">
                Company ID: <span className="font-mono">{currentCompany.id_company}</span>
                {currentCompany.userPosition && ` · Position: ${currentCompany.userPosition}`}
              </p>
              <a
                href={`/directory/companies/${currentCompany.id_company}`}
                className="inline-block mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Go to that company profile →
              </a>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setModalCompanyOpen(false);
                router.push('/directory/companies/create');
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Yes I am sure
            </button>
          </div>
        </div>
      </ConfirmModal>

      <ConfirmModal open={modalProductOpen} onClose={() => setModalProductOpen(false)}>
        <div className="space-y-4">
          <p className="text-gray-700">Select the company for the new product:</p>
          {userCompanies.length === 0 ? (
            <p className="text-gray-500 text-sm">
              {user?.userCurrentCompany?.id_company
                ? 'Loading your company…'
                : 'You don’t have a company linked to your profile. Link one in your profile first.'}
            </p>
          ) : (
            <div className="grid gap-3">
              {userCompanies.map((c) => (
                <button
                  key={c.id_company}
                  type="button"
                  onClick={() => {
                    setModalProductOpen(false);
                    router.push(`/directory/products/create/${encodeURIComponent(c.id_company)}`);
                  }}
                  className="text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-colors"
                >
                  <span className="font-semibold text-gray-900">{c.company_name}</span>
                  <span className="text-gray-500 text-sm ml-2">({c.id_company})</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </ConfirmModal>
    </div>
  );
};

export default Directory;
