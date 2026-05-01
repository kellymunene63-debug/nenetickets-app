import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Help & Support",
  description: "Need help? Contact the NeneTickets support team or browse our help centre for answers.",
};

export default function SupportLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
