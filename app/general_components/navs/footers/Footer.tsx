"use client";

import { FC, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import AuthenticationService from "@/apiClient/AuthenticationService";

const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const Footer: FC = () => {
  const currentYear = new Date().getFullYear();
  const [isLogged, setIsLogged] = useState<boolean | null>(null);
  const [legalOpen, setLegalOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    AuthenticationService.isAuthenticated().then((auth) => {
      if (!cancelled) setIsLogged(auth);
    });
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  const handleLogout = async () => {
    await AuthenticationService.logout();
    router.replace("/");
  };

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
            {isLogged === true ? (
              <button
                type="button"
                onClick={handleLogout}
                className="hover:text-gray-900 transition-colors uppercase tracking-wider"
              >
                Log out
              </button>
            ) : (
              <>
                <Link href="/auth/login" className="hover:text-gray-900 transition-colors">
                  Login
                </Link>
                <Link href="/auth/signup" className="hover:text-gray-900 transition-colors">
                  Signup
                </Link>
              </>
            )}
          </nav>
        </div>
        <div className="pt-6 border-t border-gray-100 mt-2">
          <button
            type="button"
            onClick={() => setLegalOpen((prev) => !prev)}
            className="flex items-center gap-2 w-full sm:w-auto text-sm text-gray-500 uppercase tracking-wider font-sans hover:text-gray-900 transition-colors py-2"
            aria-expanded={legalOpen}
          >
            <span>Legal &amp; policies</span>
            <ChevronDownIcon
              className={`shrink-0 transition-transform duration-200 ${legalOpen ? "rotate-180" : ""}`}
            />
          </button>
          {legalOpen && (
            <nav className="mt-2 pl-0   flex flex-col sm:flex-row gap-2 sm:gap-4 text-sm text-gray-500 font-sans">
              <Link href="/legal/legal-notice" className="hover:text-gray-900 transition-colors">
                Legal notice
              </Link>
              <Link href="/legal/privacy-policy" className="hover:text-gray-900 transition-colors">
                Privacy policy
              </Link>
              <Link href="/legal/cookie-policy" className="hover:text-gray-900 transition-colors">
                Cookie policy
              </Link>
            </nav>
          )}
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
