import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const KEY = "nene:events";

type StoredEvent = Record<string, unknown>;

// ── Redis helpers ─────────────────────────────────────────────────────────────

// Robust get: handles raw-string, single-encoded, and double-encoded results.
// Upstash may return result as a string or already-parsed value depending on
// how the data was originally stored — this handles all cases.
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
  // Unwrap string encoding: parse once (normal), then again if double-encoded
  if (typeof data === "string") data = JSON.parse(data);
  if (typeof data === "string") data = JSON.parse(data);
  return data as T;
}

// Stores the value as a plain JSON string body (single-encoded).
// Upstash /set/{key} with Content-Type text/plain stores the body bytes as-is,
// so JSON.stringify(value) is stored verbatim and read back with one JSON.parse.
async function redisSet(key: string, value: unknown): Promise<void> {
  const url   = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) throw new Error("Redis env vars not configured");

  const res = await fetch(`${url}/set/${encodeURIComponent(key)}`, {
    method:  "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "text/plain" },
    body:    JSON.stringify(value),   // single-encode: no extra JSON.stringify wrapper
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

export async function GET() {
  try {
    const data = await redisGet<unknown>(KEY);
    const events = Array.isArray(data) ? data : [];
    return NextResponse.json(events);
  } catch (err) {
    console.error("GET /api/events:", err);
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  try {
    const event = await req.json() as StoredEvent;

    const cleanNew  = stripBase64(event);
    const rawExisting = await redisGet<unknown>(KEY);
    const existing  = Array.isArray(rawExisting)
      ? (rawExisting as StoredEvent[]).map(stripBase64)
      : [];

    await redisSet(KEY, [cleanNew, ...existing]);

    return NextResponse.json({ success: true, event: cleanNew });
  } catch (err) {
    console.error("POST /api/events:", err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
