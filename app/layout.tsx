import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

/** Layout width emulated on phones (Chrome “Desktop site” ≈ 980px). */
const MOBILE_DESKTOP_LAYOUT_WIDTH = 980;

const mobileDesktopViewportScript = `
(function () {
  var lw = ${MOBILE_DESKTOP_LAYOUT_WIDTH};
  var sw = window.screen.width;
  if (sw >= lw) return;
  var scale = sw / lw;
  var meta = document.querySelector('meta[name="viewport"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", "viewport");
    document.head.appendChild(meta);
  }
  meta.setAttribute(
    "content",
    "width=" + lw + ", initial-scale=" + scale + ", user-scalable=yes"
  );
})();
`.trim();

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Glassinformer",
  description: "Worldwide glass industry news",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script dangerouslySetInnerHTML={{ __html: mobileDesktopViewportScript }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="flex flex-col ">
          {children}
        </div>
      </body>
    </html>
  );
}
