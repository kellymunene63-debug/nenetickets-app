// app/api/host/sales/route.ts  (NEW FILE)
// Returns all sold tickets that match a list of event titles.
// The host dashboard calls this to get real Redis data instead of reading
// from the buyer's localStorage (which only exists on the buyer's device).
//
// GET /api/host/sales?eventTitles=Title+One,Title+Two
// Returns: SoldTicket[]

import { NextResponse } from "next/server";

export const runtime = "edge";
export const dynamic = "force-dynamic";

// ─── Redis helpers ────────────────────────────────────────────────────────────

const kvUrl   = () => process.env.KV_REST_API_URL   ?? "";
const kvToken = () => process.env.KV_REST_API_TOKEN ?? "";

/** Generic Redis GET — handles double-JSON-encoding from Upstash. */
async function redisGet<T>(key: string): Promise<T | null> {
  const url   = kvUrl();
  const token = kvToken();
  if (!url || !token) return null;

  try {
    const res  = await fetch(`${url}/get/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache:   "no-store",
    });
    if (!res.ok) return null;

    const json = await res.json() as { result: unknown };
    if (json.result === null || json.result === undefined) return null;

    let data: unknown = json.result;
    if (typeof data === "string") data = JSON.parse(data);
    if (typeof data === "string") data = JSON.parse(data); // double-encode fallback
    return data as T;
  } catch {
    return null;
  }
}

/**
 * Redis KEYS — returns all keys matching a glob pattern.
 * Upstash REST format: GET /keys/{pattern}
 */
async function redisKeys(pattern: string): Promise<string[]> {
  const url   = kvUrl();
  const token = kvToken();
  if (!url || !token) return [];

  try {
    const res  = await fetch(`${url}/keys/${encodeURIComponent(pattern)}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache:   "no-store",
    });
    if (!res.ok) return [];

    const json = await res.json() as { result: string[] | null };
    return json.result ?? [];
  } catch {
    return [];
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface TicketRecord {
  id:           string;
  title:        string;
  eventTitle?:  string;
  type:         string;
  price:        number;
  quantity:     number;
  date?:        string;
  time?:        string;
  location?:    string;
  image?:       string;
  purchasedAt:  string;
  reference:    string;
  ticketToken?: string;
  phone?:       string;
  email?:       string;
  checkedIn?:   boolean;
  checkedInAt?: string | null;
}

// ─── GET /api/host/sales ──────────────────────────────────────────────────────

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const titlesParam = searchParams.get("eventTitles") ?? "";

    // Build a Set of lowercase title strings for fast matching
    const titleSet = new Set(
      titlesParam
        .split(",")
        .map((t) => decodeURIComponent(t).trim().toLowerCase())
        .filter(Boolean)
    );

    if (titleSet.size === 0) {
      return NextResponse.json([]);
    }

    // ── 1. Get all user ticket keys ──────────────────────────────────────────
    const keys = await redisKeys("nene:tickets:*");

    if (keys.length === 0) {
      return NextResponse.json([]);
    }

    // ── 2. Fetch each user's tickets in batches of 10 ───────────────────────
    const results: TicketRecord[] = [];
    const BATCH = 10;

    for (let i = 0; i < keys.length; i += BATCH) {
      const batch = keys.slice(i, i + BATCH);

      await Promise.all(
        batch.map(async (key) => {
          const tickets = await redisGet<TicketRecord[]>(key);
          if (!Array.isArray(tickets)) return;

          for (const ticket of tickets) {
            const ticketTitle = (ticket.title ?? ticket.eventTitle ?? "").toLowerCase();
            if (titleSet.has(ticketTitle)) {
              results.push(ticket);
            }
          }
        })
      );
    }

    // Sort newest first
    results.sort(
      (a, b) => new Date(b.purchasedAt).getTime() - new Date(a.purchasedAt).getTime()
    );

    return NextResponse.json(results);
  } catch (err) {
    console.error("GET /api/host/sales:", err);
    return NextResponse.json([], { status: 500 });
  }
}
