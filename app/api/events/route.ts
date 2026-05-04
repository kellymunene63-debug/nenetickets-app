import { NextResponse } from "next/server";

// Node.js runtime — higher body-size limit than edge; no silent truncation
export const dynamic = "force-dynamic";

const KEY = "nene:events";

// ── Redis helpers ─────────────────────────────────────────────────────────────

async function redisGet<T>(key: string): Promise<T | null> {
  const url   = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;

  const res = await fetch(`${url}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const json = await res.json() as { result: string | null };
  return json.result ? (JSON.parse(json.result) as T) : null;
}

// Direct SET endpoint — reliable for large values; throws on failure so the
// caller knows the write didn't happen (unlike the old silent pipeline).
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

// Replace base64 images with empty string so the stored payload stays small.
// The event detail page always fetches the full image from ImgBB — the base64
// in the events list is only needed during the upload flow, not for storage.
type StoredEvent = Record<string, unknown>;
function stripBase64(e: StoredEvent): StoredEvent {
  const img = e.image as string | undefined;
  return img?.startsWith("data:") ? { ...e, image: "" } : e;
}

// ── Route handlers ────────────────────────────────────────────────────────────

export async function GET() {
  try {
    const events = await redisGet<StoredEvent[]>(KEY) ?? [];
    return NextResponse.json(events);
  } catch (err) {
    console.error("GET /api/events:", err);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: Request) {
  try {
    const event = await req.json() as StoredEvent;

    // Strip base64 from new event and all existing events to keep payload lean
    const cleanNew = stripBase64(event);
    const existing = (await redisGet<StoredEvent[]>(KEY) ?? []).map(stripBase64);

    await redisSet(KEY, [cleanNew, ...existing]); // newest first

    return NextResponse.json({ success: true, event: cleanNew });
  } catch (err) {
    console.error("POST /api/events:", err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
