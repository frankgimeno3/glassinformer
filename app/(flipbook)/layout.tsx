import AppNav from "@/app/general_components/navs/AppNav";

/**
 * Flipbook como vista propia: solo barra superior (AppNav) + contenido.
 * Sin TopBanner, footer, banners laterales ni MidBanner de publicaciones.
 */
export default function FlipbookShellLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-dvh flex-col bg-stone-950">
      <header className="sticky top-0 z-[100] shrink-0 border-b border-stone-800/50 bg-white shadow-sm">
        <AppNav />
      </header>
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
