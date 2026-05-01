"use client";

import Navbar from "../components/shared/Navbar";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, TrendingUp, Music, Trophy, Briefcase } from "lucide-react";
import Link from "next/link";
import EventCard from "../components/home/EventCard";

// Mock Data for "Trending" section
const TRENDING_EVENTS = [
  { id: "1", title: "Safaricom Jazz Festival 2026", date: "Feb 14, 2026", location: "Carnivore Grounds", price: "KES 2,500", image: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=2070", category: "Music", aiTag: "Selling Fast ⚡" },
  { id: "2", title: "Gor Mahia vs AFC Leopards", date: "Feb 21, 2026", location: "Kasarani Stadium", price: "KES 500", image: "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=1931", category: "Sports", aiTag: "High Demand 🔥" },
  { id: "3", title: "Nairobi Tech Week: AI Summit", date: "Mar 05, 2026", location: "Sarit Centre", price: "Free Entry", image: "https://images.unsplash.com/photo-1544531586-fde5298cdd40?q=80&w=2070", category: "Business", aiTag: "Trending 📈" },
];

export default function Home() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearch = (e?: any) => {
    if (e) e.preventDefault();
    if (query.trim()) {
      router.push(`/events?search=${encodeURIComponent(query)}`);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white selection:bg-blue-500 selection:text-white">
      <Navbar />
      
      {/* HERO SECTION UPDATED */}
      {/* Added 'pt-24' to push content down below the fixed navbar */}
      <div className="relative min-h-[85vh] flex items-center justify-center overflow-hidden pt-24">
        
        {/* Dynamic Background */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070')] bg-cover bg-center opacity-40 animate-pulse-slow"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black"></div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 backdrop-blur-md mb-6 animate-fade-in-up">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-sm font-medium text-gray-300">Live in Nairobi</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight tracking-tight">
                Experience the <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Extraordinary.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
                Discover and book the hottest concerts, sports matches, and tech conferences happening in Kenya.
            </p>

            {/* SEARCH BAR */}
            <form onSubmit={handleSearch} className="relative max-w-xl mx-auto group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur opacity-25 group-hover:opacity-40 transition duration-500"></div>
                <div className="relative flex items-center bg-white/10 backdrop-blur-xl border border-white/10 rounded-full p-2 pl-6 transition-all focus-within:bg-black/80 focus-within:border-blue-500/50">
                    <Search className="w-5 h-5 text-gray-400 mr-3" />
                    <input 
                        type="text" 
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search events, artists, or venues..." 
                        className="bg-transparent border-none outline-none text-white w-full placeholder-gray-500 h-10"
                    />
                    <button 
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 py-2.5 font-bold text-sm transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2"
                    >
                        Find <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </form>

            {/* Quick Categories */}
            <div className="flex justify-center gap-4 mt-8 text-sm font-bold text-gray-400">
                <Link href="/events?category=Music" className="hover:text-white flex items-center gap-2 transition"><Music className="w-4 h-4" /> Music</Link>
                <Link href="/events?category=Sports" className="hover:text-white flex items-center gap-2 transition"><Trophy className="w-4 h-4" /> Sports</Link>
                <Link href="/events?category=Business" className="hover:text-white flex items-center gap-2 transition"><Briefcase className="w-4 h-4" /> Business</Link>
            </div>
          {/* Payment Trust Strip */}
<div className="flex justify-center items-center gap-3 mt-8 flex-wrap">
  <span className="text-xs text-gray-500 uppercase tracking-widest font-bold">Secure payments via</span>
  
  <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
    <div className="w-5 h-5 bg-[#00A651] rounded-full flex items-center justify-center">
      <span className="text-white text-[8px] font-black">M</span>
    </div>
    <span className="text-white text-xs font-bold">M-Pesa</span>
  </div>

  <div className="flex items-center bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
    <span className="bg-[#1A1F71] text-white px-1.5 py-0.5 rounded text-[10px] font-black italic tracking-wider">VISA</span>
  </div>

  <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
    <div className="flex -space-x-1.5">
      <div className="w-4 h-4 rounded-full bg-[#EB001B]"></div>
      <div className="w-4 h-4 rounded-full bg-[#F79E1B]"></div>
    </div>
    <span className="text-white text-xs font-bold ml-1">Mastercard</span>
  </div>

  <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
    <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
    </svg>
    <span className="text-green-400 text-xs font-bold">SSL Secured</span>
  </div>
</div>
        </div>
      </div>

      {/* TRENDING SECTION */}
      <section className="container mx-auto px-4 py-20">
        <div className="flex items-end justify-between mb-10">
            <div>
                <h2 className="text-3xl font-bold flex items-center gap-2 mb-2">
                    <TrendingUp className="w-6 h-6 text-blue-500" /> Trending Now
                </h2>
                <p className="text-gray-400">Events selling out fast in Nairobi.</p>
            </div>
            <Link href="/events">
                <button className="hidden md:flex items-center gap-2 text-blue-400 font-bold hover:text-blue-300 transition">
                    View All <ArrowRight className="w-4 h-4" />
                </button>
            </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {TRENDING_EVENTS.map((event) => (
                <EventCard key={event.id} event={event} />
            ))}
        </div>
        
        <div className="mt-12 text-center md:hidden">
             <Link href="/events">
                <button className="bg-white/10 border border-white/10 text-white px-8 py-3 rounded-xl font-bold w-full">View All Events</button>
            </Link>
        </div>
      </section>
    </main>
  );
}
