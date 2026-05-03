import HomePageClient from "../components/home/HomePageClient";

// ── Category thumbnails for events with uploaded (base64) photos ──────────────
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

// Server-side Redis fetch — runs before the page is sent to the browser,
// so trending events are in the HTML with zero client-side delay.
async function fetchTrendingEvents(): Promise<TrendingEvent[]> {
  try {
    const url   = process.env.KV_REST_API_URL;
    const token = process.env.KV_REST_API_TOKEN;
    if (!url || !token) return [];

    const res  = await fetch(`${url}/get/${encodeURIComponent("nene:events")}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store", // always fresh — shows deleted events gone immediately
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

export default async function Home() {
  const trendingEvents = await fetchTrendingEvents();
  return <HomePageClient trendingEvents={trendingEvents} />;
}
