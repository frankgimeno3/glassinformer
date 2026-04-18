'use client';

import React, { FC, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { CompanyService } from '@/apiClient/CompanyService';

interface CompanyItem {
  id_company: string;
  company_name: string;
  country: string;
  region: string;
  main_description: string;
}

interface CompaniesTableProps {
  searchTerm: string;
}

const CompaniesTable: FC<CompaniesTableProps> = ({ searchTerm }) => {
  const [companies, setCompanies] = useState<CompanyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      setError(null);
      setLoading(true);
      try {
        const data = await CompanyService.getAllCompanies();
        setCompanies(Array.isArray(data) ? data : []);
      } catch (err: unknown) {
        const message =
          err && typeof err === 'object' && 'message' in err
            ? String((err as { message: string }).message)
            : 'Error loading companies';
        setError(message);
        setCompanies([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return companies;
    return companies.filter((item) => {
      const name = (item.company_name ?? '').toLowerCase();
      const country = (item.country ?? '').toLowerCase();
      const region = (item.region ?? '').toLowerCase();
      const desc = (item.main_description ?? '').toLowerCase();
      return (
        name.includes(term) ||
        country.includes(term) ||
        region.includes(term) ||
        desc.includes(term)
      );
    });
  }, [companies, searchTerm]);

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {loading && (
        <div className="px-6 py-4 text-sm text-gray-600">Loading companies...</div>
      )}
      {error && (
        <div className="px-6 py-4 text-sm text-red-700 bg-red-50 border-b border-red-200">
          {error}
        </div>
      )}
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Country</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Region</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filtered.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                {loading ? '—' : `No companies found for "${searchTerm}"`}
              </td>
            </tr>
          ) : (
            filtered.map((item) => (
              <tr key={item.id_company} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link href={`/directory/companies/${item.id_company}`} className="text-blue-600 hover:text-blue-800 font-medium">
                    {item.company_name}
                  </Link>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{item.country}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{item.region}</td>
                <td className="px-6 py-4 text-sm text-gray-900 max-w-md truncate">{item.main_description}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CompaniesTable;
