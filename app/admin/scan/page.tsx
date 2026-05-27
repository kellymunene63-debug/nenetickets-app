// app/admin/scan/page.tsx
// Server component — checks admin auth before rendering the scanner.
// Fetches ALL approved events and passes them down to the client.

import { auth }         from "@clerk/nextjs/server";
import { redirect }     from "next/navigation";
import AdminScanClient  from "./ScanClient";

export const dynamic = "force-dynamic";

interface HostedEvent {
  id:         string;
  title:      string;
  date:       string;
  venue?:     string;
  status?:    string;
  cancelled?: boolean;
  hostId?:    string;
}

// ─── Fetch all events from Redis ──────────────────────────────────

async function fetchAllEvents(): Promise<HostedEvent[]> {
  const url   = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return [];

  try {
    const res  = await fetch(`${url}/get/${encodeURIComponent("nene:events")}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const json = await res.json() as { result: string | null };
    if (!json.result) return [];

    let data: unknown = json.result;
    if (typeof data === "string") data = JSON.parse(data);
    if (typeof data === "string") data = JSON.parse(data);

    return Array.isArray(data) ? (data as HostedEvent[]) : [];
  } catch {
    return [];
  }
}

// ─── Page ─────────────────────────────────────────────────────────

export default async function AdminScanPage() {
  const { userId } = await auth();

  // Redirect anyone who isn't the platform admin
  if (!userId || userId !== process.env.ADMIN_USER_ID) {
    redirect("/");
  }

  const allEvents  = await fetchAllEvents();
  const activeEvents = allEvents.filter(
    (e) => !e.cancelled && e.status === "approved"
  );

  return <AdminScanClient events={activeEvents} />;
}
