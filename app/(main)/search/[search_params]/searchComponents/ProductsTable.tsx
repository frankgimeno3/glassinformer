'use client';

import React, { FC } from 'react';
import Link from 'next/link';

interface ProductItem {
  id_product: string;
  product_name: string;
  product_description: string;
  company_name: string;
  tags: string[];
}

const MOCK_PRODUCTS: ProductItem[] = [
  { id_product: '1', product_name: 'Tempered glass panel', product_description: 'Safety glass for facades', company_name: 'Glass Corp', tags: ['facade', 'safety'] },
  { id_product: '2', product_name: 'Insulating glass unit', product_description: 'Double glazing for energy efficiency', company_name: 'Pane Ltd', tags: ['insulation', 'energy'] },
  { id_product: '3', product_name: 'Recycled glass tile', product_description: 'Eco-friendly surface', company_name: 'EcoGlass', tags: ['recycled', 'sustainable'] },
];

interface ProductsTableProps {
  searchTerm: string;
}

const ProductsTable: FC<ProductsTableProps> = ({ searchTerm }) => {
  const filtered = MOCK_PRODUCTS.filter(
    (item) =>
      item.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.product_description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
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
                No products found for &quot;{searchTerm}&quot;
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
                    {item.tags.map((tag, i) => (
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
