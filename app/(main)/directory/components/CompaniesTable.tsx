'use client';

import React, { FC, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CompanyService } from '@/apiClient/CompanyService';

interface Company {
  id_company: string;
  company_name: string;
  country: string;
  main_description: string;
  region: string;
  productsArray: string[];
}

const CompaniesTable: FC = () => {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rowsRevealed, setRowsRevealed] = useState(false);
  const [filters, setFilters] = useState({
    name: "",
    country: "",
    region: "",
    description: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    const fetchCompanies = async () => {
      const startedAt = Date.now();
      const MIN_LOADING_MS = 1200;
      setError(null);
      try {
        const data = await CompanyService.getAllCompanies();
        setCompanies(Array.isArray(data) ? data : []);
      } catch (err: unknown) {
        const message = err && typeof err === 'object' && 'message' in err ? String((err as { message: string }).message) : 'Error loading companies';
        console.error('Error fetching companies:', err);
        setError(message);
        setCompanies([]);
      } finally {
        const elapsed = Date.now() - startedAt;
        const remaining = Math.max(0, MIN_LOADING_MS - elapsed);
        if (remaining) await new Promise((r) => setTimeout(r, remaining));
        setLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  useEffect(() => {
    setRowsRevealed(true);
  }, []);

  const filteredCompanies = useMemo(() => {
    const name = filters.name.trim().toLowerCase();
    const country = filters.country.trim().toLowerCase();
    const region = filters.region.trim().toLowerCase();
    const description = filters.description.trim().toLowerCase();

    if (!name && !country && !region && !description) return companies;

    return companies.filter((c) => {
      if (name && !(c.company_name ?? "").toLowerCase().includes(name)) return false;
      if (country && !(c.country ?? "").toLowerCase().includes(country)) return false;
      if (region && !(c.region ?? "").toLowerCase().includes(region)) return false;
      if (description && !(c.main_description ?? "").toLowerCase().includes(description)) return false;
      return true;
    });
  }, [companies, filters]);

  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCompanies = filteredCompanies.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const getRowDelayMs = (index: number) => {
    const totalMs = 1000;
    const transitionMs = 500;
    const maxDelay = Math.max(0, totalMs - transitionMs);
    const visibleCount = Math.max(1, Math.min(paginatedCompanies.length, 8));
    if (visibleCount <= 1) return 0;
    const step = maxDelay / (visibleCount - 1);
    return Math.round(Math.min(index, visibleCount - 1) * step);
  };

  const handlePrevious = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.max(1, Math.min(totalPages || 1, prev + 1)));
  };

  return (
    <div className='w-full'>
      {/* Filter */}
      <div className='mb-6'>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <input
            type="text"
            placeholder="Company name"
            value={filters.name}
            onChange={(e) => setFilters((p) => ({ ...p, name: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="text"
            placeholder="Country"
            value={filters.country}
            onChange={(e) => setFilters((p) => ({ ...p, country: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="text"
            placeholder="Region"
            value={filters.region}
            onChange={(e) => setFilters((p) => ({ ...p, region: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="text"
            placeholder="Description"
            value={filters.description}
            onChange={(e) => setFilters((p) => ({ ...p, description: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="mb-6 flex items-center justify-center gap-3 text-gray-600">
          <span
            className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"
            aria-hidden="true"
          />
          <span className="text-sm font-medium">Loading companies...</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className='mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700'>
          {error}
        </div>
      )}

      {/* Table */}
      <div className='bg-white rounded-lg shadow overflow-hidden'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-gray-50'>
            <tr>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Company Name
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Country
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Region
              </th>
              <th className='hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Description
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Products
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={`skeleton-${i}`} className="animate-pulse">
                  <td className="px-6 py-4">
                    <div className="h-4 w-44 rounded bg-gray-200" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-20 rounded bg-gray-200" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-24 rounded bg-gray-200" />
                  </td>
                  <td className="hidden lg:table-cell px-6 py-4">
                    <div className="h-4 w-72 rounded bg-gray-200" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-10 rounded bg-gray-200" />
                  </td>
                </tr>
              ))
            ) : paginatedCompanies.length === 0 ? (
              <tr>
                <td colSpan={5} className='px-6 py-4 text-center text-gray-500'>
                  No companies found
                </td>
              </tr>
            ) : (
              paginatedCompanies.map((company, rowIdx) => (
                <tr
                  key={company.id_company}
                  style={
                    {
                      ["--gi-reveal-delay" as any]: `${getRowDelayMs(rowIdx)}ms`,
                    } as React.CSSProperties
                  }
                  className={[
                    "gi-row-reveal",
                    rowsRevealed ? "gi-row-reveal--visible" : "gi-row-reveal--hidden",
                    "hover:bg-gray-50 transition-colors cursor-pointer",
                  ].join(" ")}
                  role="link"
                  tabIndex={0}
                  onClick={() => router.push(`/directory/companies/${company.id_company}`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      router.push(`/directory/companies/${company.id_company}`);
                    }
                  }}
                >
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <span className='font-medium text-gray-900'>
                      {company.company_name}
                    </span>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                    {company.country}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize'>
                    {company.region}
                  </td>
                  <td className='hidden lg:table-cell px-6 py-4 text-sm text-gray-900 max-w-md truncate'>
                    {company.main_description}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                    {company.productsArray?.length || 0}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 0 && (
        <div className='mt-6 flex items-center justify-between'>
          <div className='text-sm text-gray-700'>
            Showing {startIndex + 1} to {Math.min(endIndex, filteredCompanies.length)} of{' '}
            {filteredCompanies.length} companies
          </div>
          <div className='flex items-center space-x-2'>
            <button
              onClick={handlePrevious}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-lg border ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
              }`}
            >
              ← Previous
            </button>
            <span className='px-4 py-2 text-sm text-gray-700'>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-lg border ${
                currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
              }`}
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompaniesTable;
