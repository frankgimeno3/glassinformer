"use client";

import { usePathname } from "next/navigation";
import MidBanner from "@/app/general_components/banners/MidBanner";

export default function PublicationsLayoutClient({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const hideMidBanner = pathname.startsWith("/publications/flipbook");

  return (
    <>
      {children}
      {!hideMidBanner && <MidBanner />}
    </>
  );
}
