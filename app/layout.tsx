import type { Metadata, Viewport } from "next";
import { Amiri, Cormorant_Garamond, Jost, Pinyon_Script } from "next/font/google";
import { site } from "@/site.config";
import "./globals.css";

/* Four voices, and only four:
   — Cormorant for everything that is spoken aloud
   — Pinyon for the ampersand and the handwritten asides
   — Jost for labels, dates and anything functional
   — Amiri for the Arabic of the Bismillah, which deserves a real
     naskh face rather than whatever the device falls back to   */

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const pinyon = Pinyon_Script({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-pinyon",
  display: "swap",
});

const amiri = Amiri({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-amiri",
  display: "swap",
});

const jost = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-jost",
  display: "swap",
});

export const metadata: Metadata = {
  title: site.meta.title,
  description: site.meta.description,
  openGraph: {
    title: site.meta.title,
    description: site.meta.description,
    type: "website",
  },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#07060b",
  width: "device-width",
  initialScale: 1,
  // The envelope is a fixed composition; letting it be pinch-zoomed
  // mid-animation breaks the 3D perspective. Zoom stays available in
  // the browser's own accessibility settings.
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${pinyon.variable} ${jost.variable} ${amiri.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
