'use client';

import React, { FC, useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import productsData from '@/app/contents/productsContents.json';

interface Product {
  id_product: string;
  product_name: string;
  product_description: string;
  tagsArray: string[];
  id_company: string;
  company_name: string;
}

const ProductsTable: FC = () => {
  const [products] = useState<Product[]>(productsData as Product[]);
  const [filter, setFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const filteredProducts = useMemo(() => {
    if (!filter) return products;
    const lowerFilter = filter.toLowerCase();
    return products.filter(
      (product) =>
        product.product_name.toLowerCase().includes(lowerFilter) ||
        product.product_description.toLowerCase().includes(lowerFilter) ||
        product.company_name.toLowerCase().includes(lowerFilter) ||
        product.tagsArray.some((tag) => tag.toLowerCase().includes(lowerFilter))
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

      {/* Table */}
      <div className='bg-white rounded-lg shadow overflow-hidden'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-gray-50'>
            <tr>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Product Name
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Description
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Company
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Tags
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {paginatedProducts.length === 0 ? (
              <tr>
                <td colSpan={4} className='px-6 py-4 text-center text-gray-500'>
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
                    <Link
                      href={`/directory/products/${product.id_product}`}
                      className='text-blue-600 hover:text-blue-800 font-medium cursor-pointer'
                    >
                      {product.product_name}
                    </Link>
                  </td>
                  <td className='px-6 py-4 text-sm text-gray-900 max-w-md truncate'>
                    {product.product_description}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                    {product.company_name}
                  </td>
                  <td className='px-6 py-4 text-sm text-gray-900'>
                    <div className='flex flex-wrap gap-1'>
                      {product.tagsArray.map((tag, index) => (
                        <span
                          key={index}
                          className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800'
                        >
                          {tag}
                        </span>
                      ))}
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
