'use client';

import React, { FC } from 'react';
import { useParams } from 'next/navigation';

interface CompanyDetailPageProps {

}

const CompanyDetailPage: FC<CompanyDetailPageProps> = ({ }) => {
  const params = useParams();
  const idCompany = params?.id_company as string;
  const companyName = idCompany ? decodeURIComponent(idCompany.replace(/-/g, ' ')) : '';

  return (
    <div className='min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 px-4 sm:px-6 lg:px-8'>
      <h1 className='text-center text-4xl sm:text-5xl font-bold text-gray-900 pb-8 sm:pb-12'>
        {companyName || 'Company Details'}
      </h1>
      
      <div className='mx-auto max-w-4xl'>
        <p className='text-center text-gray-600 text-lg'>
          Company details for: <span className='font-semibold'>{companyName || idCompany}</span>
        </p>
        <p className='text-center text-gray-500 text-sm mt-4'>
          Company profile content coming soon...
        </p>
      </div>
    </div>
  );
};

export default CompanyDetailPage;


