import MidBanner from "@/app/general_components/banners/MidBanner";

export default function SearchLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      {children}
      <MidBanner />
    </>
  );
}
