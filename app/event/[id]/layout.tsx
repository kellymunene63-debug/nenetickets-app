import { Metadata } from "next";

// Static event data for OG metadata (mirrors EVENTS_DB in page.tsx)
const STATIC_EVENTS: Record<string, { title: string; description: string; image: string; date: string; location: string }> = {
  "1":  { title: "Safaricom Jazz Festival 2026",      description: "Experience the magic of jazz under the Nairobi sky. Featuring world-renowned artists and local legends performing across three stages.",          image: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=2070", date: "Jun 14, 2026", location: "Carnivore Grounds" },
  "2":  { title: "Gor Mahia vs AFC Leopards",          description: "The biggest derby in Kenya — the Mashemeji Derby! Watch Gor Mahia and AFC Leopards clash for bragging rights at a packed Kasarani.",             image: "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=1931", date: "Jun 21, 2026", location: "Kasarani Stadium" },
  "3":  { title: "Nairobi Tech Week: AI Summit",       description: "Join the leading minds in African tech. Keynotes from Google, Microsoft, and NeneLabs on the future of AI in Africa.",                          image: "https://images.unsplash.com/photo-1544531586-fde5298cdd40?q=80&w=2070", date: "Jul 05, 2026", location: "Sarit Centre" },
  "4":  { title: "Blankets & Wine: The Return",        description: "Kenya's most iconic outdoor music experience is back. Lay out your blanket, pour a glass, and let the music carry you.",                         image: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=2070", date: "Jul 12, 2026", location: "Laureate Gardens" },
  "5":  { title: "WRC Safari Rally 2026",              description: "The world's fastest rally drivers tackle Kenya's iconic terrain. Watch the WRC Safari Rally live — thrilling stages and spectacular jumps.",      image: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=2070", date: "Aug 01, 2026", location: "Naivasha" },
  "6":  { title: "Modern Art Gallery Opening",         description: "An exclusive evening celebrating East Africa's most exciting contemporary artists. Private gallery walk, artist talks, and curated refreshments.", image: "https://images.unsplash.com/photo-1574169208507-84376144848b?q=80&w=2079", date: "Aug 15, 2026", location: "Nairobi Museum" },
  "7":  { title: "Nairobi International Gospel Fest",  description: "A powerful celebration of faith and music featuring Kenya's top gospel artists alongside international acts at KICC Grounds.",                    image: "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?q=80&w=2070", date: "Aug 22, 2026", location: "KICC Grounds" },
  "8":  { title: "Nairobi Marathon 2026",              description: "Kenya's premier road race through the heart of Nairobi. Choose from 5K, 10K, 21K, or full marathon distances.",                                  image: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=2070", date: "Sep 06, 2026", location: "Uhuru Park" },
  "9":  { title: "Africa Fintech Summit 2026",         description: "Africa's premier fintech conference. Two days of panels, investor pitches, and workshops covering mobile money, DeFi, and insurance tech.",      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070", date: "Sep 20, 2026", location: "Radisson Blu, Nairobi" },
  "10": { title: "Kenya Developer Conference",         description: "A full day of talks, workshops, and networking for Kenya's developer community spanning AI/ML, cloud architecture, and open source.",             image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070", date: "Oct 03, 2026", location: "iHub, Nairobi" },
  "11": { title: "Afrobeats Night: Lagos Meets Nairobi", description: "A night where West African and East African rhythms collide. Nairobi's best Afrobeats DJs alongside a live guest performance from Lagos.",    image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=2070", date: "Jun 28, 2026", location: "Alchemist Bar" },
  "12": { title: "Rooftop Sundowner: Westlands",       description: "Nairobi's most scenic rooftop party. Watch the sun set over the Westlands skyline with a cocktail in hand. Live acoustic set and curated DJ.",   image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=2070", date: "Jul 19, 2026", location: "Trademark Hotel" },
};

function buildMetadata(event: {
  title: string;
  description?: string;
  image: string;
  date: string;
  location: string;
}): Metadata {
  const description =
    event.description ||
    `Get tickets for ${event.title} on ${event.date} at ${event.location}. Book now on NeneTickets.`;

  return {
    title: event.title,
    description,
    openGraph: {
      title: `${event.title} | NeneTickets`,
      description,
      images: [
        {
          url: event.image,
          width: 1200,
          height: 630,
          alt: event.title,
        },
      ],
      type: "website",
      siteName: "NeneTickets",
      url: `https://nenetickets.co.ke`,
    },
    twitter: {
      card: "summary_large_image",
      title: `${event.title} | NeneTickets`,
      description,
      images: [event.image],
    },
  };
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  // Static events — no fetch needed
  const staticEvent = STATIC_EVENTS[params.id];
  if (staticEvent) return buildMetadata(staticEvent);

  // Hosted events — fetch from Redis via API
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://nenetickets.co.ke";
    const res = await fetch(`${baseUrl}/api/events/${params.id}`, {
      cache: "no-store",
    });
    if (res.ok) {
      const event = await res.json();
      if (event) return buildMetadata(event);
    }
  } catch {
    /* silent — fall through to default */
  }

  return {
    title: "Event | NeneTickets",
    description: "Discover and book events in Kenya on NeneTickets.",
  };
}

export default function EventLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
