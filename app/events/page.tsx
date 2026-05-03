import { Suspense } from "react";
import type { Metadata } from "next";
import Navbar from "../../components/shared/Navbar";
import EventsClient from "../../components/events/EventsClient";
import { DEFAULT_EVENTS } from "../../lib/events";
import type { Event } from "../../lib/events";

export const metadata: Metadata = {
  title: "Browse Events",
  description: "Discover and book tickets for the best concerts, sports matches, and conferences in Kenya.",
};

// Placeholder for events with uploaded (base64) photos — avoids bloating the HTML
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070";

// Server-side Redis fetch — runs at request time, so events appear in the
// initial HTML with zero client-side delay.
async function fetchHostedEvents(): Promise<Event[]> {
  try {
    const url   = process.env.KV_REST_API_URL;
    const token = process.env.KV_REST_API_TOKEN;
    if (!url || !token) return [];

    const res  = await fetch(`${url}/get/${encodeURIComponent("nene:events")}`, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 30 }, // refresh every 30 s on Vercel
    });
    const json = await res.json() as { result: string | null };
    if (!json.result) return [];

    const raw = JSON.parse(json.result) as Array<{
      id: string; title: string; date: string; location: string;
      price: string; image: string; category: string; aiTag?: string;
      createdAt?: string; cancelled?: boolean;
    }>;

    return raw
      .filter((e) => !e.cancelled)
      // Most recently created events appear first
      .sort((a, b) =>
        new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
      )
      .map((e) => ({
        id:       e.id,
        title:    e.title,
        date:     e.date,
        location: e.location,
        price:    e.price,
        // Don't embed base64 images in the page HTML — use placeholder instead
        image:    e.image?.startsWith("data:") ? FALLBACK_IMAGE : (e.image ?? FALLBACK_IMAGE),
        category: e.category,
        aiTag:    e.aiTag ?? "New Added ✨",
      }));
  } catch {
    return [];
  }
}

function EventsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden animate-pulse">
          <div className="h-48 bg-white/10" />
          <div className="p-5 space-y-3">
            <div className="h-3 bg-white/10 rounded w-1/4" />
            <div className="h-5 bg-white/10 rounded w-3/4" />
            <div className="h-3 bg-white/10 rounded w-1/2" />
            <div className="h-3 bg-white/10 rounded w-1/3" />
            <div className="h-10 bg-white/10 rounded-lg mt-4" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function AllEventsPage() {
  // Fetch user-created events from Redis on the server
  const hosted = await fetchHostedEvents();

  // Hosted events first (newest first), then the 3 demo events — no duplicates
  const defaultIds = new Set(DEFAULT_EVENTS.map((e) => e.id));
  const newHosted  = hosted.filter((e) => !defaultIds.has(e.id));
  const allEvents  = [...newHosted, ...DEFAULT_EVENTS];

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      <Suspense
        fallback={
          <div className="container mx-auto px-4 pt-32 pb-20">
            <div className="h-8 bg-white/10 rounded w-48 mb-10 animate-pulse" />
            <EventsSkeleton />
          </div>
        }
      >
        <EventsClient defaultEvents={allEvents} />
      </Suspense>
    </main>
  );
}
