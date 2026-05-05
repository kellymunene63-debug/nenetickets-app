import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const KEY = "nene:events";

type StoredEvent = Record<string, unknown>;

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

  const json = await res.json() as { result: unknown };
  if (json.result === null || json.result === undefined) return null;

  let data: unknown = json.result;
  if (typeof data === "string") data = JSON.parse(data);
  if (typeof data === "string") data = JSON.parse(data); // double-encoding fallback
  return data as T;
}

async function redisSet(key: string, value: unknown): Promise<void> {
  const url   = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) throw new Error("Redis env vars not configured");

  const res = await fetch(`${url}/set/${encodeURIComponent(key)}`, {
    method:  "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "text/plain" },
    body:    JSON.stringify(value),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Redis SET failed: ${res.status} ${text}`);
  }
}

function stripBase64(e: StoredEvent): StoredEvent {
  const img = e.image as string | undefined;
  return img?.startsWith("data:") ? { ...e, image: "" } : e;
}

// ── Route handlers ────────────────────────────────────────────────────────────

// GET /api/events           → public: only approved events
// GET /api/events?admin=1   → admin: all events (used by admin panel)
export async function GET(req: Request) {
  try {
    const isAdmin = new URL(req.url).searchParams.get("admin") === "1";
    const data    = await redisGet<unknown>(KEY);
    const events  = Array.isArray(data) ? data as StoredEvent[] : [];

    if (isAdmin) return NextResponse.json(events);

    // Public view: only return approved events (and legacy events with no status field)
    const visible = events.filter(
      (e) => !e.status || e.status === "approved"
    );
    return NextResponse.json(visible);
  } catch (err) {
    console.error("GET /api/events:", err);
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  try {
    const event = await req.json() as StoredEvent;

    // All new events start as "pending" — they go live only after admin approval
    const cleanNew: StoredEvent = {
      ...stripBase64(event),
      status:    event.status ?? "pending",
      createdAt: event.createdAt ?? new Date().toISOString(),
    };

    const rawExisting = await redisGet<unknown>(KEY);
    const existing    = Array.isArray(rawExisting)
      ? (rawExisting as StoredEvent[]).map(stripBase64)
      : [];

    await redisSet(KEY, [cleanNew, ...existing]);

    return NextResponse.json({ success: true, event: cleanNew });
  } catch (err) {
    console.error("POST /api/events:", err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
