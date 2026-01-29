'use client';

import React, { FC, useState } from 'react';
import CompaniesTable from './components/CompaniesTable';
import ProductsTable from './components/ProductsTable';

interface DirectoryProps {

}

const Directory: FC<DirectoryProps> = ({ }) => {
  const [activeTab, setActiveTab] = useState<'companies' | 'products'>('companies');

  return (
    <div className='min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 px-4 sm:px-6 lg:px-8'>
      <div className='mx-auto max-w-7xl'>
        {/* Tabs */}
        <div className='flex space-x-4 mb-8 border-b border-gray-200'>
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

        {/* Title */}
        <h1 className='text-4xl sm:text-5xl font-bold text-gray-900 mb-8'>
          {activeTab === 'companies' ? 'Companies' : 'Products'} Directory
        </h1>

        {/* Content */}
        {activeTab === 'companies' ? <CompaniesTable /> : <ProductsTable />}
      </div>
    </div>
  );
};

export default Directory;
