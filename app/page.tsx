import { auth } from "@clerk/nextjs/server";
import HomePageClient from "../components/home/HomePageClient";

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

interface TrendingEvent {
  id: string; title: string; date: string; location: string;
  price: string; image: string; category: string; aiTag: string;
}

interface UpcomingTicket {
  id: string; title: string; type: string; price: number;
  quantity: number; date: string; time: string;
  location: string; image: string; purchasedAt: string;
}

async function redisGet<T>(key: string): Promise<T | null> {
  const url   = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;

  const res  = await fetch(`${url}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const json = await res.json() as { result: string | null };
  return json.result ? (JSON.parse(json.result) as T) : null;
}

async function fetchTrendingEvents(): Promise<TrendingEvent[]> {
  try {
    const raw = await redisGet<Array<{
      id: string; title: string; date: string; location: string;
      price: string; image: string; category: string; aiTag?: string;
      createdAt?: string; cancelled?: boolean;
    }>>("nene:events");
    if (!raw) return [];

    return raw
      .filter((e) => !e.cancelled)
      .sort((a, b) =>
        new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
      )
      .slice(0, 3)
      .map((e) => ({
        id:       e.id,
        title:    e.title,
        date:     e.date,
        location: e.location,
        price:    e.price,
        image:    e.image?.startsWith("data:")
          ? (CATEGORY_THUMBNAILS[e.category] ?? FALLBACK_IMAGE)
          : (e.image ?? FALLBACK_IMAGE),
        category: e.category,
        aiTag:    e.aiTag ?? "New Added ✨",
      }));
  } catch {
    return [];
  }
}

async function fetchUpcomingTickets(userId: string): Promise<UpcomingTicket[]> {
  try {
    const tickets = await redisGet<UpcomingTicket[]>(`nene:tickets:${userId}`);
    if (!tickets) return [];

    const now = new Date();
    return tickets
      .filter((t) => {
        try { return new Date(t.date).getTime() >= now.getTime(); }
        catch { return true; }
      })
      .slice(0, 3);
  } catch {
    return [];
  }
}

export default async function Home() {
  const { userId } = await auth();

  const [trendingEvents, upcomingTickets] = await Promise.all([
    fetchTrendingEvents(),
    userId ? fetchUpcomingTickets(userId) : Promise.resolve([]),
  ]);

  return (
    <HomePageClient
      trendingEvents={trendingEvents}
      upcomingTickets={upcomingTickets}
    />
  );
}
