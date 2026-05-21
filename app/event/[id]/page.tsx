import EventPageClient from "../../../components/event/EventPageClient";
export const dynamic = "force-dynamic";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface TicketType { name: string; price: string; capacity: string; }

export interface EventData {
  id: string;
  title: string; image: string; date: string; time: string;
  location: string; description: string; category: string; tag: string;
  basePrice: number; baseVipPrice: number;
  ticketTypes?: { name: string; price: number }[];
  cancelled?: boolean; cancelReason?: string;
}

export type CapacityData = Record<string, {
  sold: number; capacity: number; available: number; soldOut: boolean;
}>;

// ── Redis helper ──────────────────────────────────────────────────────────────

async function redisGet<T>(key: string): Promise<T | null> {
  try {
    const url   = process.env.KV_REST_API_URL;
    const token = process.env.KV_REST_API_TOKEN;
    if (!url || !token) return null;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`${url}/get/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal: controller.signal,
    });
    clearTimeout(timer);
    const json = await res.json() as { result: unknown };
    if (json.result === null || json.result === undefined) return null;
    let data: unknown = json.result;
    if (typeof data === "string") data = JSON.parse(data);
    if (typeof data === "string") data = JSON.parse(data);
    return data as T;
  } catch {
    return null;
  }
}

// ── Normalise a Redis-hosted event into EventData ─────────────────────────────

type RawEvent = {
  id: string; title: string; description?: string; date: string; time?: string;
  location: string; image: string; category: string; aiTag?: string;
  cancelled?: boolean; cancelReason?: string;
  tickets?: { name: string; price: string; capacity?: string }[];
};

function normaliseEvent(raw: RawEvent): EventData {
  const ticketTypes = (raw.tickets ?? []).map((t) => ({
    name: t.name, price: parseInt(t.price) || 0,
  }));
  const prices = ticketTypes.map((t) => t.price);
  return {
    id:           raw.id,
    title:        raw.title,
    image:        raw.image,
    date:         raw.date,
    time:         raw.time ?? "",
    location:     raw.location,
    description:  raw.description ?? "",
    category:     raw.category,
    tag:          raw.aiTag ?? "NEW",
    basePrice:    prices[0] ?? 0,
    baseVipPrice: prices[1] ?? prices[0] ?? 0,
    ticketTypes:  ticketTypes.length > 0 ? ticketTypes : undefined,
    cancelled:    raw.cancelled,
    cancelReason: raw.cancelReason,
  };
}

// ── Not-found fallback ────────────────────────────────────────────────────────

function NotFound() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center flex-col gap-4 pt-20">
      <div className="text-center">
        <div className="text-5xl mb-4">🎟</div>
        <h2 className="text-2xl font-bold mb-2">Event not found</h2>
        <p className="text-gray-500 text-sm mb-6">
          This event may have been removed or doesn&apos;t exist.
        </p>
        <a href="/events" className="text-blue-400 hover:underline font-bold">
          Browse all events
        </a>
      </div>
    </main>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function EventPage({ params }: { params: { id: string } }) {
  try {
    return await renderEventPage(params.id);
  } catch (err) {
    console.error("[EventPage] Unexpected crash for id", params.id, err);
    return <NotFound />;
  }
}

async function renderEventPage(id: string) {
  const rawHosted = await redisGet<unknown>("nene:events");
  const allHosted: RawEvent[] = Array.isArray(rawHosted) ? rawHosted : [];

  const hostedRaw = allHosted.find((e) => e.id === id) ?? null;
  if (!hostedRaw) return <NotFound />;

  const event = normaliseEvent(hostedRaw);

  // ── Capacity ──────────────────────────────────────────────────────────────

  let capacityData: CapacityData = {};
  if (hostedRaw.tickets && hostedRaw.tickets.length > 0) {
    const soldCounts = await redisGet<Record<string, number>>(`nene:sold:${id}`) ?? {};
    for (const t of hostedRaw.tickets) {
      const cap  = parseInt(t.capacity ?? "0") || 0;
      const sold = soldCounts[t.name] ?? 0;
      capacityData[t.name] = {
        sold,
        capacity:  cap,
        available: Math.max(0, cap - sold),
        soldOut:   cap > 0 && sold >= cap,
      };
    }
  }

  // ── Recommendations: only real hosted events ──────────────────────────────

  const otherHosted = allHosted
    .filter((e) => e.id !== id && !e.cancelled && e.status === "approved")
    .map((e) => normaliseEvent(e));

  const recommendations = [
    ...otherHosted.filter((e) => e.category === event.category),
    ...otherHosted.filter((e) => e.category !== event.category),
  ].slice(0, 3);

  return (
    <EventPageClient
      event={event}
      capacityData={capacityData}
      recommendations={recommendations}
      eventId={id}
    />
  );
}
