'use client';

import React, { FC, useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
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
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    const fetchProducts = async () => {
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
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    if (!filter) return products;
    const lowerFilter = filter.toLowerCase();
    return products.filter(
      (product) =>
        (product.product_name ?? "").toLowerCase().includes(lowerFilter) ||
        (product.product_description ?? "").toLowerCase().includes(lowerFilter) ||
        (product.company_name ?? "").toLowerCase().includes(lowerFilter) ||
        (product.tagsArray ?? []).some((tag) => String(tag).toLowerCase().includes(lowerFilter)) ||
        (product.price != null && String(product.price).toLowerCase().includes(lowerFilter))
    );
  }, [products, filter]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  const handlePrevious = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  return (
    <div className='w-full'>
      {/* Filter */}
      <div className='mb-6'>
        <input
          type='text'
          placeholder='Search products by name, description, company, or tags...'
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
        />
      </div>

      {/* Loading */}
      {loading && (
        <div className='mb-6 text-center text-gray-600'>Loading products...</div>
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
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Description
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Company
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Price
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Categories
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {paginatedProducts.length === 0 ? (
              <tr>
                <td colSpan={5} className='px-6 py-4 text-center text-gray-500'>
                  No products found
                </td>
              </tr>
            ) : (
              paginatedProducts.map((product) => (
                <tr
                  key={product.id_product}
                  className='hover:bg-gray-50 transition-colors'
                >
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='flex items-center gap-3'>
                      {product.main_image_src ? (
                        <img
                          src={product.main_image_src}
                          alt={product.product_name}
                          className='h-10 w-10 rounded object-cover'
                        />
                      ) : (
                        <div className='h-10 w-10 rounded bg-gray-200 flex items-center justify-center text-gray-400 text-xs'>
                          —
                        </div>
                      )}
                      <Link
                        href={`/directory/products/${product.id_product}`}
                        className='text-blue-600 hover:text-blue-800 font-medium cursor-pointer'
                      >
                        {product.product_name}
                      </Link>
                    </div>
                  </td>
                  <td className='px-6 py-4 text-sm text-gray-900 max-w-md truncate'>
                    {product.product_description}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                    {product.company_name}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                    {product.price != null ? `€${Number(product.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—'}
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
      {totalPages > 1 && (
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
