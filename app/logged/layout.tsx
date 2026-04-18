import type { Metadata } from "next";
import "../globals.css";
import MidBanner from "../general_components/banners/MidBanner";
import RightBanner from "../general_components/banners/RightBanner";
import Link from "next/link";
import SiteHeader from "../general_components/navs/SiteHeader";
import Footer from "../general_components/navs/footers/Footer";
import { PortalName, companyDescription } from "../GlassInformerSpecificData";

export const metadata: Metadata = {
  title: PortalName,
  description: companyDescription,
};

export default function LoggedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col">
      <SiteHeader />
      <div className="flex min-h-screen flex-row bg-gray-100 pt-4 text-gray-600">
        {/* Contenedor principal - 80% en PC, 100% en móvil/tablet */}
        <div className="w-full lg:w-[80%] flex-shrink-0 px-12 mt-8 lg:mt-0">
          <div className="flex flex-col">
            {/* Navegación - oculta en móvil/tablet, visible en PC (≥1024px) */}
            <div className='hidden lg:flex flex-row text-sm text-gray-500 uppercase tracking-wider font-sans text-white bg-white mb-4'>
              <Link href='/logged/' className='flex-1 bg-blue-950 hover:bg-blue-950/80 cursor-pointer p-2 text-sm text-center'>
                Home
              </Link>
              <Link href='/publications' className='flex-1 bg-blue-950 hover:bg-blue-950/80 cursor-pointer p-2 text-sm text-center'>
                Publications
              </Link>
              <Link href='/directory' className='flex-1 bg-blue-950 hover:bg-blue-950/80 cursor-pointer p-2 text-sm text-center'>
                Directory
              </Link>
              <Link href='/events' className='flex-1 bg-blue-950 hover:bg-blue-950/80 cursor-pointer p-2 text-sm text-center'>
                Events
              </Link>
            </div>
            <div className="pt-12">
            {children}
            </div>
            <div className="pt-10">
              <MidBanner />
            </div>
            <Footer />
          </div>
        </div>
        {/* Sidebar de banners - visible solo en PC (≥1024px), oculto en móvil/tablet */}
        <div className="hidden lg:block w-[20%] flex-shrink-0 pl-6 bg-white">
          <RightBanner />
        </div>
      </div>
    </div>
  );
}
