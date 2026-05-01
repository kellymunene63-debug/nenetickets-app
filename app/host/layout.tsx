import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Host an Event",
  description: "Create and manage your events on NeneTickets. Reach thousands of attendees across Kenya.",
};

export default function HostLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
