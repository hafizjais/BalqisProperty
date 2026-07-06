import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppFAB from "@/components/layout/WhatsAppFAB";
import { SITE_URL } from "@/lib/constants";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "BalqisMJ Property | Property Agent in Johor Bahru",
    template: "%s | BalqisMJ Property",
  },
  description:
    "Buy, sell and rent property in Johor Bahru with Nurul Balqis of BalqisMJ Property — houses, rooms and commercial space across Iskandar Puteri, Mount Austin, Tebrau, Skudai and more.",
  openGraph: {
    siteName: "BalqisMJ Property",
    locale: "en_MY",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body>
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <WhatsAppFAB />
      </body>
    </html>
  );
}
