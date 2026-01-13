'use client';

import React, { FC } from 'react';

interface DirectoryProps {

}

const Directory: FC<DirectoryProps> = ({ }) => {
  return (
    <div className='min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 px-4 sm:px-6 lg:px-8'>
      <h1 className='text-center text-4xl sm:text-5xl font-bold text-gray-900 pb-8 sm:pb-12'>Directory</h1>
      
      <div className='mx-auto max-w-4xl'>
        <p className='text-center text-gray-600 text-lg'>
          Directory content coming soon...
        </p>
      </div>
    </div>
  );
};

export default Directory;

