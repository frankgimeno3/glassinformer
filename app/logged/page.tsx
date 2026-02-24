'use client';

import React, { FC } from 'react';
import Home from '../(main)/page';
import Link from 'next/link';

interface LoggedProps { }

const Logged: FC<LoggedProps> = ({ }) => {
  return (
    <div className='bg-white min-h-[60vh] rounded-lg shadow p-6  md:p-8'>
      <div className='flex flex-row justify-end pt-6'>
        <Link
          href="/logged/settings/content-preferences"
          className='group relative overflow-hidden cursor-pointer text-white px-4 py-2 rounded-lg text-sm inline-block min-w-[180px] text-center'
        >
          {/* Base gradient */}
          <span className="absolute inset-0 bg-gradient-to-r from-violet-700 to-blue-950 rounded-lg transition-opacity duration-500 ease-in-out group-hover:opacity-0" aria-hidden />
          {/* Hover: solid blue-900 */}
          <span className="absolute inset-0 bg-blue-900 rounded-lg opacity-0 transition-opacity duration-500 ease-in-out group-hover:opacity-100" aria-hidden />
          <span className="relative z-10">Customize your feed</span>
        </Link>
      </div>
    <Home/>
    </div>
  );
};

export default Logged;