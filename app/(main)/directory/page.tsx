'use client';

import React, { FC, useEffect, useState } from 'react';
import Link from 'next/link';
import PageShell from '@/app/general_components/PageShell';
import CompaniesTable from './components/CompaniesTable';
import ProductsTable from './components/ProductsTable';
import Reveal from '@/app/general_components/motion/Reveal';

interface DirectoryProps {}

const Directory: FC<DirectoryProps> = () => {
  const [activeTab, setActiveTab] = useState<'companies' | 'products'>('companies');
  const [tabsRevealed, setTabsRevealed] = useState(false);

  useEffect(() => {
    setTabsRevealed(true);
  }, []);

  const getTabDelayMs = (index: number) => {
    const totalMs = 1000;
    const transitionMs = 500;
    const maxDelay = Math.max(0, totalMs - transitionMs);
    const visibleCount = 2;
    if (visibleCount <= 1) return 0;
    const step = maxDelay / (visibleCount - 1);
    return Math.round(Math.min(index, visibleCount - 1) * step);
  };

  return (
    <PageShell maxWidthClass="max-w-7xl">
        <Reveal delayMs={0}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8 border-b border-gray-200">
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => setActiveTab('companies')}
              style={
                {
                  ["--gi-reveal-delay" as any]: `${getTabDelayMs(0)}ms`,
                } as React.CSSProperties
              }
              className={`px-6 py-3 font-semibold text-lg transition-colors ${
                activeTab === 'companies'
                  ? 'text-blue-600 border-b-2 border-blue-600 -mb-px'
                  : 'text-gray-600 hover:text-gray-900'
              } gi-tab-reveal ${tabsRevealed ? "gi-tab-reveal--visible" : "gi-tab-reveal--hidden"}`}
            >
              Search Companies
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('products')}
              style={
                {
                  ["--gi-reveal-delay" as any]: `${getTabDelayMs(1)}ms`,
                } as React.CSSProperties
              }
              className={`px-6 py-3 font-semibold text-lg transition-colors ${
                activeTab === 'products'
                  ? 'text-blue-600 border-b-2 border-blue-600 -mb-px'
                  : 'text-gray-600 hover:text-gray-900'
              } gi-tab-reveal ${tabsRevealed ? "gi-tab-reveal--visible" : "gi-tab-reveal--hidden"}`}
            >
              Search Products
            </button>
          </div>
          <div className="flex-shrink-0 pb-3 sm:pb-3 self-start sm:self-auto">
            {activeTab === 'companies' ? (
              <div className="w-full sm:w-[520px] md:w-[640px] rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
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
                    href="/directory/add/company"
                    className="inline-flex shrink-0 items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Request
                  </Link>
                </div>
              </div>
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
        </Reveal>

        <Reveal delayMs={120}>
          <div className="mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">
              {activeTab === 'companies' ? 'Companies' : 'Products'} Directory
            </h1>
          </div>
        </Reveal>

        <Reveal delayMs={180}>
          {activeTab === 'companies' ? <CompaniesTable /> : <ProductsTable />}
        </Reveal>
    </PageShell>
  );
};

export default Directory;
