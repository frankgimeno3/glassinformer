'use client';

import React, { FC, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import productsData from '@/app/contents/productsContents.json';
import CompanyContactForm from '../../components/CompanyContactForm';

interface Product {
  id_product: string;
  product_name: string;
  product_description: string;
  tagsArray: string[];
  id_company: string;
  company_name: string;
}

const ProductsPage: FC = () => {
  const params = useParams();
  const router = useRouter();
  const idProduct = params?.id_product as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [showContactForm, setShowContactForm] = useState(false);

  useEffect(() => {
    if (idProduct) {
      const foundProduct = (productsData as Product[]).find(
        (p) => p.id_product === idProduct
      );
      setProduct(foundProduct || null);
      setLoading(false);
    }
  }, [idProduct]);

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 px-4 sm:px-6 lg:px-8'>
        <div className='mx-auto max-w-4xl'>
          <p className='text-center text-gray-600 text-lg'>Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className='min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 px-4 sm:px-6 lg:px-8'>
        <div className='mx-auto max-w-4xl'>
          <p className='text-center text-red-500 text-lg'>Product not found</p>
          <button
            onClick={() => router.push('/directory')}
            className='mt-4 px-4 py-2 bg-blue-950 text-white rounded-xl mx-auto block'
          >
            Back to Directory
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 px-4 sm:px-6 lg:px-8'>
      <div className='mx-auto max-w-4xl'>
        <button
          onClick={() => router.push('/directory')}
          className='mb-6 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm'
        >
          ← Back to Directory
        </button>

        <h1 className='text-4xl sm:text-5xl font-bold text-gray-900 mb-8'>
          {product.product_name}
        </h1>

        {/* Product Information */}
        <div className='bg-gray-50 rounded-lg p-6 mb-8'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <h3 className='text-sm font-semibold text-gray-500 uppercase mb-1'>Product ID</h3>
              <p className='text-lg text-gray-900'>{product.id_product}</p>
            </div>
            <div>
              <h3 className='text-sm font-semibold text-gray-500 uppercase mb-1'>Company</h3>
              <Link
                href={`/directory/companies/${product.id_company}`}
                className='text-lg text-blue-600 hover:text-blue-800 font-medium cursor-pointer'
              >
                {product.company_name}
              </Link>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className='mb-8'>
          <h2 className='text-2xl font-bold text-gray-900 mb-4'>Description</h2>
          <p className='text-gray-700 leading-relaxed'>{product.product_description}</p>
        </div>

        {/* Tags */}
        <div className='mb-8'>
          <h2 className='text-2xl font-bold text-gray-900 mb-4'>Tags</h2>
          <div className='flex flex-wrap gap-2'>
            {product.tagsArray.map((tag, index) => (
              <span
                key={index}
                className='inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800'
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Company Section */}
        <div className='border-t border-gray-200 pt-6'>
          <h2 className='text-2xl font-bold text-gray-900 mb-4'>Company</h2>
          <div className='bg-gray-50 rounded-lg p-4'>
            <Link
              href={`/directory/companies/${product.id_company}`}
              className='text-xl text-blue-600 hover:text-blue-800 font-semibold cursor-pointer'
            >
              {product.company_name}
            </Link>
            <p className='text-sm text-gray-600 mt-2'>View company profile</p>
          </div>
        </div>

        <div className='border-t border-gray-200 pt-6 mt-6'>
          <button
            type='button'
            onClick={() => setShowContactForm((prev) => !prev)}
            className='px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 cursor-pointer'
          >
            Ask the company about this product
          </button>
          {showContactForm && (
            <div className='mt-6'>
              <CompanyContactForm />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
