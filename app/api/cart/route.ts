// app/api/cart/route.ts  (NEW FILE)
//
// POST  → saves abandoned-cart record to Redis + schedules a QStash reminder
//         for 1 hour later.  Called when the Paystack popup opens.
//
// DELETE ?id={cartId} → marks the cart completed so the reminder won't fire.
//         Called immediately after a successful payment.

import { NextResponse } from "next/server";

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
    if (typeof data === "string") data = JSON.parse(data);
    return data as T;
  } catch {
    return null;
  }
}

async function redisSet(key: string, value: unknown, exSeconds?: number): Promise<void> {
  const url   = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return;

  const cmd: unknown[] = ["SET", key, JSON.stringify(value)];
  if (exSeconds) cmd.push("EX", exSeconds);

  await fetch(`${url}/pipeline`, {
    method:  "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body:    JSON.stringify([cmd]),
  });
}

// ─── Cart key ─────────────────────────────────────────────────────────────────

function cartKey(cartId: string) {
  return `nene:cart:${cartId}`;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AbandonedCart {
  cartId:       string;
  email:        string;
  title:        string;
  type:         string;
  price:        number;   // unit ticket price (before booking fee)
  quantity:     number;
  date:         string;
  time:         string;
  location:     string;
  eventId:      string;
  savedAt:      string;
  completed:    boolean;
  reminderSent: boolean;
}

// ─── POST /api/cart  ──────────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const body = await req.json() as Partial<AbandonedCart>;
    const { cartId, email, title, type, price, quantity, date, time, location, eventId } = body;

    if (!cartId || !email || !title) {
      return NextResponse.json({ ok: false, error: "Missing required fields" });
    }

    const cart: AbandonedCart = {
      cartId,
      email,
      title:    title    ?? "",
      type:     type     ?? "Regular",
      price:    price    ?? 0,
      quantity: quantity ?? 1,
      date:     date     ?? "",
      time:     time     ?? "",
      location: location ?? "",
      eventId:  eventId  ?? "",
      savedAt:      new Date().toISOString(),
      completed:    false,
      reminderSent: false,
    };

    // Store in Redis with 48-hour expiry
    await redisSet(cartKey(cartId), cart, 172_800);

    // ── Schedule QStash reminder (1 hour delay) ───────────────────────────────
    const qstashToken = process.env.QSTASH_TOKEN;
    const baseUrl     = process.env.NEXT_PUBLIC_BASE_URL ?? "https://nenetickets.co.ke";

    if (qstashToken) {
      await fetch(
        `https://qstash.upstash.io/v2/publish/${encodeURIComponent(`${baseUrl}/api/cart/remind`)}`,
        {
          method:  "POST",
          headers: {
            Authorization:    `Bearer ${qstashToken}`,
            "Content-Type":   "application/json",
            "Upstash-Delay":  "3600s",  // 1 hour
            "Upstash-Retries": "2",
          },
          body: JSON.stringify({ cartId }),
        }
      ).catch((err) => console.error("QStash schedule failed:", err));
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("POST /api/cart:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

// ─── DELETE /api/cart?id={cartId}  ───────────────────────────────────────────
// Mark the cart as completed so the queued reminder is ignored.

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const cartId = searchParams.get("id");
    if (!cartId) return NextResponse.json({ ok: false });

    const existing = await redisGet<AbandonedCart>(cartKey(cartId));
    if (existing) {
      await redisSet(cartKey(cartId), { ...existing, completed: true }, 172_800);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/cart:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
