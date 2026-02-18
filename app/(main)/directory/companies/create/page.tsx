'use client';

import React, { FC, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CompanyService } from '@/apiClient/CompanyService';

const CreateCompanyDirectory: FC = () => {
  const router = useRouter();
  const [companyName, setCompanyName] = useState('');
  const [country, setCountry] = useState('');
  const [mainDescription, setMainDescription] = useState('');
  const [region, setRegion] = useState('');
  const [productsInput, setProductsInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmedName = companyName.trim();
    const trimmedCountry = country.trim();
    const trimmedDescription = mainDescription.trim();
    const trimmedRegion = region.trim();
    if (!trimmedName || !trimmedCountry || !trimmedDescription || !trimmedRegion) {
      setError('Please fill in company name, country, main description and region.');
      return;
    }
    setSubmitting(true);
    try {
      const productsArray = productsInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const payload = {
        id_company: `comp-${Date.now()}`,
        company_name: trimmedName,
        country: trimmedCountry,
        main_description: trimmedDescription,
        region: trimmedRegion,
        productsArray,
      };
      const company = await CompanyService.createCompany(payload);
      router.push(`/directory/companies/${company.id_company}`);
    } catch (err: unknown) {
      const message = err && typeof err === 'object' && 'message' in err ? String((err as { message: string }).message) : 'Error creating company';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <Link href="/directory" className="mb-6 inline-block px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm">
          ← Back to Directory
        </Link>
        <h1 className="text-2xl font-serif font-bold text-gray-900 mb-6 uppercase tracking-wider">
          Create company
        </h1>
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 uppercase tracking-wider">
              Company name
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-950/30 focus:border-blue-950"
              placeholder="e.g. GlassTech Solutions"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 uppercase tracking-wider">
              Country
            </label>
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-950/30 focus:border-blue-950"
              placeholder="e.g. United States"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 uppercase tracking-wider">
              Main description
            </label>
            <textarea
              value={mainDescription}
              onChange={(e) => setMainDescription(e.target.value)}
              required
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-950/30 focus:border-blue-950"
              placeholder="Brief description of the company"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 uppercase tracking-wider">
              Region
            </label>
            <input
              type="text"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-950/30 focus:border-blue-950"
              placeholder="e.g. north america, europe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 uppercase tracking-wider">
              Products (comma-separated IDs)
            </label>
            <input
              type="text"
              value={productsInput}
              onChange={(e) => setProductsInput(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-950/30 focus:border-blue-950"
              placeholder="e.g. prod-001, prod-002"
            />
          </div>
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 rounded-lg bg-blue-950 hover:bg-blue-950/90 text-white uppercase tracking-wider disabled:opacity-50"
            >
              {submitting ? 'Creating…' : 'Create company'}
            </button>
            <Link
              href="/directory"
              className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 uppercase tracking-wider"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCompanyDirectory;
