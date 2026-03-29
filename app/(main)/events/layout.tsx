import MidBanner from "@/app/general_components/banners/MidBanner";

export default function EventsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      {children}
      <MidBanner />
    </>
  );
}
