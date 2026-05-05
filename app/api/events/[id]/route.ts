import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const KEY = "nene:events";

interface StoredEvent {
  id: string;
  [key: string]: unknown;
}

// ── Redis helpers (robust — handles single & double encoded data) ──────────────

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

// ── Helpers ───────────────────────────────────────────────────────────────────

type Params = { params: { id: string } };

async function getEvents(): Promise<StoredEvent[]> {
  const raw = await redisGet<unknown>(KEY);
  return Array.isArray(raw) ? raw as StoredEvent[] : [];
}

// ── GET /api/events/[id] ──────────────────────────────────────────────────────

export async function GET(_req: Request, { params }: Params) {
  try {
    const events = await getEvents();
    const event  = events.find((e) => e.id === params.id);
    if (!event) return NextResponse.json(null, { status: 404 });
    return NextResponse.json(event);
  } catch (err) {
    console.error("GET /api/events/[id]:", err);
    return NextResponse.json(null, { status: 500 });
  }
}

// ── PUT /api/events/[id] — full update (organizer edit) ──────────────────────

export async function PUT(req: Request, { params }: Params) {
  try {
    const updates = await req.json() as Partial<StoredEvent>;
    const events  = await getEvents();
    const idx     = events.findIndex((e) => e.id === params.id);
    if (idx === -1) return NextResponse.json({ success: false }, { status: 404 });

    // Organizer edits reset to pending for re-review
    events[idx] = {
      ...events[idx],
      ...updates,
      status: "pending",
      id: params.id, // prevent id spoofing
    };

    await redisSet(KEY, events);
    return NextResponse.json({ success: true, event: events[idx] });
  } catch (err) {
    console.error("PUT /api/events/[id]:", err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}

// ── PATCH /api/events/[id] — partial update (cancel, approve, reject) ─────────

export async function PATCH(req: Request, { params }: Params) {
  try {
    const updates = await req.json() as Partial<StoredEvent>;
    const events  = await getEvents();
    const idx     = events.findIndex((e) => e.id === params.id);
    if (idx === -1) return NextResponse.json({ success: false }, { status: 404 });

    events[idx] = { ...events[idx], ...updates, id: params.id };
    await redisSet(KEY, events);
    
    // Send status email to organizer
const updated = events[idx];
if (
  (updates.status === "approved" || updates.status === "rejected") &&
  updated.organizerEmail
) {
  await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? "https://nenetickets.co.ke"}/api/email/event-status`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email:         updated.organizerEmail,
      organizerName: updated.organizerName ?? "Organizer",
      eventTitle:    updated.title,
      status:        updates.status,
      rejectReason:  updates.rejectReason ?? "",
    }),
  });
}
    return NextResponse.json({ success: true, event: events[idx] });
  } catch (err) {
    console.error("PATCH /api/events/[id]:", err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}

// ── DELETE /api/events/[id] ───────────────────────────────────────────────────

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const events  = await getEvents();
    const filtered = events.filter((e) => e.id !== params.id);
    if (filtered.length === events.length) {
      return NextResponse.json({ success: false }, { status: 404 });
    }
    await redisSet(KEY, filtered);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/events/[id]:", err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
