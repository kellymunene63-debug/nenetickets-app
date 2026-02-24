import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NeneBot from "../components/shared/NeneBot";
import Footer from "../components/shared/Footer"; // 1. IMPORT FOOTER

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NeneTickets | Future of Events",
  description: "Experience the extraordinary. Book tickets for concerts, sports, and tech events in Kenya.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Main Content */}
        {children}
        
        {/* 2. Global Footer (Shows on every page) */}
        <Footer />

        {/* Floating AI Bot */}
        <NeneBot />
      </body>
    </html>
  );
}