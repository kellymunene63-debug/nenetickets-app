import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const KEY = "nene:events";

// ── Upstash Redis helpers (plain fetch — no package needed) ──────────────────
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

async function redisSet(key: string, value: unknown): Promise<void> {
  const url   = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return;

  // Send ["SET", key, serialised-value] as a pipeline command
  await fetch(`${url}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify([["SET", key, JSON.stringify(value)]]),
  });
}

// ── Route handlers ────────────────────────────────────────────────────────────
export async function GET() {
  try {
    const events = await redisGet<object[]>(KEY) ?? [];
    return NextResponse.json(events);
  } catch (err) {
    console.error("GET /api/events:", err);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: Request) {
  try {
    const event  = await req.json();
    const events = await redisGet<object[]>(KEY) ?? [];
    events.unshift(event); // newest first
    await redisSet(KEY, events);
    return NextResponse.json({ success: true, event });
  } catch (err) {
    console.error("POST /api/events:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
