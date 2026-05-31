// app/api/tickets/route.ts  (FULL REPLACEMENT)
// Key changes from previous version:
//  - POST no longer returns 401 for unauthenticated users.
//    Guests are stored under nene:tickets:ref:{reference} so their
//    tickets are visible in the organiser dashboard KEYS scan.
//  - ticketToken reverse-index is always written regardless of auth.
//  - email + eventId are now stored on the ticket record.

import { NextResponse } from "next/server";
import { auth }         from "@clerk/nextjs/server";

export const runtime = "edge";
export const dynamic = "force-dynamic";

// ─── Redis helpers ────────────────────────────────────────────────────────────

async function redisGet<T>(key: string): Promise<T | null> {
  const url   = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;

  const res  = await fetch(`${url}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return null;

  const json = await res.json() as { result: string | null };
  if (!json.result) return null;

  try {
    let data: unknown = json.result;
    if (typeof data === "string") data = JSON.parse(data);
    if (typeof data === "string") data = JSON.parse(data); // double-encode fallback
    return data as T;
  } catch {
    return null;
  }
}

async function redisSet(key: string, value: unknown): Promise<void> {
  const url   = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return;

  await fetch(`${url}/pipeline`, {
    method:  "POST",
    headers: {
      Authorization:  `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([["SET", key, JSON.stringify(value)]]),
  });
}

function ticketKey(userId: string)      { return `nene:tickets:${userId}`; }
function guestKey (reference: string)   { return `nene:tickets:ref:${reference}`; }
function tokenKey (ticketToken: string) { return `nene:ticket:token:${ticketToken}`; }

// ─── GET — fetch all tickets for the signed-in user ──────────────────────────

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json([], { status: 401 });

    const tickets = await redisGet<object[]>(ticketKey(userId)) ?? [];
    return NextResponse.json(tickets);
  } catch (err) {
    console.error("GET /api/tickets:", err);
    return NextResponse.json([], { status: 200 });
  }
}

// ─── POST — save a new ticket (works for both logged-in and guest buyers) ─────

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const ticket = await req.json() as Record<string, unknown>;

    // Generate a unique scannable token
    const ticketToken = `tk_${crypto.randomUUID().replace(/-/g, "")}`;

    const ticketWithToken = {
      ...ticket,
      ticketToken,
      checkedIn:   false,
      checkedInAt: null as string | null,
      createdAt:   new Date().toISOString(),
    };

    // ── Choose storage key ───────────────────────────────────────────────────
    // Authenticated user → keyed by Clerk userId (shows on /tickets page)
    // Guest buyer        → keyed by payment reference (always scannable + visible
    //                      to the organiser dashboard via KEYS scan)
    const key = userId
      ? ticketKey(userId)
      : guestKey(String(ticket.reference ?? ticketToken));

    const existing = await redisGet<object[]>(key) ?? [];
    existing.unshift(ticketWithToken);
    await redisSet(key, existing);

    // ── Reverse-index for scanner ────────────────────────────────────────────
    await redisSet(tokenKey(ticketToken), {
      userId:        userId ?? null,
      bookingRef:    ticket.id          ?? ticket.reference,
      eventId:       ticket.eventId     ?? null,
      eventTitle:    ticket.title       ?? ticket.eventTitle ?? "",
      attendeeName:  ticket.attendeeName ?? ticket.name ?? "",
      attendeeEmail: ticket.email       ?? ticket.attendeeEmail ?? "",
      quantity:      ticket.quantity    ?? 1,
      checkedIn:     false,
      checkedInAt:   null as string | null,
    });

    return NextResponse.json({ success: true, ticketToken });
  } catch (err) {
    console.error("POST /api/tickets:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
