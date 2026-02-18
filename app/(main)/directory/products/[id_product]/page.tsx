'use client';

import React, { FC, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ProductService } from '@/apiClient/ProductService';
import CompanyContactForm from '../../components/CompanyContactForm';
import AuthenticationService from '@/apiClient/AuthenticationService';
import apiClient from '@/app/apiClient';

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

interface UserProfile {
  userCurrentCompany?: { id_company: string; userPosition: string };
}

const ProductsPage: FC = () => {
  const params = useParams();
  const router = useRouter();
  const idProduct = params?.id_product as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [showContactForm, setShowContactForm] = useState(false);
  const [isLogged, setIsLogged] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (!idProduct) {
      setLoading(false);
      return;
    }
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await ProductService.getProductById(idProduct);
        setProduct(data);
      } catch (error) {
        console.error('Error fetching product:', error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [idProduct]);

  useEffect(() => {
    let cancelled = false;
    AuthenticationService.isAuthenticated().then((auth) => {
      if (cancelled) return;
      setIsLogged(auth);
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!isLogged) {
      setUserProfile(null);
      return;
    }
    let cancelled = false;
    apiClient.get<UserProfile>('/api/v1/users/me').then((res) => {
      if (cancelled) return;
      setUserProfile(res.data);
    }).catch(() => {
      if (!cancelled) setUserProfile(null);
    });
    return () => { cancelled = true; };
  }, [isLogged]);

  const isLinkedToCompany = Boolean(
    isLogged && product && userProfile?.userCurrentCompany?.id_company === product.id_company
  );

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

        <div className='flex flex-wrap items-center justify-between gap-4 mb-8'>
          <h1 className='text-4xl sm:text-5xl font-bold text-gray-900'>
            {product.product_name}
          </h1>
          {isLinkedToCompany && (
            <Link
              href='/logged/companies'
              className='px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700'
            >
              Edit data
            </Link>
          )}
        </div>

        {/* Product image and main info */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8 mb-8'>
          {product.main_image_src ? (
            <div className='md:col-span-1'>
              <img
                src={product.main_image_src}
                alt={product.product_name}
                className='w-full rounded-lg shadow-md object-cover aspect-square'
              />
            </div>
          ) : null}
          <div className={product.main_image_src ? 'md:col-span-2' : 'md:col-span-3'}>
            <div className='bg-gray-50 rounded-lg p-6'>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                {product.price != null && (
                  <div>
                    <h3 className='text-sm font-semibold text-gray-500 uppercase mb-1'>Price</h3>
                    <p className='text-2xl font-semibold text-gray-900'>
                      €{Number(product.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                )}
                <div>
                  <h3 className='text-sm font-semibold text-gray-500 uppercase mb-1'>Company</h3>
                  <Link
                    href={`/directory/companies/${product.id_company}`}
                    className='text-lg text-blue-600 hover:text-blue-800 font-medium cursor-pointer'
                  >
                    {product.company_name}
                  </Link>
                </div>
                <div>
                  <h3 className='text-sm font-semibold text-gray-500 uppercase mb-1'>Product ID</h3>
                  <p className='text-sm text-gray-600'>{product.id_product}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className='mb-8'>
          <h2 className='text-2xl font-bold text-gray-900 mb-4'>Description</h2>
          <p className='text-gray-700 leading-relaxed'>
            {product.product_description || 'No description available.'}
          </p>
        </div>

        {/* Categories */}
        <div className='mb-8'>
          <h2 className='text-2xl font-bold text-gray-900 mb-4'>Categories</h2>
          <div className='flex flex-wrap gap-2'>
            {(product.tagsArray || []).length > 0 ? (
              (product.tagsArray || []).map((tag, index) => (
                <span
                  key={index}
                  className='inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800'
                >
                  {tag}
                </span>
              ))
            ) : (
              <span className='text-gray-500'>No categories</span>
            )}
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
