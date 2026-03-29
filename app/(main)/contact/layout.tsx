import MidBanner from "@/app/general_components/banners/MidBanner";

export default function ContactLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      {children}
      <MidBanner />
    </>
  );
}
