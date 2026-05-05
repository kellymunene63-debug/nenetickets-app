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

// ── Static demo events ────────────────────────────────────────────────────────
const EVENTS_DB: Record<string, Omit<EventData, "id">> = {
  "1":  { title: "Safaricom Jazz Festival 2026",        image: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=2070", date: "Jun 14, 2026", time: "6:00 PM",  location: "Carnivore Grounds",     basePrice: 2500, baseVipPrice: 8000,  description: "Experience the magic of jazz under the Nairobi sky. Featuring world-renowned artists and local legends performing across three stages. Gates open at 4 PM — arrive early for the best spots.", category: "Music",    tag: "SELLING FAST"  },
  "2":  { title: "Gor Mahia vs AFC Leopards",           image: "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=1931", date: "Jun 21, 2026", time: "3:00 PM",  location: "Kasarani Stadium",      basePrice: 500,  baseVipPrice: 2000,  description: "The biggest derby in Kenya — the Mashemeji Derby! Watch Gor Mahia and AFC Leopards clash for bragging rights at a packed Kasarani. Bring your colours and your voice.", category: "Sports",   tag: "HIGH DEMAND"   },
  "3":  { title: "Nairobi Tech Week: AI Summit",        image: "https://images.unsplash.com/photo-1544531586-fde5298cdd40?q=80&w=2070", date: "Jul 05, 2026", time: "9:00 AM",  location: "Sarit Centre",          basePrice: 0,    baseVipPrice: 1500,  description: "Join the leading minds in African tech. Keynotes from Google, Microsoft, and NeneLabs on the future of AI in Africa. Networking sessions, workshops, and live demos all day.", category: "Business", tag: "TRENDING"      },
  "4":  { title: "Blankets & Wine: The Return",         image: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=2070", date: "Jul 12, 2026", time: "12:00 PM", location: "Laureate Gardens",      basePrice: 3000, baseVipPrice: 9000,  description: "Kenya's most iconic outdoor music experience is back. Lay out your blanket, pour a glass, and let the music carry you through an afternoon of soulful performances.", category: "Music",    tag: "NEW ADDED"     },
  "5":  { title: "WRC Safari Rally 2026",               image: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=2070", date: "Aug 01, 2026", time: "8:00 AM",  location: "Naivasha",              basePrice: 1000, baseVipPrice: 5000,  description: "The world's fastest rally drivers tackle Kenya's iconic terrain. Thrilling stages, spectacular jumps, and the smell of red dust in the Naivasha air.", category: "Sports",   tag: "GLOBAL EVENT"  },
  "6":  { title: "Modern Art Gallery Opening",          image: "https://images.unsplash.com/photo-1574169208507-84376144848b?q=80&w=2079", date: "Aug 15, 2026", time: "5:00 PM",  location: "Nairobi Museum",        basePrice: 1500, baseVipPrice: 4000,  description: "An exclusive evening celebrating East Africa's most exciting contemporary artists. Private gallery walk, artist talks, curated refreshments, and a live performance.", category: "Arts",     tag: "EXCLUSIVE"     },
  "7":  { title: "Nairobi International Gospel Fest",   image: "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?q=80&w=2070", date: "Aug 22, 2026", time: "4:00 PM",  location: "KICC Grounds",          basePrice: 0,    baseVipPrice: 2000,  description: "A powerful celebration of faith and music featuring Kenya's top gospel artists alongside international acts. Thousands gather annually for an evening of worship, praise, and community.", category: "Music",    tag: "FREE ENTRY"    },
  "8":  { title: "Nairobi Marathon 2026",               image: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=2070", date: "Sep 06, 2026", time: "6:00 AM",  location: "Uhuru Park",            basePrice: 1500, baseVipPrice: 4000,  description: "Kenya's premier road race through the heart of Nairobi. Choose from 5K, 10K, 21K, or full marathon distances. All proceeds support youth athletics programmes.", category: "Sports",   tag: "POPULAR"       },
  "9":  { title: "Africa Fintech Summit 2026",          image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070", date: "Sep 20, 2026", time: "8:30 AM",  location: "Radisson Blu, Nairobi", basePrice: 4500, baseVipPrice: 12000, description: "Africa's premier fintech conference. Two days of panels, investor pitches, and workshops covering mobile money, DeFi, insurance tech, and regulatory frameworks.", category: "Business", tag: "MUST ATTEND"   },
  "10": { title: "Kenya Developer Conference",          image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070", date: "Oct 03, 2026", time: "9:00 AM",  location: "iHub, Nairobi",         basePrice: 500,  baseVipPrice: 2500,  description: "A full day of talks, workshops, and networking for Kenya's developer community. Topics span AI/ML, cloud architecture, mobile development, and open source.", category: "Tech",     tag: "TRENDING"      },
  "11": { title: "Afrobeats Night: Lagos Meets Nairobi",image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=2070", date: "Jun 28, 2026", time: "9:00 PM",  location: "Alchemist Bar",         basePrice: 1200, baseVipPrice: 3500,  description: "A night where West African and East African rhythms collide. Nairobi's best Afrobeats DJs alongside a live guest performance from Lagos.", category: "Nightlife", tag: "HOT NIGHT"    },
  "12": { title: "Rooftop Sundowner: Westlands",        image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=2070", date: "Jul 19, 2026", time: "5:30 PM",  location: "Trademark Hotel",       basePrice: 800,  baseVipPrice: 2000,  description: "Nairobi's most scenic rooftop party. Watch the sun set over the Westlands skyline with a cocktail in hand. Live acoustic set, curated DJ playlist, and a pop-up bar with exclusive craft cocktails.", category: "Nightlife", tag: "VIBES ONLY"   },
};

const STATIC_IDS = new Set(Object.keys(EVENTS_DB));

// ── Redis helper — with built-in timeout and error handling ───────────────────
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
  // Top-level catch: server component must NEVER throw — any uncaught error
  // would cause React error #419 (hydration crash) on the client.
  try {
    return await renderEventPage(params.id);
  } catch (err) {
    console.error("[EventPage] Unexpected crash for id", params.id, err);
    return <NotFound />;
  }
}

async function renderEventPage(id: string) {
  // ── Fast path: static events — zero Redis calls ───────────────────────────
  if (STATIC_IDS.has(id)) {
    const raw = EVENTS_DB[id];
    if (!raw) return <NotFound />;

    const event: EventData = { ...raw, id };

    // Build recommendations purely from other static events (no Redis needed)
    const others = Object.entries(EVENTS_DB)
      .filter(([eid]) => eid !== id)
      .map(([eid, e]) => ({ id: eid, ...e } as EventData));
    const recommendations = [
      ...others.filter((e) => e.category === event.category),
      ...others.filter((e) => e.category !== event.category),
    ].slice(0, 3);

    return (
      <EventPageClient
        event={event}
        capacityData={{}}
        recommendations={recommendations}
        eventId={id}
      />
    );
  }

  // ── Hosted events: fetch from Redis ──────────────────────────────────────
  const rawHosted = await redisGet<unknown>("nene:events");
const allHosted: RawEvent[] = Array.isArray(rawHosted) ? rawHosted : [];
  const hostedRaw = allHosted.find((e) => e.id === id) ?? null;

  if (!hostedRaw) return <NotFound />;

  const event = normaliseEvent(hostedRaw);

  // Capacity for hosted events
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

  // Recommendations: static events + other hosted events
  const staticEntries = Object.entries(EVENTS_DB)
    .map(([eid, e]) => ({ id: eid, ...e } as EventData));
  const hostedEntries = allHosted
    .filter((e) => e.id !== id && !e.cancelled)
    .map((e) => normaliseEvent(e));
  const allOther = [...staticEntries, ...hostedEntries];
  const recommendations = [
    ...allOther.filter((e) => e.category === event.category),
    ...allOther.filter((e) => e.category !== event.category),
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
