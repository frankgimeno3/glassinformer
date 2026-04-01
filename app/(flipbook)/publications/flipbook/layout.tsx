import { Playfair_Display } from "next/font/google";
import "./flipbook-layout.css";

export const runtime = "nodejs";

const playfair = Playfair_Display({
  variable: "--font-magazine",
  subsets: ["latin"],
  display: "swap",
});

export default function FlipbookSectionLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className={`${playfair.variable} flex min-h-0 flex-1 flex-col`}>
      {children}
    </div>
  );
}
