import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

// Manrope — closest free match to the reference's licensed "Mier" typeface.
// Mier is a geometric humanist sans; Manrope shares its narrow proportions and
// flat terminals, where Mulish (used previously) rendered wider and heavier at
// the same size/weight, making 18px "book" text look bold.
const appFont = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-app-face",
  display: "swap",
});
import { brand } from "@/lib/brand";

export const metadata: Metadata = {
  title: `${brand.tagline} - ${brand.name}`,
  description: `${brand.name} — mega sale on groceries, fashion, electronics and more.`,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: brand.colors.primary,
};

// Root layout is intentionally bare: the storefront chrome lives in
// app/(shop)/layout.tsx and the admin panel has its own shell, so /admin
// does not inherit the header, bottom nav or cart drawer.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={appFont.variable}>
      <body>{children}</body>
    </html>
  );
}
