import type { Metadata } from "next";
import { ClerkProvider } from '@clerk/nextjs';
import { Inter } from "next/font/google";
import "./globals.css";
import NeneBot from "../components/shared/NeneBot";
import Footer from "../components/shared/Footer";
import PWARegister from "../components/PWARegister";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL('https://nenetickets.co.ke'),
  title: {
    default: "NeneTickets | Discover Events in Kenya",
    template: "%s | NeneTickets",
  },
  description: "Experience the extraordinary. Book tickets for concerts, sports, and tech events in Kenya.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "NeneTickets",
  },
  icons: {
    icon: [{ url: "/favicon.ico?v=2", sizes: "any" }, { url: "/logo.png", type: "image/png" }],
    shortcut: "/favicon.ico?v=2",
    apple: "/apple-touch-icon.png",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "msapplication-TileColor": "#2563eb",
    "theme-color": "#050511",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
      <html lang="en">
        <body className={inter.className}>
          <PWARegister />
          {children}
          <Footer />
          <NeneBot />
        </body>
      </html>
    </ClerkProvider>
  );
}
