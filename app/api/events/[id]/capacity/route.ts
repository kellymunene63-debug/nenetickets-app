// app/api/events/[id]/capacity/route.ts
// Called after every successful ticket purchase to record the sale.
// The event page reads capacity from `nene:sold:{id}` (sold counts per ticket
// type) and subtracts from the original capacity — so we increment that key
// here rather than touching the event's capacity field.
//
// PATCH body: { ticketType: string, quantity: number }
// Returns:    { success: boolean, sold: number }

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

    // The event page tracks sales in nene:sold:{eventId}
    // shaped as: { "Regular": 5, "VIP": 2 }
    const soldKey    = `nene:sold:${params.id}`;
    const soldCounts = await redisGet<Record<string, number>>(soldKey) ?? {};

    // Find the existing key with matching name (case-insensitive) so we
    // preserve the exact casing used by the event page for its lookup.
    const matchedKey =
      Object.keys(soldCounts).find(
        (k) => k.toLowerCase() === ticketType.toLowerCase()
      ) ?? ticketType; // fall back to the name sent by the client

    const currentSold = soldCounts[matchedKey] ?? 0;
    const newSold     = currentSold + quantity;

    await redisSet(soldKey, { ...soldCounts, [matchedKey]: newSold });

    return NextResponse.json({ success: true, sold: newSold });
  } catch (err) {
    console.error("PATCH /api/events/[id]/capacity:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
