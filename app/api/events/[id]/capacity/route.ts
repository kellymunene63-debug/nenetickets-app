import { NextResponse } from "next/server";

const EVENTS_KEY = "nene:events";

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

interface TicketType {
  name: string;
  price: string;
  capacity: string;
}

interface StoredEvent {
  id: string;
  tickets?: TicketType[];
  [key: string]: unknown;
}

type SoldCounts = Record<string, number>;

// GET /api/events/[id]/capacity
// Returns { ticketType: { sold, capacity, available, soldOut } }
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const events = await redisGet<StoredEvent[]>(EVENTS_KEY) ?? [];
    const event  = events.find((e) => e.id === params.id);
    if (!event) return NextResponse.json({}, { status: 404 });

    const soldKey   = `nene:sold:${params.id}`;
    const soldCounts = await redisGet<SoldCounts>(soldKey) ?? {};

    const result: Record<string, { sold: number; capacity: number; available: number; soldOut: boolean }> = {};

    (event.tickets ?? []).forEach((t) => {
      const cap  = parseInt(t.capacity) || 0;
      const sold = soldCounts[t.name] ?? 0;
      result[t.name] = {
        sold,
        capacity: cap,
        available: Math.max(0, cap - sold),
        soldOut: cap > 0 && sold >= cap,
      };
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("GET /api/events/[id]/capacity:", err);
    return NextResponse.json({}, { status: 500 });
  }
}

// POST /api/events/[id]/capacity
// Body: { ticketType: string; quantity: number }
// Increments sold count — called by verify route after successful payment
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { ticketType, quantity = 1 } = await req.json() as { ticketType: string; quantity?: number };
    if (!ticketType) return NextResponse.json({ error: "ticketType required" }, { status: 400 });

    const soldKey    = `nene:sold:${params.id}`;
    const soldCounts = await redisGet<SoldCounts>(soldKey) ?? {};

    // Check capacity before incrementing
    const events = await redisGet<StoredEvent[]>(EVENTS_KEY) ?? [];
    const event  = events.find((e) => e.id === params.id);
    if (event) {
      const ticket = (event.tickets ?? []).find((t) => t.name === ticketType);
      if (ticket) {
        const cap  = parseInt(ticket.capacity) || 0;
        const sold = soldCounts[ticketType] ?? 0;
        if (cap > 0 && sold + quantity > cap) {
          return NextResponse.json({ error: "sold_out", available: Math.max(0, cap - sold) }, { status: 409 });
        }
      }
    }

    soldCounts[ticketType] = (soldCounts[ticketType] ?? 0) + quantity;
    await redisSet(soldKey, soldCounts);

    return NextResponse.json({ success: true, sold: soldCounts[ticketType] });
  } catch (err) {
    console.error("POST /api/events/[id]/capacity:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
