import MidBanner from "@/app/general_components/banners/MidBanner";

export default function ArticleDetailLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <MidBanner />
      {children}
    </>
  );
}
