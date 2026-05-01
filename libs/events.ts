export type Event = {
  id: string;
  title: string;
  date: string;
  location: string;
  price: string;
  image: string;
  category: string;
  aiTag: string;
};

export const DEFAULT_EVENTS: Event[] = [
  // ── Music ──────────────────────────────────────────────────────────────
  { id: "1",  title: "Safaricom Jazz Festival 2026",      date: "Jun 14, 2026", location: "Carnivore Grounds",       price: "KES 2,500", image: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=2070", category: "Music",     aiTag: "Selling Fast ⚡" },
  { id: "4",  title: "Blankets & Wine: The Return",       date: "Jul 12, 2026", location: "Laureate Gardens",        price: "KES 3,000", image: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=2070", category: "Music",     aiTag: "New Added ✨"   },
  { id: "7",  title: "Nairobi International Gospel Fest", date: "Aug 22, 2026", location: "KICC Grounds",            price: "Free Entry", image: "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?q=80&w=2070", category: "Music",     aiTag: "Free 🎵"        },

  // ── Sports ─────────────────────────────────────────────────────────────
  { id: "2",  title: "Gor Mahia vs AFC Leopards",         date: "Jun 21, 2026", location: "Kasarani Stadium",        price: "KES 500",   image: "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=1931", category: "Sports",    aiTag: "High Demand 🔥"  },
  { id: "5",  title: "WRC Safari Rally 2026",             date: "Aug 01, 2026", location: "Naivasha",                price: "KES 1,000", image: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=2070", category: "Sports",    aiTag: "Global Event 🌍" },
  { id: "8",  title: "Nairobi Marathon 2026",             date: "Sep 06, 2026", location: "Uhuru Park",              price: "KES 1,500", image: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=2070", category: "Sports",    aiTag: "Popular 🏃"      },

  // ── Business ───────────────────────────────────────────────────────────
  { id: "3",  title: "Nairobi Tech Week: AI Summit",      date: "Jul 05, 2026", location: "Sarit Centre",            price: "Free Entry", image: "https://images.unsplash.com/photo-1544531586-fde5298cdd40?q=80&w=2070", category: "Business",  aiTag: "Trending 📈"     },
  { id: "9",  title: "Africa Fintech Summit 2026",        date: "Sep 20, 2026", location: "Radisson Blu, Nairobi",   price: "KES 4,500", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070", category: "Business",  aiTag: "Must Attend 💼"  },

  // ── Arts ───────────────────────────────────────────────────────────────
  { id: "6",  title: "Modern Art Gallery Opening",        date: "Aug 15, 2026", location: "Nairobi Museum",          price: "KES 1,500", image: "https://images.unsplash.com/photo-1574169208507-84376144848b?q=80&w=2079", category: "Arts",      aiTag: "Exclusive 🎨"    },

  // ── Tech ───────────────────────────────────────────────────────────────
  { id: "10", title: "Kenya Developer Conference",        date: "Oct 03, 2026", location: "iHub, Nairobi",           price: "KES 500",   image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070", category: "Tech",      aiTag: "Nerdy 💻"        },

  // ── Nightlife ──────────────────────────────────────────────────────────
  { id: "11", title: "Afrobeats Night: Lagos Meets Nairobi", date: "Jun 28, 2026", location: "Alchemist Bar",        price: "KES 1,200", image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=2070", category: "Nightlife", aiTag: "Hot Night 🌙"    },
  { id: "12", title: "Rooftop Sundowner: Westlands",     date: "Jul 19, 2026", location: "Trademark Hotel",         price: "KES 800",   image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=2070", category: "Nightlife", aiTag: "Vibes Only ✨"   },
];
