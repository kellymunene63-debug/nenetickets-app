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
    // Use KEYS to find all hosted-event buckets
    const keysRes = await fetch(`${url}/keys/nene:hosted_events:*`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const keysJson = await keysRes.json() as { result: string[] };
    const keys: string[] = keysJson.result ?? [];

    if (keys.length === 0) return [];

    // Fetch each bucket in one pipeline call
    const pipeline = keys.map((k) => ["GET", k]);
    const pipeRes  = await fetch(`${url}/pipeline`, {
      method:  "POST",
      headers: {
        Authorization:  `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(pipeline),
      cache: "no-store",
    });
    const pipeJson = await pipeRes.json() as { result: string | null }[];

    const allEvents: HostedEvent[] = [];
    for (const item of pipeJson) {
      if (!item.result) continue;
      try {
        const parsed = JSON.parse(item.result);
        const events: HostedEvent[] = typeof parsed === "string"
          ? JSON.parse(parsed)
          : parsed;
        if (Array.isArray(events)) allEvents.push(...events);
      } catch {
        // skip malformed entries
      }
    }
    return allEvents;
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
