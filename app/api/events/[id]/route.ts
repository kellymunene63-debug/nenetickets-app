import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const KEY = "nene:events";

interface StoredEvent {
  id: string;
  [key: string]: unknown;
}

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
  if (typeof data === "string") data = JSON.parse(data);
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

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const raw = await redisGet<unknown>(KEY);
    const events: StoredEvent[] = Array.isArray(raw) ? raw : [];
    const event = events.find((e) => e.id === params.id);
    if (!event) return NextResponse.json(null, { status: 404 });
    return NextResponse.json(event);
  } catch (err) {
    console.error("GET /api/events/[id]:", err);
    return NextResponse.json(null, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const updates = await req.json();
    const raw = await redisGet<unknown>(KEY);
    const events: StoredEvent[] = Array.isArray(raw) ? raw : [];
    const idx = events.findIndex((e) => e.id === params.id);
    if (idx === -1) return NextResponse.json({ success: false }, { status: 404 });
    events[idx] = { ...events[idx], ...updates };
    await redisSet(KEY, events);
    return NextResponse.json({ success: true, event: events[idx] });
  } catch (err) {
    console.error("PUT /api/events/[id]:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const { cancelled, cancelReason } = await req.json() as { cancelled: boolean; cancelReason?: string };
    const raw = await redisGet<unknown>(KEY);
    const events: StoredEvent[] = Array.isArray(raw) ? raw : [];
    const idx = events.findIndex((e) => e.id === params.id);
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

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const raw = await redisGet<unknown>(KEY);
    const events: StoredEvent[] = Array.isArray(raw) ? raw : [];
    const filtered = events.filter((e) => e.id !== params.id);
    await redisSet(KEY, filtered);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/events/[id]:", err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
