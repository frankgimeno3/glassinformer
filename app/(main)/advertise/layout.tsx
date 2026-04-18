import MidBanner from "@/app/general_components/banners/MidBanner";

export default function AdvertiseLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      {children}
      <MidBanner />
    </>
  );
}
