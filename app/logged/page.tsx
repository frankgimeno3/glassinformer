'use client';

import React, { FC } from 'react';
import Home from '../(main)/page';
import Link from 'next/link';

interface LoggedProps { }

const Logged: FC<LoggedProps> = ({ }) => {
  return (
    <div className='bg-white min-h-[60vh] rounded-lg shadow p-6  md:p-8'>
      <div className='pt-6 flex justify-end'>
        <div className='w-full max-w-xl rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 md:px-5 md:py-4'>
          <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
            <div className='min-w-0'>
              <div className='text-sm font-semibold text-slate-900'>
                Want to personalize your feed?
              </div>
              <div className='mt-1 text-sm text-slate-600'>
                Select your preferences for each category in the portal to receive personalized recommendations.
              </div>
            </div>
            <Link
              href="/logged/settings/content-preferences"
              className='inline-flex shrink-0 items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400'
            >
              Customize
            </Link>
          </div>
        </div>
      </div>
      <Home />
    </div>
  );
};

export default Logged;