"use client";
import { FC, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PortalName } from "@/app/GlassInformerSpecificData";
import DesktopAccountMenuTriggerIcon from "./DesktopAccountMenuTriggerIcon";
import UnloggedDesktopAccountMenu from "./UnloggedDesktopAccountMenu";

const SearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const MenuIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="4" x2="20" y1="12" y2="12" />
    <line x1="4" x2="20" y1="6" y2="6" />
    <line x1="4" x2="20" y1="18" y2="18" />
  </svg>
);

const CloseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

const SECTION_LINKS = [
  { label: "Home", href: "/" },
  { label: "Publications", href: "/publications" },
  { label: "Directory", href: "/directory" },
  { label: "Events", href: "/events" },
];

const UnloggedNav: FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [desktopMenuOpen, setDesktopMenuOpen] = useState(false);
  const navRootRef = useRef<HTMLElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!desktopMenuOpen) return;
    const onDoc = (e: MouseEvent) => {
      const el = navRootRef.current;
      if (!el || !(e.target instanceof Node) || el.contains(e.target)) return;
      setDesktopMenuOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [desktopMenuOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (trimmed) {
      router.push(`/search/${encodeURIComponent(trimmed)}`);
      setMobileMenuOpen(false);
    }
  };

  const handleNavClick = (href: string) => {
    router.push(href);
    setMobileMenuOpen(false);
  };

  return (
    <nav ref={navRootRef} className="flex w-full flex-col border-b bg-white shadow-xl">
      <header className="flex w-full flex-row justify-between border-b border-gray-200 px-4 py-8 sm:px-6 lg:px-12">
        <Link href="/" className="flex flex-col transition-opacity hover:opacity-80">
          <h1 className="mb-2 font-serif text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            {PortalName}
          </h1>
          <p className="font-sans text-sm uppercase tracking-wider text-gray-500">
            {new Date().toLocaleDateString("en-EN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </Link>
        <div className="flex flex-row items-center gap-5 font-sans text-sm uppercase tracking-wider text-gray-500">
          <form
            onSubmit={handleSearch}
            className="flex items-center overflow-hidden rounded-md border border-gray-300 bg-transparent"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="min-w-[140px] border-0 bg-transparent px-3 py-2 text-gray-500 placeholder:text-gray-400 focus:outline-none focus:ring-0"
            />
            <button
              type="submit"
              aria-label="Search"
              className="border-l border-gray-300 bg-transparent p-2 text-gray-500 transition-colors hover:bg-gray-100"
            >
              <SearchIcon />
            </button>
          </form>
          {/* Desktop: mismo trigger que logged; enlaces en fila debajo */}
          <div className="hidden lg:flex">
            <button
              type="button"
              onClick={() => setDesktopMenuOpen((v) => !v)}
              aria-label={desktopMenuOpen ? "Close account menu" : "Open account menu"}
              aria-expanded={desktopMenuOpen}
              aria-controls={desktopMenuOpen ? "unlogged-desktop-account-nav" : undefined}
              className="rounded-lg px-2 py-2 text-gray-600 transition-colors hover:bg-gray-100"
            >
              <DesktopAccountMenuTriggerIcon open={desktopMenuOpen} />
            </button>
          </div>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
          >
            <MenuIcon />
          </button>
        </div>
      </header>

      <UnloggedDesktopAccountMenu open={desktopMenuOpen} onClose={() => setDesktopMenuOpen(false)} />

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-white">
          <div className="absolute right-4 top-4 z-10">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
              className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
            >
              <CloseIcon />
            </button>
          </div>
          <div className="flex flex-1 flex-col items-center overflow-y-auto px-6 pb-12 pt-16">
            <h2 className="mb-6 font-sans text-xs font-semibold uppercase tracking-wider text-gray-400">
              Main Menu
            </h2>
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="mb-12 flex flex-col items-center text-center transition-opacity hover:opacity-80"
            >
              <h1 className="mb-2 font-serif text-4xl font-bold tracking-tight text-gray-900">
                {PortalName}
              </h1>
              <p className="font-sans text-sm uppercase tracking-wider text-gray-500">
                {new Date().toLocaleDateString("en-EN", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </Link>
            <div className="flex w-full max-w-md flex-col gap-10">
              <section>
                <h2 className="mb-4 font-sans text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Account
                </h2>
                <nav className="flex flex-col border-t border-gray-200">
                  <button
                    onClick={() => handleNavClick("/advertise")}
                    className="border-b border-gray-100 py-4 text-left font-serif text-xl text-gray-900 transition-colors hover:text-gray-600"
                  >
                    Advertise
                  </button>
                  <button
                    onClick={() => handleNavClick("/contact")}
                    className="border-b border-gray-100 py-4 text-left font-serif text-xl text-gray-900 transition-colors hover:text-gray-600"
                  >
                    Contact us
                  </button>
                  <button
                    onClick={() => handleNavClick("/auth/login")}
                    className="border-b border-gray-100 py-4 text-left font-serif text-xl text-gray-900 transition-colors hover:text-gray-600"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => handleNavClick("/auth/signup")}
                    className="py-4 text-left font-serif text-xl text-gray-900 transition-colors hover:text-gray-600"
                  >
                    Sign Up
                  </button>
                </nav>
              </section>
              <section>
                <h2 className="mb-4 font-sans text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Sections
                </h2>
                <nav className="flex flex-col border-t border-gray-200">
                  {SECTION_LINKS.map(({ label, href }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="border-b border-gray-100 py-4 text-left font-serif text-xl text-gray-900 transition-colors hover:text-gray-600"
                    >
                      {label}
                    </Link>
                  ))}
                </nav>
              </section>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default UnloggedNav;
