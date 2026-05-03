import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export const runtime = "edge";
export const dynamic = "force-dynamic";

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

function ticketKey(userId: string) {
  return `nene:tickets:${userId}`;
}

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

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ success: false }, { status: 401 });

    const ticket  = await req.json();
    const key     = ticketKey(userId);
    const tickets = await redisGet<object[]>(key) ?? [];
    tickets.unshift(ticket);
    await redisSet(key, tickets);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("POST /api/tickets:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
