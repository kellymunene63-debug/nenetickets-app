import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const KEY = "nene:events";

type StoredEvent = Record<string, unknown>;

async function redisGet<T>(key: string): Promise<T | null> {
  const url   = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  const res  = await fetch(`${url}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const json = await res.json() as { result: string | null };
  return json.result ? (JSON.parse(json.result) as T) : null;
}

async function redisSet(key: string, value: unknown): Promise<void> {
  const url   = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) throw new Error("Redis env vars not configured");
  const serialised = JSON.stringify(value);
  const res = await fetch(`${url}/set/${encodeURIComponent(key)}`, {
    method:  "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body:    JSON.stringify(serialised),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Redis SET failed: ${res.status} ${text}`);
  }
}

export async function POST() {
  try {
    const events = await redisGet<StoredEvent[]>(KEY) ?? [];

    let stripped = 0;
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
    const fallback = "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070";

    const cleaned = events.map((e) => {
      const img = e.image as string | undefined;
      if (img?.startsWith("data:")) {
        stripped++;
        const category = (e.category as string) ?? "";
        return { ...e, image: CATEGORY_THUMBNAILS[category] ?? fallback };
      }
      return e;
    });

    await redisSet(KEY, cleaned);

    return NextResponse.json({
      success: true,
      total:   events.length,
      stripped,
      message: `Cleaned ${stripped} event(s) with base64 images out of ${events.length} total. Redis payload is now lean.`,
    });
  } catch (err) {
    console.error("Cleanup error:", err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
