"use client";

import { FC } from "react";
import Link from "next/link";

const Footer: FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="flex flex-col shadow-xl bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-12 py-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-b border-gray-200 pb-8">
          <Link
            href="/"
            className="flex flex-col hover:opacity-80 transition-opacity"
          >
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 tracking-tight">
              GlassInformer
            </h2>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-sans mt-1">
              Industry news & insights
            </p>
          </Link>
          <nav className="flex flex-row items-center gap-6 text-sm text-gray-500 uppercase tracking-wider font-sans">
            <Link href="/articles" className="hover:text-gray-900 transition-colors">
              Articles
            </Link>
            <Link href="/publications" className="hover:text-gray-900 transition-colors">
              Publications
            </Link>
            <Link href="/directory" className="hover:text-gray-900 transition-colors">
              Directory
            </Link>
              <Link href="/events" className="hover:text-gray-900 transition-colors">
              Events
            </Link>
            <Link href="/mediakit" className="hover:text-gray-900 transition-colors">
              Mediakit
            </Link>
            <Link href="/auth/login" className="hover:text-gray-900 transition-colors">
              Login
            </Link>
            <Link href="/auth/signup" className="hover:text-gray-900 transition-colors">
              Signup
            </Link>
          </nav>
        </div>
        <div className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500 font-sans">
          <p>© {currentYear} GlassInformer. All rights reserved.</p>
          <p className="text-gray-400">
            {new Date().toLocaleDateString("en-EN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
