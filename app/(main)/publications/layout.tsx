import MidBanner from "@/app/general_components/banners/MidBanner";

export const runtime = "nodejs";

export default function PublicationsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      {children}
      <MidBanner />
    </>
  );
}
