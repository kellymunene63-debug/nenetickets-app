import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const KEY = "nene:events";

interface StoredEvent {
  id: string;
  [key: string]: unknown;
}

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

  await fetch(`${url}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify([["SET", key, JSON.stringify(value)]]),
  });
}

// ── Route handlers ────────────────────────────────────────────────────────────
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const events = await redisGet<StoredEvent[]>(KEY) ?? [];
    const event  = events.find((e) => e.id === params.id);
    if (!event) return NextResponse.json(null, { status: 404 });
    return NextResponse.json(event);
  } catch (err) {
    console.error("GET /api/events/[id]:", err);
    return NextResponse.json(null, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const updates = await req.json();
    const events  = await redisGet<StoredEvent[]>(KEY) ?? [];
    const idx     = events.findIndex((e) => e.id === params.id);
    if (idx === -1) return NextResponse.json({ success: false }, { status: 404 });
    events[idx] = { ...events[idx], ...updates };
    await redisSet(KEY, events);
    return NextResponse.json({ success: true, event: events[idx] });
  } catch (err) {
    console.error("PUT /api/events/[id]:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

// PATCH — soft-cancel or restore an event
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { cancelled, cancelReason } = await req.json() as { cancelled: boolean; cancelReason?: string };
    const events = await redisGet<StoredEvent[]>(KEY) ?? [];
    const idx    = events.findIndex((e) => e.id === params.id);
    if (idx === -1) return NextResponse.json({ success: false }, { status: 404 });
    events[idx] = {
      ...events[idx],
      cancelled,
      cancelReason: cancelReason ?? "",
      cancelledAt:  cancelled ? new Date().toISOString() : null,
    };
    await redisSet(KEY, events);
    return NextResponse.json({ success: true, event: events[idx] });
  } catch (err) {
    console.error("PATCH /api/events/[id]:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const events   = await redisGet<StoredEvent[]>(KEY) ?? [];
    const filtered = events.filter((e) => e.id !== params.id);
    await redisSet(KEY, filtered);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/events/[id]:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
