'use client';

import React, { FC, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { canOptimizeRemoteImageSrc } from '@/app/lib/remoteImage';
import { ProductService } from '@/apiClient/ProductService';

interface Product {
  id_product: string;
  product_name: string;
  product_description: string;
  tagsArray: string[];
  id_company: string;
  company_name: string;
  price: number | null;
  main_image_src: string;
}

const ProductsTable: FC = () => {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rowsRevealed, setRowsRevealed] = useState(false);
  const [filters, setFilters] = useState({
    name: "",
    description: "",
    company: "",
    category: "",
    price: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    const fetchProducts = async () => {
      const startedAt = Date.now();
      const MIN_LOADING_MS = 1200;
      setError(null);
      try {
        const data = await ProductService.getAllProducts();
        setProducts(Array.isArray(data) ? data : []);
      } catch (err: unknown) {
        const message = err && typeof err === 'object' && 'message' in err ? String((err as { message: string }).message) : 'Error loading products';
        console.error('Error fetching products:', err);
        setError(message);
        setProducts([]);
      } finally {
        const elapsed = Date.now() - startedAt;
        const remaining = Math.max(0, MIN_LOADING_MS - elapsed);
        if (remaining) await new Promise((r) => setTimeout(r, remaining));
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    setRowsRevealed(true);
  }, []);

  const filteredProducts = useMemo(() => {
    const name = filters.name.trim().toLowerCase();
    const description = filters.description.trim().toLowerCase();
    const company = filters.company.trim().toLowerCase();
    const category = filters.category.trim().toLowerCase();
    const price = filters.price.trim().toLowerCase();

    if (!name && !description && !company && !category && !price) return products;

    return products.filter((p) => {
      if (name && !(p.product_name ?? "").toLowerCase().includes(name)) return false;
      if (description && !(p.product_description ?? "").toLowerCase().includes(description)) return false;
      if (company && !(p.company_name ?? "").toLowerCase().includes(company)) return false;
      if (category) {
        const tags = Array.isArray(p.tagsArray) ? p.tagsArray : [];
        if (!tags.some((t) => String(t).toLowerCase().includes(category))) return false;
      }
      if (price && !(p.price != null && String(p.price).toLowerCase().includes(price))) return false;
      return true;
    });
  }, [products, filters]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const getRowDelayMs = (index: number) => {
    const totalMs = 1000;
    const transitionMs = 500;
    const maxDelay = Math.max(0, totalMs - transitionMs);
    const visibleCount = Math.max(1, Math.min(paginatedProducts.length, 8));
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
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <input
            type="text"
            placeholder="Product name"
            value={filters.name}
            onChange={(e) => setFilters((p) => ({ ...p, name: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="text"
            placeholder="Description"
            value={filters.description}
            onChange={(e) => setFilters((p) => ({ ...p, description: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="text"
            placeholder="Company"
            value={filters.company}
            onChange={(e) => setFilters((p) => ({ ...p, company: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="text"
            placeholder="Category"
            value={filters.category}
            onChange={(e) => setFilters((p) => ({ ...p, category: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="text"
            placeholder="Price"
            value={filters.price}
            onChange={(e) => setFilters((p) => ({ ...p, price: e.target.value }))}
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
          <span className="text-sm font-medium">Loading products...</span>
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
                Product
              </th>
              <th className='hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Description
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Company
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Categories
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={`skeleton-${i}`} className="animate-pulse">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded bg-gray-200" />
                      <div className="h-4 w-44 rounded bg-gray-200" />
                    </div>
                  </td>
                  <td className="hidden lg:table-cell px-6 py-4">
                    <div className="h-4 w-72 rounded bg-gray-200" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-32 rounded bg-gray-200" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <div className="h-5 w-16 rounded-full bg-gray-200" />
                      <div className="h-5 w-12 rounded-full bg-gray-200" />
                    </div>
                  </td>
                </tr>
              ))
            ) : paginatedProducts.length === 0 ? (
              <tr>
                <td colSpan={4} className='px-6 py-4 text-center text-gray-500'>
                  No products found
                </td>
              </tr>
            ) : (
              paginatedProducts.map((product, rowIdx) => (
                <tr
                  key={product.id_product}
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
                  onClick={() => router.push(`/directory/products/${product.id_product}`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      router.push(`/directory/products/${product.id_product}`);
                    }
                  }}
                >
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='flex items-center gap-3'>
                      {product.main_image_src ? (
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded">
                          <Image
                            src={product.main_image_src}
                            alt={product.product_name}
                            fill
                            sizes="40px"
                            className="object-cover"
                            unoptimized={!canOptimizeRemoteImageSrc(product.main_image_src)}
                          />
                        </div>
                      ) : (
                        <div className='h-10 w-10 rounded bg-gray-200 flex items-center justify-center text-gray-400 text-xs'>
                          —
                        </div>
                      )}
                      <span className='font-medium text-gray-900'>
                        {product.product_name}
                      </span>
                    </div>
                  </td>
                  <td className='hidden lg:table-cell px-6 py-4 text-sm text-gray-900 max-w-md truncate'>
                    {product.product_description}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                    {product.company_name}
                  </td>
                  <td className='px-6 py-4 text-sm text-gray-900'>
                    <div className='flex flex-wrap gap-1'>
                      {(product.tagsArray ?? []).map((tag, index) => (
                        <span
                          key={index}
                          className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800'
                        >
                          {tag}
                        </span>
                      ))}
                      {(product.tagsArray ?? []).length === 0 && '—'}
                    </div>
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
            Showing {startIndex + 1} to {Math.min(endIndex, filteredProducts.length)} of{' '}
            {filteredProducts.length} products
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

export default ProductsTable;
