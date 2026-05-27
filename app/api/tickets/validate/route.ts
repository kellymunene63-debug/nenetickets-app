// app/api/tickets/validate/route.ts  (NEW FILE)
// Called by the host scanner to validate and check-in a ticket.
//
// POST body: { ticketToken: string, eventId: string }
// Returns:   { valid: boolean, message: string, attendee?: {...} }

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

// ─── Types ────────────────────────────────────────────────────────

interface TokenRecord {
  userId:        string;
  bookingRef:    string;
  eventId:       string;
  eventTitle:    string;
  eventDate:     string;
  eventVenue:    string;
  attendeeName:  string;
  attendeeEmail: string;
  quantity:      number;
  checkedIn:     boolean;
  checkedInAt:   string | null;
}

interface HostedEvent {
  id:        string;
  hostId:    string;
  title:     string;
  status?:   string;
  cancelled?: boolean;
}

// ─── POST /api/tickets/validate ───────────────────────────────────

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { valid: false, message: "Not signed in." },
        { status: 401 }
      );
    }

    const body = await req.json() as { ticketToken?: string; eventId?: string };
    const { ticketToken, eventId } = body;

    if (!ticketToken) {
      return NextResponse.json({ valid: false, message: "No ticket token provided." });
    }

    // 1. Look up the token
    const record = await redisGet<TokenRecord>(
      `nene:ticket:token:${ticketToken}`
    );

    if (!record) {
      return NextResponse.json({
        valid:   false,
        message: "Invalid ticket — not found in our system.",
      });
    }

    // 2. If an eventId was provided, make sure the ticket is for that event
    if (eventId && record.eventId !== eventId) {
      return NextResponse.json({
        valid:   false,
        message: `Wrong event. This ticket is for "${record.eventTitle}".`,
      });
    }

    // 3. Check the scanner is the organiser of this event
    //    (fetch the event and confirm hostId matches the signed-in user)
    const hostedEventsRaw = await redisGet<unknown>(
      `nene:hosted_events:${userId}`
    );
    const hostedEvents: HostedEvent[] = Array.isArray(hostedEventsRaw)
      ? (hostedEventsRaw as HostedEvent[])
      : [];

    const isOrganiserOfEvent = hostedEvents.some(
      (e) => e.id === record.eventId
    );

    // Also allow the platform admin (store your Clerk userId as env var ADMIN_USER_ID)
    const isAdmin = userId === process.env.ADMIN_USER_ID;

    if (!isOrganiserOfEvent && !isAdmin) {
      return NextResponse.json({
        valid:   false,
        message: "You are not the organiser of this event.",
      });
    }

    // 4. Already checked in?
    if (record.checkedIn) {
      return NextResponse.json({
        valid:     false,
        alreadyUsed: true,
        message:   `Already checked in at ${new Date(record.checkedInAt!).toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" })}.`,
        attendee: {
          name:      record.attendeeName,
          email:     record.attendeeEmail,
          bookingRef: record.bookingRef,
          quantity:  record.quantity,
          eventTitle: record.eventTitle,
          checkedInAt: record.checkedInAt,
        },
      });
    }

    // 5. All good — mark as checked in
    const checkedInAt = new Date().toISOString();
    const updated: TokenRecord = { ...record, checkedIn: true, checkedInAt };
    await redisSet(`nene:ticket:token:${ticketToken}`, updated);

    return NextResponse.json({
      valid:   true,
      message: "✓ Valid ticket — entry granted!",
      attendee: {
        name:       record.attendeeName,
        email:      record.attendeeEmail,
        bookingRef: record.bookingRef,
        quantity:   record.quantity,
        eventTitle: record.eventTitle,
        checkedInAt,
      },
    });
  } catch (err) {
    console.error("POST /api/tickets/validate:", err);
    return NextResponse.json(
      { valid: false, message: "Server error. Please try again." },
      { status: 500 }
    );
  }
}
