import { NextRequest, NextResponse } from "next/server";

const visitMap = new Map<string, number[]>();
const WINDOW_MS = 5 * 60 * 1000;

function getActiveViewers(eventId: string): number {
  const now = Date.now();
  const visits = visitMap.get(eventId) ?? [];
  const active = visits.filter((t) => now - t < WINDOW_MS);
  visitMap.set(eventId, active);
  return active.length;
}

function recordVisit(eventId: string): void {
  const now = Date.now();
  const visits = visitMap.get(eventId) ?? [];
  visits.push(now);
  if (visits.length > 1000) visits.splice(0, visits.length - 1000);
  visitMap.set(eventId, visits);
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const count = getActiveViewers(params.id);
  return NextResponse.json({ count }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  recordVisit(params.id);
  const count = getActiveViewers(params.id);
  return NextResponse.json({ count }, { headers: { "Cache-Control": "no-store" } });
}
