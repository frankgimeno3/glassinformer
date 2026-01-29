'use client';

import React, { FC } from 'react';
import Link from 'next/link';

interface CompanyItem {
  id_company: string;
  company_name: string;
  country: string;
  region: string;
  main_description: string;
}

const MOCK_COMPANIES: CompanyItem[] = [
  { id_company: '1', company_name: 'Glass Corp', country: 'Germany', region: 'Europe', main_description: 'Leading glass manufacturer' },
  { id_company: '2', company_name: 'Pane Ltd', country: 'UK', region: 'Europe', main_description: 'Architectural glass solutions' },
  { id_company: '3', company_name: 'EcoGlass', country: 'Spain', region: 'Europe', main_description: 'Sustainable glass production' },
];

interface CompaniesTableProps {
  searchTerm: string;
}

const CompaniesTable: FC<CompaniesTableProps> = ({ searchTerm }) => {
  const filtered = MOCK_COMPANIES.filter(
    (item) =>
      item.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.main_description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
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
                No companies found for &quot;{searchTerm}&quot;
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
