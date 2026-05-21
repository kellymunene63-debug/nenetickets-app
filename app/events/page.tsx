import { Suspense } from "react";
import type { Metadata } from "next";
export const dynamic = "force-dynamic";
import Navbar from "../../components/shared/Navbar";
import EventsClient from "../../components/events/EventsClient";
import type { Event } from "../../libs/events";

export const metadata: Metadata = {
  title: "Browse Events",
  description: "Discover and book tickets for the best concerts, sports matches, and conferences in Kenya.",
};

// Category-specific thumbnails used when an event has an uploaded (base64) photo.
// Base64 images can be 500KB+ each — embedding them server-side would bloat the HTML.
// The event detail page (app/event/[id]) always shows the real uploaded image.
const CATEGORY_THUMBNAILS: Record<string, string> = {
  "Music":        "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070",
  "Sports":       "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=1931",
  "Business":     "https://images.unsplash.com/photo-1544531586-fde5298cdd40?q=80&w=2070",
  "Arts":         "https://images.unsplash.com/photo-1574169208507-84376144848b?q=80&w=2079",
  "Tech":         "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070",
  "Nightlife":    "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=2070",
  "Adventure":    "https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=2070",
  "Food & Drink": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=2074",
  "Charity":      "https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=2070",
};

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070";

function thumbnailFor(image: string, category: string): string {
  if (!image?.startsWith("data:")) return image ?? FALLBACK_IMAGE;
  return CATEGORY_THUMBNAILS[category] ?? FALLBACK_IMAGE;
}

// 3-second timeout wrapper — prevents a slow Redis from hanging the page indefinitely.
function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
  ]);
}

// Fetch user-created events from Redis.
async function fetchHostedEvents(): Promise<Event[]> {
  try {
    const url   = process.env.KV_REST_API_URL;
    const token = process.env.KV_REST_API_TOKEN;
    if (!url || !token) return [];

    const res = await fetch(`${url}/get/${encodeURIComponent("nene:events")}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    const json = await res.json() as { result: unknown };
    if (!json.result) return [];

    let parsed: unknown = json.result;
    if (typeof parsed === "string") parsed = JSON.parse(parsed);
    if (typeof parsed === "string") parsed = JSON.parse(parsed);
    if (!Array.isArray(parsed)) return [];

    const raw = parsed as Array<{
      id: string; title: string; date: string; location: string;
      price: string; image: string; category: string; aiTag?: string;
      createdAt?: string; cancelled?: boolean; status?: string;
    }>;

    return raw
      .filter((e) => !e.cancelled && e.status === "approved")
      .sort((a, b) =>
        new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
      )
      .map((e) => ({
        id:       e.id,
        title:    e.title,
        date:     e.date,
        location: e.location,
        price:    e.price,
        image:    thumbnailFor(e.image, e.category),
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

async function EventsData() {
  const events = await withTimeout(fetchHostedEvents(), 3000, []);
  return <EventsClient defaultEvents={events} />;
}

export default function AllEventsPage() {
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
        <EventsData />
      </Suspense>
    </main>
  );
}
