// app/api/events/[id]/capacity/route.ts  (NEW FILE)
// Called after every successful ticket purchase to decrement remaining capacity.
//
// PATCH body: { ticketType: string, quantity: number }
// Returns:    { success: boolean, remaining: number }

import { NextResponse } from "next/server";

export const runtime = "edge";
export const dynamic = "force-dynamic";

// ─── Redis helpers ────────────────────────────────────────────────

async function redisGet<T>(key: string): Promise<T | null> {
  const url   = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;

  const res  = await fetch(`${url}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const json = await res.json() as { result: string | null };
  if (!json.result) return null;

  try {
    let data: unknown = json.result;
    if (typeof data === "string") data = JSON.parse(data);
    if (typeof data === "string") data = JSON.parse(data);
    return data as T;
  } catch {
    return null;
  }
}

async function redisSet(key: string, value: unknown): Promise<void> {
  const url   = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return;

  await fetch(`${url}/set/${encodeURIComponent(key)}`, {
    method:  "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "text/plain" },
    body:    JSON.stringify(value),
  });
}

// ─── Types ────────────────────────────────────────────────────────

interface TicketType {
  name:     string;
  price:    string;
  capacity: string;
}

interface StoredEvent {
  id:      string;
  tickets?: TicketType[];
  [key: string]: unknown;
}

// ─── PATCH /api/events/[id]/capacity ─────────────────────────────

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { ticketType, quantity } = await req.json() as {
      ticketType: string;
      quantity:   number;
    };

    if (!ticketType || !quantity || quantity < 1) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // Load all events
    const events = await redisGet<StoredEvent[]>("nene:events") ?? [];
    const eventIndex = events.findIndex((e) => e.id === params.id);

    if (eventIndex === -1) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const event = events[eventIndex];
    if (!event.tickets || event.tickets.length === 0) {
      return NextResponse.json({ error: "No ticket types found" }, { status: 404 });
    }

    // Find the matching ticket type (case-insensitive)
    const ticketIndex = event.tickets.findIndex(
      (t) => t.name.toLowerCase() === ticketType.toLowerCase()
    );

    if (ticketIndex === -1) {
      return NextResponse.json({ error: "Ticket type not found" }, { status: 404 });
    }

    // Decrement capacity — never go below 0
    const currentCapacity = parseInt(event.tickets[ticketIndex].capacity) || 0;
    const newCapacity     = Math.max(0, currentCapacity - quantity);

    // Rebuild the events array with the updated capacity
    events[eventIndex] = {
      ...event,
      tickets: event.tickets.map((t, i) =>
        i === ticketIndex
          ? { ...t, capacity: String(newCapacity) }
          : t
      ),
    };

    await redisSet("nene:events", events);

    return NextResponse.json({ success: true, remaining: newCapacity });
  } catch (err) {
    console.error("PATCH /api/events/[id]/capacity:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
