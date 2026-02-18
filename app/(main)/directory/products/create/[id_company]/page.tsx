'use client';

import React, { FC, useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ProductService } from '@/apiClient/ProductService';
import { CompanyService } from '@/apiClient/CompanyService';

const CreateProductDirectory: FC = () => {
  const params = useParams();
  const router = useRouter();
  const idCompany = (params?.id_company as string) || '';
  const [companyName, setCompanyName] = useState<string>('');
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [price, setPrice] = useState<string>('');
  const [mainImageSrc, setMainImageSrc] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!idCompany) return;
    CompanyService.getCompanyById(idCompany)
      .then((c) => setCompanyName(c.company_name))
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
        product_name: trimmedName,
        product_description: trimmedDescription || '',
        id_company: idCompany,
        tagsArray,
        price: numPrice,
        main_image_src: mainImageSrc.trim() || '',
      };
      const product = await ProductService.createProduct(payload);
      router.push(`/directory/products/${product.id_product}`);
    } catch (err: unknown) {
      const message = err && typeof err === 'object' && 'message' in err ? String((err as { message: string }).message) : 'Error creating product';
      setError(message);
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <Link href="/directory" className="mb-6 inline-block px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm">
          ← Back to Directory
        </Link>
        <h1 className="text-2xl font-serif font-bold text-gray-900 mb-2 uppercase tracking-wider">
          Create product
        </h1>
        <p className="text-gray-600 text-sm mb-6">Company: {companyName || idCompany}</p>
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 uppercase tracking-wider">
              Product name
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
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 rounded-lg bg-blue-950 hover:bg-blue-950/90 text-white uppercase tracking-wider disabled:opacity-50"
            >
              {submitting ? 'Creating…' : 'Create product'}
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

export default CreateProductDirectory;
