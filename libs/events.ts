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
  { id: "1", title: "Safaricom Jazz Festival 2026", date: "Jun 14, 2026", location: "Carnivore Grounds", price: "KES 2,500", image: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=2070", category: "Music", aiTag: "Selling Fast ⚡" },
  { id: "2", title: "Gor Mahia vs AFC Leopards", date: "Jun 21, 2026", location: "Kasarani Stadium", price: "KES 500", image: "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=1931", category: "Sports", aiTag: "High Demand 🔥" },
  { id: "3", title: "Nairobi Tech Week: AI Summit", date: "Jul 05, 2026", location: "Sarit Centre", price: "Free Entry", image: "https://images.unsplash.com/photo-1544531586-fde5298cdd40?q=80&w=2070", category: "Business", aiTag: "Trending 📈" },
  { id: "4", title: "Blankets & Wine: The Return", date: "Jul 12, 2026", location: "Laureate Gardens", price: "KES 3,000", image: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=2070", category: "Music", aiTag: "New Added ✨" },
  { id: "5", title: "WRC Safari Rally 2026", date: "Aug 01, 2026", location: "Naivasha", price: "KES 1,000", image: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=2070", category: "Sports", aiTag: "Global Event 🌍" },
  { id: "6", title: "Modern Art Gallery Opening", date: "Aug 15, 2026", location: "Nairobi Museum", price: "KES 1,500", image: "https://images.unsplash.com/photo-1574169208507-84376144848b?q=80&w=2079", category: "Arts", aiTag: "Exclusive 🎨" },
];
