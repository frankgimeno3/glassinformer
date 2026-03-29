'use client';

import React, { FC, useState } from 'react';
import Link from 'next/link';
import CompaniesTable from './components/CompaniesTable';
import ProductsTable from './components/ProductsTable';

interface DirectoryProps {}

const Directory: FC<DirectoryProps> = () => {
  const [activeTab, setActiveTab] = useState<'companies' | 'products'>('companies');

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8 border-b border-gray-200">
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => setActiveTab('companies')}
              className={`px-6 py-3 font-semibold text-lg transition-colors ${
                activeTab === 'companies'
                  ? 'text-blue-600 border-b-2 border-blue-600 -mb-px'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Search Companies
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('products')}
              className={`px-6 py-3 font-semibold text-lg transition-colors ${
                activeTab === 'products'
                  ? 'text-blue-600 border-b-2 border-blue-600 -mb-px'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Search Products
            </button>
          </div>
          <div className="flex-shrink-0 pb-3 sm:pb-3 self-start sm:self-auto">
            {activeTab === 'companies' ? (
              <Link
                href="/directory/add/company"
                className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Create company
              </Link>
            ) : (
              <Link
                href="/directory/add/product"
                className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Create product
              </Link>
            )}
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">
            {activeTab === 'companies' ? 'Companies' : 'Products'} Directory
          </h1>
        </div>

        {activeTab === 'companies' ? <CompaniesTable /> : <ProductsTable />}
      </div>
    </div>
  );
};

export default Directory;
