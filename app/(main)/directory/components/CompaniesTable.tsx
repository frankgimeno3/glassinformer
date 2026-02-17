'use client';

import React, { FC, useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
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
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    const fetchCompanies = async () => {
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
        setLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  const filteredCompanies = useMemo(() => {
    if (!filter) return companies;
    const lowerFilter = filter.toLowerCase();
    return companies.filter(
      (company) =>
        (company.company_name ?? "").toLowerCase().includes(lowerFilter) ||
        (company.country ?? "").toLowerCase().includes(lowerFilter) ||
        (company.region ?? "").toLowerCase().includes(lowerFilter) ||
        (company.main_description ?? "").toLowerCase().includes(lowerFilter)
    );
  }, [companies, filter]);

  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCompanies = filteredCompanies.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

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
        <input
          type='text'
          placeholder='Search companies by name, country, region, or description...'
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
        />
      </div>

      {/* Loading */}
      {loading && (
        <div className='mb-6 text-center text-gray-600'>Loading companies...</div>
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
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Description
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Products
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {paginatedCompanies.length === 0 ? (
              <tr>
                <td colSpan={5} className='px-6 py-4 text-center text-gray-500'>
                  No companies found
                </td>
              </tr>
            ) : (
              paginatedCompanies.map((company) => (
                <tr
                  key={company.id_company}
                  className='hover:bg-gray-50 transition-colors'
                >
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <Link
                      href={`/directory/companies/${company.id_company}`}
                      className='text-blue-600 hover:text-blue-800 font-medium cursor-pointer'
                    >
                      {company.company_name}
                    </Link>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                    {company.country}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize'>
                    {company.region}
                  </td>
                  <td className='px-6 py-4 text-sm text-gray-900 max-w-md truncate'>
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
