import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const BASE_URL = "https://portfolio-ivory-gamma-65.vercel.app"

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Suraj Singh — Software Engineer",
    template: "%s — Suraj Singh",
  },
  description: "Software engineer with nearly 4 years building full-stack web and mobile applications. Currently at Fynd, shipping production systems with React, Next.js, Node.js, and React Native.",
  openGraph: {
    siteName: "Suraj Singh",
    type: "website",
    locale: "en_US",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Suraj Singh — Software Engineer" }],
  },
  twitter: {
    card: "summary_large_image",
    creator: "@__SurajSingh__",
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="min-h-screen bg-white text-black dark:bg-[#111010] dark:text-white font-sans selection:bg-neutral-200 dark:selection:bg-neutral-700">
          <main className="max-w-2xl mx-auto px-6 py-12 md:px-0 md:py-20 lg:px-0">

            <Navbar />
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
