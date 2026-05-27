// app/api/tickets/route.ts  (FULL REPLACEMENT)
// Changes from original:
//  - POST now generates a ticketToken and stores a reverse-index key
//    so the scanner can look up any ticket without knowing the buyer's userId.

import { NextResponse } from "next/server";
import { auth }         from "@clerk/nextjs/server";

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
    const parsed = JSON.parse(json.result);
    return (typeof parsed === "string" ? JSON.parse(parsed) : parsed) as T;
  } catch {
    return null;
  }
}

async function redisSet(key: string, value: unknown): Promise<void> {
  const url   = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return;

  await fetch(`${url}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([["SET", key, JSON.stringify(value)]]),
  });
}

function ticketKey(userId: string) {
  return `nene:tickets:${userId}`;
}

function tokenKey(ticketToken: string) {
  return `nene:ticket:token:${ticketToken}`;
}

// ─── GET — fetch all tickets for the signed-in user ───────────────

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

// ─── POST — save a new ticket ──────────────────────────────────────

export interface TicketPayload {
  bookingRef:    string;
  eventId:       string;
  eventTitle:    string;
  eventDate:     string;
  eventVenue?:   string;
  attendeeName:  string;
  attendeeEmail: string;
  quantity:      number;
  amount:        number;
  // Any extra fields your checkout sends are preserved
  [key: string]: unknown;
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ success: false }, { status: 401 });

    const ticket = await req.json() as TicketPayload;

    // Generate a unique scannable token for this ticket
    const ticketToken = `tk_${crypto.randomUUID().replace(/-/g, "")}`;

    // Attach the token to the ticket object
    const ticketWithToken = {
      ...ticket,
      ticketToken,
      checkedIn:   false,
      checkedInAt: null as string | null,
      createdAt:   new Date().toISOString(),
    };

    // 1. Save to the user's ticket list
    const key     = ticketKey(userId);
    const tickets = await redisGet<object[]>(key) ?? [];
    tickets.unshift(ticketWithToken);
    await redisSet(key, tickets);

    // 2. Store a reverse-index entry so the scanner can find this ticket
    //    without knowing the buyer's userId
    await redisSet(tokenKey(ticketToken), {
      userId,
      bookingRef:    ticket.bookingRef,
      eventId:       ticket.eventId,
      eventTitle:    ticket.eventTitle,
      eventDate:     ticket.eventDate,
      eventVenue:    ticket.eventVenue ?? "",
      attendeeName:  ticket.attendeeName,
      attendeeEmail: ticket.attendeeEmail,
      quantity:      ticket.quantity,
      checkedIn:     false,
      checkedInAt:   null as string | null,
    });

    return NextResponse.json({ success: true, ticketToken });
  } catch (err) {
    console.error("POST /api/tickets:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
