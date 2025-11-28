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

export const metadata: Metadata = {
  title: "Suraj Singh",
  description: "Software Development Engineer with 3.8 years of experience in full stack development using modern technologies such as HTML, CSS, JavaScript, React, React Native, Next.js, Node, Express, Nest.js, Docker, MongoDB, and SQL. Skilled in building high-performance web applications with Web Workers, Service Workers, and IndexedDB, and AWS for scalable deployments.",
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
          <div className="max-w-2xl mx-auto px-6 py-12 md:px-0 md:py-20 lg:px-0">

            <Navbar />
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
