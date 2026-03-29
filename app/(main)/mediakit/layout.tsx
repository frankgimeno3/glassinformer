import MidBanner from "@/app/general_components/banners/MidBanner";

export default function MediakitLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      {children}
      <MidBanner />
    </>
  );
}
