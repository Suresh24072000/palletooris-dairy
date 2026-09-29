import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/context/CartContext";
import { AuthProvider } from "@/lib/context/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#173b27",
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://palletoorisdairy.com"),
  title: "Palletoori's Dairy Farm | Pure. Fresh. From our farm.",
  description:
    "Fresh milk and traditional dairy products made with care, delivered from Palletoori's Dairy Farm directly to your home.",
  keywords: [
    "dairy farm",
    "fresh milk",
    "pure ghee",
    "bilona ghee",
    "fresh curd",
    "paneer",
    "farm to home",
    "Palletoori's Dairy Farm",
    "milk delivery",
    "Hyderabad dairy",
  ],
  openGraph: {
    title: "Palletoori's Dairy Farm | Pure. Fresh. From our farm.",
    description:
      "Goodness that comes from home. Farm-to-home fresh dairy delivered daily.",
    url: "https://palletoorisdairy.com",
    siteName: "Palletoori's Dairy Farm",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 600,
        alt: "Palletoori's Dairy Farm",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#fffdf8] text-[#173b27] overflow-x-hidden selection:bg-[#126044] selection:text-white">
        <AuthProvider>
          <CartProvider>{children}</CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
