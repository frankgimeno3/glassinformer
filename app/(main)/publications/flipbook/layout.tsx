import { Playfair_Display } from "next/font/google";
import AppNav from "@/app/general_components/navs/AppNav";
import "./flipbook-layout.css";

export const runtime = "nodejs";

const playfair = Playfair_Display({
  variable: "--font-magazine",
  subsets: ["latin"],
  display: "swap",
});

/**
 * Flipbook: immersive shell (AppNav + dark bg) plus magazine font.
 * Main site chrome is skipped for /publications/flipbook via MainLayoutClient.
 */
export default function FlipbookSectionLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-dvh flex-col bg-stone-950">
      <header className="sticky top-0 z-[100] shrink-0 border-b border-stone-800/50 bg-white shadow-sm">
        <AppNav />
      </header>
      <div className={`${playfair.variable} flex min-h-0 flex-1 flex-col`}>
        {children}
      </div>
    </div>
  );
}
