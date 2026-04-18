"use client";
import { FC, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthenticationService from "@/apiClient/AuthenticationService";
import { PortalName } from "@/app/GlassInformerSpecificData";
import LoggedDesktopAccountMenu from "./LoggedDesktopAccountMenu";
import DesktopAccountMenuTriggerIcon from "./DesktopAccountMenuTriggerIcon";
import NotificationsNavButton from "./NotificationsNavButton";

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
  { label: "Home", href: "/logged/" },
  { label: "Publications", href: "/publications" },
  { label: "Directory", href: "/directory" },
  { label: "Events", href: "/events" },
];

const LoggedNav: FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [desktopMenuOpen, setDesktopMenuOpen] = useState(false);
  const navRootRef = useRef<HTMLElement | null>(null);
  const router = useRouter();

  const handleLogout = async () => {
    await AuthenticationService.logout();
    router.replace("/");
    setMobileMenuOpen(false);
    setDesktopMenuOpen(false);
  };

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
        <Link href="/logged" className="flex flex-col hover:opacity-80 transition-opacity">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 tracking-tight mb-2">
            {PortalName}
          </h1>
          <p className="text-sm text-gray-500 uppercase tracking-wider font-sans">
            {new Date().toLocaleDateString("en-EN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </Link>
        <div className="flex flex-row items-center gap-5 text-sm text-gray-500 uppercase tracking-wider font-sans">
          <form
            onSubmit={handleSearch}
            className="flex items-center border border-gray-300 rounded-md overflow-hidden bg-transparent"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="px-3 py-2 text-gray-500 bg-transparent border-0 focus:outline-none focus:ring-0 min-w-[140px] placeholder:text-gray-400"
            />
            <button
              type="submit"
              aria-label="Search"
              className="p-2 text-gray-500 bg-transparent border-l border-gray-300 hover:bg-gray-100 transition-colors"
            >
              <SearchIcon />
            </button>
          </form>
          {/* Desktop: notifications · log out · menú (fila secundaria debajo del header, no flotante) */}
          <div className="hidden items-center gap-3 lg:flex">
            <NotificationsNavButton />
            <button
              type="button"
              onClick={handleLogout}
              className="cursor-pointer rounded-lg bg-blue-950 px-3 py-2 text-xs font-sans font-semibold uppercase tracking-wider text-white shadow-lg transition hover:bg-blue-950/90"
            >
              Log out
            </button>
            <button
              type="button"
              onClick={() => setDesktopMenuOpen((v) => !v)}
              aria-label={desktopMenuOpen ? "Close account menu" : "Open account menu"}
              aria-expanded={desktopMenuOpen}
              aria-controls={desktopMenuOpen ? "logged-desktop-account-nav" : undefined}
              className="rounded-lg px-2 py-2 text-gray-600 transition-colors hover:bg-gray-100"
            >
              <DesktopAccountMenuTriggerIcon open={desktopMenuOpen} />
            </button>
          </div>
          {/* Botón menú hamburguesa - visible en móvil y tablet (<1024px) */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
            className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <MenuIcon />
          </button>
        </div>
      </header>

      <LoggedDesktopAccountMenu open={desktopMenuOpen} onClose={() => setDesktopMenuOpen(false)} />

      {/* Mobile menu modal */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col">
          <div className="absolute top-4 right-4 z-10">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <CloseIcon />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto flex flex-col items-center pt-16 pb-12 px-6">
            <h2 className="text-xs font-sans font-semibold text-gray-400 uppercase tracking-wider mb-6">Main Menu</h2>
            <Link
              href="/logged"
              onClick={() => setMobileMenuOpen(false)}
              className="flex flex-col items-center text-center hover:opacity-80 transition-opacity mb-12"
            >
              <h1 className="text-4xl font-serif font-bold text-gray-900 tracking-tight mb-2">
                {PortalName}
              </h1>
              <p className="text-sm text-gray-500 uppercase tracking-wider font-sans">
                {new Date().toLocaleDateString("en-EN", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </Link>
            <div className="w-full max-w-md flex flex-col gap-10">
              <section>
                <h2 className="text-xs font-sans font-semibold text-gray-400 uppercase tracking-wider mb-4">Account</h2>
                <nav className="flex flex-col border-t border-gray-200">
                  <div
                    className="border-b border-gray-100 py-4"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <NotificationsNavButton className="!w-full justify-center border-0 shadow-none" />
                  </div>
                  <button
                    onClick={() => handleNavClick("/logged/companies")}
                    className="py-4 text-left font-serif text-xl text-gray-900 hover:text-gray-600 transition-colors border-b border-gray-100"
                  >
                    My Companies
                  </button>
                  <button
                    onClick={() => handleNavClick("/logged/profiles/me")}
                    className="py-4 text-left font-serif text-xl text-gray-900 hover:text-gray-600 transition-colors border-b border-gray-100"
                  >
                    My Profile
                  </button>
                  <button
                    onClick={() => handleNavClick("/logged/settings")}
                    className="py-4 text-left font-serif text-xl text-gray-900 hover:text-gray-600 transition-colors border-b border-gray-100"
                  >
                    Settings
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="py-4 text-left font-serif text-xl text-gray-900 hover:text-gray-600 transition-colors"
                  >
                    Log out
                  </button>
                </nav>
              </section>
              <section>
                <h2 className="text-xs font-sans font-semibold text-gray-400 uppercase tracking-wider mb-4">Sections</h2>
                <nav className="flex flex-col border-t border-gray-200">
                  {SECTION_LINKS.map(({ label, href }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-4 text-left font-serif text-xl text-gray-900 hover:text-gray-600 transition-colors border-b border-gray-100"
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

export default LoggedNav;
