'use client';

import React, { FC, useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ProductService } from '@/apiClient/ProductService';
import { CompanyService } from '@/apiClient/CompanyService';
import ContentPageShell from '@/app/general_components/ContentPageShell';

const CreateProductDirectory: FC = () => {
  const params = useParams();
  const idCompany = (params?.id_company as string) || '';
  const [companyName, setCompanyName] = useState<string>('');
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [price, setPrice] = useState<string>('');
  const [mainImageSrc, setMainImageSrc] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const SUCCESS_MESSAGE =
    'Your product request has been submitted successfully. Directory administrators will review and approve it. This approval step is required to prevent fraudulent submissions by bots, automated tools, or malicious users.';

  useEffect(() => {
    if (!idCompany) return;
    CompanyService.getCompanyById(idCompany)
      .then((data) => {
        const c = data && typeof data === 'object' && 'company' in data
          ? (data as { company: { company_name: string } }).company
          : data as { company_name: string };
        setCompanyName(c?.company_name ?? '');
      })
      .catch(() => setCompanyName(''));
  }, [idCompany]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmedName = productName.trim();
    const trimmedDescription = productDescription.trim();
    if (!trimmedName) {
      setError('Product name is required.');
      return;
    }
    if (!idCompany) {
      setError('Company is required.');
      return;
    }
    setSubmitting(true);
    try {
      const tagsArray = tagsInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const numPrice = price.trim() === '' ? null : Number(price);
      if (price.trim() !== '' && (Number.isNaN(numPrice) || numPrice != null && numPrice < 0)) {
        setError('Price must be a non-negative number.');
        setSubmitting(false);
        return;
      }
      const payload = {
        company_id: idCompany,
        product_name: trimmedName,
        product_description: trimmedDescription || '',
        tags_array: tagsArray,
        price: numPrice,
        main_image_src: mainImageSrc.trim() || '',
      };
      await ProductService.submitDirectoryProductRequest(payload);
      setSubmitted(true);
    } catch (err: unknown) {
      const message = err && typeof err === 'object' && 'message' in err ? String((err as { message: string }).message) : 'Error creating product';
      if (/not authenticated|authentication required|sesión|session/i.test(message)) {
        setError('You must be signed in to submit a product request. Please log in and try again.');
      } else if (/active employee/i.test(message)) {
        setError(message);
      } else {
        setError(message || 'Something went wrong while submitting your request.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!idCompany) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <p className="text-red-500">Missing company. Go back and select a company first.</p>
          <Link href="/directory" className="mt-4 inline-block px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm">
            ← Back to Directory
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ContentPageShell maxWidthClass="max-w-3xl">
      <div className="flex items-center justify-between gap-4 mb-2">
        <h1 className="text-2xl font-serif font-bold text-gray-900 uppercase tracking-wider">
          Request product listing
        </h1>
        <Link
          href="/directory/add/product"
          className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 uppercase tracking-wider text-sm"
        >
          Back
        </Link>
      </div>

      <p className="text-gray-600 text-sm mb-6">
        Company: <span className="font-semibold text-gray-900">{companyName || idCompany}</span>
      </p>

      {submitted ? (
        <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-green-900 text-sm leading-relaxed">
          {SUCCESS_MESSAGE}
        </div>
      ) : (
        <>
          <p className="text-gray-600 text-sm leading-relaxed mb-4">
            You are submitting a <span className="font-semibold">request</span>, not creating a product directly. The
            portal will review and approve it before publishing.
          </p>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 uppercase tracking-wider">
                Product name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-950/30 focus:border-blue-950"
                placeholder="e.g. Safety Glass Type A"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 uppercase tracking-wider">
                Product description
              </label>
              <textarea
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-950/30 focus:border-blue-950"
                placeholder="Brief description of the product"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 uppercase tracking-wider">
                Categories / tags (comma-separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-950/30 focus:border-blue-950"
                placeholder="e.g. safety, glass, construction"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 uppercase tracking-wider">
                Price (optional)
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-950/30 focus:border-blue-950"
                placeholder="e.g. 99.99"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 uppercase tracking-wider">
                Main image URL (optional)
              </label>
              <input
                type="url"
                value={mainImageSrc}
                onChange={(e) => setMainImageSrc(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-950/30 focus:border-blue-950"
                placeholder="https://..."
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 rounded-lg bg-blue-950 hover:bg-blue-950/90 text-white uppercase tracking-wider disabled:opacity-60"
              >
                {submitting ? 'Submitting…' : 'Submit request'}
              </button>
              <Link
                href="/directory/add/product"
                className="px-6 py-2 rounded-lg border border-blue-950 text-blue-950 hover:bg-blue-950/10 uppercase tracking-wider text-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        </>
      )}
    </ContentPageShell>
  );
};

export default CreateProductDirectory;
