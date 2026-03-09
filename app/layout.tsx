import type { Metadata } from "next";
import { ClerkProvider } from '@clerk/nextjs';
import { Inter } from "next/font/google";
import "./globals.css";
import NeneBot from "../components/shared/NeneBot";
import Footer from "../components/shared/Footer";

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
    // We are forcing Clerk to look directly at your environment variable here
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
      <html lang="en">
        <body className={inter.className}>
          {children}
          <Footer />
          <NeneBot />
        </body>
      </html>
    </ClerkProvider>
  );
}