'use client';

import React, { FC, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ProductService } from '@/apiClient/ProductService';

interface ProductItem {
  id_product: string;
  product_name: string;
  product_description: string;
  company_name: string;
  tagsArray: string[];
}

interface ProductsTableProps {
  searchTerm: string;
}

const ProductsTable: FC<ProductsTableProps> = ({ searchTerm }) => {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setError(null);
      setLoading(true);
      try {
        const data = await ProductService.getAllProducts();
        setProducts(Array.isArray(data) ? data : []);
      } catch (err: unknown) {
        const message =
          err && typeof err === 'object' && 'message' in err
            ? String((err as { message: string }).message)
            : 'Error loading products';
        setError(message);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return products;
    return products.filter((item) => {
      const name = (item.product_name ?? '').toLowerCase();
      const desc = (item.product_description ?? '').toLowerCase();
      const company = (item.company_name ?? '').toLowerCase();
      const tags = Array.isArray(item.tagsArray) ? item.tagsArray : [];
      return (
        name.includes(term) ||
        desc.includes(term) ||
        company.includes(term) ||
        tags.some((t) => String(t).toLowerCase().includes(term))
      );
    });
  }, [products, searchTerm]);

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {loading && (
        <div className="px-6 py-4 text-sm text-gray-600">Loading products...</div>
      )}
      {error && (
        <div className="px-6 py-4 text-sm text-red-700 bg-red-50 border-b border-red-200">
          {error}
        </div>
      )}
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tags</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filtered.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                {loading ? '—' : `No products found for "${searchTerm}"`}
              </td>
            </tr>
          ) : (
            filtered.map((item) => (
              <tr key={item.id_product} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link href={`/directory/products/${item.id_product}`} className="text-blue-600 hover:text-blue-800 font-medium">
                    {item.product_name}
                  </Link>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 max-w-md truncate">{item.product_description}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{item.company_name}</td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div className="flex flex-wrap gap-1">
                    {(item.tagsArray ?? []).map((tag, i) => (
                      <span key={i} className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
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
  );
};

export default ProductsTable;
