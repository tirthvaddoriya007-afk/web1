import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
// Next.js processes this global stylesheet; TypeScript may not resolve CSS side-effect imports.
// @ts-ignore
import "./globals.css";

const appFont = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-app-face",
  display: "swap",
});
import { brand } from "@/lib/brand";

export const metadata: Metadata = {
  metadataBase: new URL(brand.siteUrl),
  title: `${brand.name} | ${brand.tagline}`,
  description: `Browse products at ${brand.name}.`,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: brand.colors.primary,
};

// Root layout is intentionally bare: the storefront chrome lives in
// app/(shop)/layout.tsx and the admin panel has its own shell, so /admin
// does not inherit the header, bottom nav or cart drawer.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={appFont.variable}>
      <body>
        {children}
      </body>
    </html>
  );
}
