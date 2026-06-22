"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import RightBanner from "@/app/general_components/banners/RightBanner";
import Footer from "@/app/general_components/navs/footers/Footer";
import SiteHeader from "@/app/general_components/navs/SiteHeader";

export default function MainLayoutClient({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  if (pathname.startsWith("/publications/flipbook")) {
    return <>{children}</>;
  }

  const useWhiteBg =
    pathname === "/contact" ||
    pathname.startsWith("/contact/") ||
    pathname === "/advertise" ||
    pathname.startsWith("/advertise/");

  return (
    <div className="flex flex-col">
      <SiteHeader />
      <div
        className={[
          "flex min-h-screen flex-row pt-4 text-gray-600",
          useWhiteBg ? "bg-white" : "bg-gray-100",
        ].join(" ")}
      >
        <div className="w-full lg:w-[80%] flex-shrink-0 px-12 mt-8 lg:mt-0">
          <div className="flex flex-col">
            <div className="mb-4 hidden flex-row bg-blue-950 text-sm font-sans uppercase tracking-wider text-white lg:flex">
              <Link
                href="/"
                className="flex-1 cursor-pointer bg-transparent p-2 text-center text-sm hover:bg-blue-900"
              >
                Home
              </Link>
              <Link
                href="/publications"
                className="flex-1 cursor-pointer bg-transparent p-2 text-center text-sm hover:bg-blue-900"
              >
                Publications
              </Link>
              <Link
                href="/directory"
                className="flex-1 cursor-pointer bg-transparent p-2 text-center text-sm hover:bg-blue-900"
              >
                Directory
              </Link>
              <Link
                href="/events"
                className="flex-1 cursor-pointer bg-transparent p-2 text-center text-sm hover:bg-blue-900"
              >
                Events
              </Link>
            </div>
            {children}
            <Footer />
          </div>
        </div>
        <div className="hidden lg:block w-[20%] flex-shrink-0 pl-6 bg-white">
          <RightBanner />
        </div>
      </div>
    </div>
  );
}
