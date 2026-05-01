import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Tickets",
  description: "View and manage all your NeneTickets purchases in one place.",
};

export default function TicketsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
