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
  const json = await res.json() as { result: string | null };
  return json.result ? (JSON.parse(json.result) as T) : null;
}

// Uses the pipeline endpoint so the value is passed as a plain string argument —
// avoids the double-encoding bug of the direct /set/{key} body approach.
async function redisSet(key: string, value: unknown): Promise<void> {
  const url   = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) throw new Error("Redis env vars not configured");

  const res = await fetch(`${url}/pipeline`, {
    method:  "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body:    JSON.stringify([["SET", key, JSON.stringify(value)]]),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Redis SET failed: ${res.status} ${text}`);
  }

  const result = await res.json() as Array<{ result: unknown; error?: string }>;
  if (result[0]?.error) {
    throw new Error(`Redis SET error: ${result[0].error}`);
  }
}

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

    const cleanNew = stripBase64(event);
    const existing = (await redisGet<StoredEvent[]>(KEY) ?? []).map(stripBase64);

    await redisSet(KEY, [cleanNew, ...existing]);

    return NextResponse.json({ success: true, event: cleanNew });
  } catch (err) {
    console.error("POST /api/events:", err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
