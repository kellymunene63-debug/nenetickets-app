"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "../../components/shared/Navbar";
import EventCard from "../../components/home/EventCard";
import Link from "next/link";
import { Filter, X, Search } from "lucide-react";

const DEFAULT_EVENTS = [
  { id: "1", title: "Safaricom Jazz Festival 2026", date: "Feb 14, 2026", location: "Carnivore Grounds", price: "KES 2,500", image: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=2070", category: "Music", aiTag: "Selling Fast ⚡" },
  { id: "2", title: "Gor Mahia vs AFC Leopards", date: "Feb 21, 2026", location: "Kasarani Stadium", price: "KES 500", image: "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=1931", category: "Sports", aiTag: "High Demand 🔥" },
  { id: "3", title: "Nairobi Tech Week: AI Summit", date: "Mar 05, 2026", location: "Sarit Centre", price: "Free Entry", image: "https://images.unsplash.com/photo-1544531586-fde5298cdd40?q=80&w=2070", category: "Business", aiTag: "Trending 📈" },
  { id: "4", title: "Blankets & Wine: The Return", date: "Mar 12, 2026", location: "Laureate Gardens", price: "KES 3,000", image: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=2070", category: "Music", aiTag: "New Added ✨" },
  { id: "5", title: "WRC Safari Rally 2026", date: "Apr 01, 2026", location: "Naivasha", price: "KES 1,000", image: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=2070", category: "Sports", aiTag: "Global Event 🌍" },
  { id: "6", title: "Modern Art Gallery Opening", date: "Apr 15, 2026", location: "Nairobi Museum", price: "KES 1,500", image: "https://images.unsplash.com/photo-1574169208507-84376144848b?q=80&w=2079", category: "Arts", aiTag: "Exclusive 🎨" },
];

const CATEGORIES = ["All", "Music", "Sports", "Business", "Arts", "Tech", "Nightlife"];

function EventsContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || "";
  const initialCategory = searchParams.get('category') || "All";

  const [allEvents, setAllEvents] = useState(DEFAULT_EVENTS);
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialSearch);

  useEffect(() => {
    const savedEvents = localStorage.getItem("nene_events");
    if (savedEvents) {
      const parsedEvents = JSON.parse(savedEvents);
      setAllEvents([...parsedEvents, ...DEFAULT_EVENTS]);
    }
  }, []);

  const filteredEvents = allEvents.filter(event => {
    const matchesCategory = activeCategory === "All" || event.category === activeCategory;
    const query = searchQuery.toLowerCase();
    const matchesSearch = event.title.toLowerCase().includes(query) || 
                          event.location.toLowerCase().includes(query);

    return matchesCategory && matchesSearch;
  });

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="container mx-auto px-4 pt-32 pb-8">
        <div className="flex items-center gap-2 mb-8 text-sm text-gray-500 font-bold uppercase tracking-wider">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <span>/</span>
            <span className="text-white">All Events</span>
        </div>
        
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 mb-10">
            <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">Discover Events</h1>
                <p className="text-gray-400 max-w-xl">Find the best concerts, matches, and conferences happening near you.</p>
            </div>

            <div className="w-full xl:w-1/3 relative group">
                <input 
                    type="text" 
                    placeholder="Search events, artists or venues..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/10 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-gray-400 outline-none focus:border-blue-500 focus:bg-black transition shadow-lg"
                />
                <Search className="w-5 h-5 text-gray-400 absolute left-4 top-4.5 group-focus-within:text-blue-500 transition" />
            </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-8 border-b border-white/10 pb-8">
            {CATEGORIES.map((cat) => (
                <button 
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-2 rounded-full text-sm font-bold border transition ${
                        activeCategory === cat 
                        ? "bg-white text-black border-white" 
                        : "bg-black text-gray-400 border-white/10 hover:border-white/30 hover:text-white"
                    }`}
                >
                    {cat}
                </button>
            ))}
        </div>

        {(activeCategory !== "All" || searchQuery) && (
            <div className="flex items-center gap-2 mb-8 text-sm text-blue-400">
                <Filter className="w-4 h-4" />
                <span>
                    Showing {filteredEvents.length} results 
                    {activeCategory !== "All" && <span> for <strong>{activeCategory}</strong></span>}
                    {searchQuery && <span> matching <strong>&quot;{searchQuery}&quot;</strong></span>}
                </span>
                <button 
                    onClick={() => {setActiveCategory("All"); setSearchQuery("");}} 
                    className="hover:text-white ml-2 underline decoration-dashed"
                >
                    Clear All
                </button>
            </div>
        )}

        <section className="pb-20">
            {filteredEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredEvents.map((event) => (
                        <EventCard key={event.id} event={event} />
                    ))}
                </div>
            ) : (
                <div className="py-24 text-center border border-white/10 rounded-3xl bg-white/5 flex flex-col items-center">
                    <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4 text-3xl">🔍</div>
                    <h3 className="text-xl font-bold mb-2">No events found</h3>
                    <p className="text-gray-400 mb-6 max-w-md">
                        We couldn&apos;t find any events matching <strong>&quot;{searchQuery}&quot;</strong> in {activeCategory}.
                    </p>
                    <button 
                        onClick={() => {setActiveCategory("All"); setSearchQuery("");}} 
                        className="bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition"
                    >
                        Clear Filters
                    </button>
                </div>
            )}
        </section>
      </div>
    </main>
  );
}

export default function AllEventsPage() {
  return <Suspense fallback={<div>Loading...</div>}><EventsContent /></Suspense>;
}
