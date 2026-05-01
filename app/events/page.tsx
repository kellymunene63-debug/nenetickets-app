import { Suspense } from "react";
import Navbar from "../../components/shared/Navbar";
import EventsClient from "../../components/events/EventsClient";

export const DEFAULT_EVENTS = [
  { id: "1", title: "Safaricom Jazz Festival 2026", date: "Jun 14, 2026", location: "Carnivore Grounds", price: "KES 2,500", image: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=2070", category: "Music", aiTag: "Selling Fast ⚡" },
  { id: "2", title: "Gor Mahia vs AFC Leopards", date: "Jun 21, 2026", location: "Kasarani Stadium", price: "KES 500", image: "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=1931", category: "Sports", aiTag: "High Demand 🔥" },
  { id: "3", title: "Nairobi Tech Week: AI Summit", date: "Jul 05, 2026", location: "Sarit Centre", price: "Free Entry", image: "https://images.unsplash.com/photo-1544531586-fde5298cdd40?q=80&w=2070", category: "Business", aiTag: "Trending 📈" },
  { id: "4", title: "Blankets & Wine: The Return", date: "Jul 12, 2026", location: "Laureate Gardens", price: "KES 3,000", image: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=2070", category: "Music", aiTag: "New Added ✨" },
  { id: "5", title: "WRC Safari Rally 2026", date: "Aug 01, 2026", location: "Naivasha", price: "KES 1,000", image: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=2070", category: "Sports", aiTag: "Global Event 🌍" },
  { id: "6", title: "Modern Art Gallery Opening", date: "Aug 15, 2026", location: "Nairobi Museum", price: "KES 1,500", image: "https://images.unsplash.com/photo-1574169208507-84376144848b?q=80&w=2079", category: "Arts", aiTag: "Exclusive 🎨" },
];

export const metadata = {
  title: "Browse Events | NeneTickets",
  description: "Discover and book tickets for the best concerts, sports matches, and conferences in Kenya.",
};

function EventsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[1,2,3,4,5,6].map(i => (
        <div key={i} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden animate-pulse">
          <div className="h-48 bg-white/10" />
          <div className="p-5 space-y-3">
            <div className="h-3 bg-white/10 rounded w-1/4" />
            <div className="h-5 bg-white/10 rounded w-3/4" />
            <div className="h-3 bg-white/10 rounded w-1/2" />
            <div className="h-3 bg-white/10 rounded w-1/3" />
            <div className="h-10 bg-white/10 rounded-lg mt-4" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AllEventsPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      <Suspense fallback={
        <div className="container mx-auto px-4 pt-32 pb-20">
          <div className="h-8 bg-white/10 rounded w-48 mb-10 animate-pulse" />
          <EventsSkeleton />
        </div>
      }>
        <EventsClient defaultEvents={DEFAULT_EVENTS} />
      </Suspense>
    </main>
  );
}
