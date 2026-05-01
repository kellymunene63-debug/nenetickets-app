"use client";

import Navbar from "../components/shared/Navbar";
import Footer from "../components/shared/Footer";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search, ArrowRight, TrendingUp, Music, Trophy, Briefcase,
  Ticket, CreditCard, Smartphone, Star, CheckCircle, Zap, Shield,
  Calendar, MapPin, ChevronRight
} from "lucide-react";
import Link from "next/link";
import EventCard from "../components/home/EventCard";
import { SignedIn } from "@clerk/nextjs";

const TRENDING_EVENTS = [
  { id: "1", title: "Safaricom Jazz Festival 2026", date: "Jun 14, 2026", location: "Carnivore Grounds", price: "KES 2,500", image: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=2070", category: "Music", aiTag: "Selling Fast ⚡" },
  { id: "2", title: "Gor Mahia vs AFC Leopards", date: "Jun 21, 2026", location: "Kasarani Stadium", price: "KES 500", image: "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=1931", category: "Sports", aiTag: "High Demand 🔥" },
  { id: "3", title: "Nairobi Tech Week: AI Summit", date: "Jul 05, 2026", location: "Sarit Centre", price: "Free Entry", image: "https://images.unsplash.com/photo-1544531586-fde5298cdd40?q=80&w=2070", category: "Business", aiTag: "Trending 📈" },
];

const STATS = [
  { value: "12,000+", label: "Tickets Sold", icon: Ticket },
  { value: "80+",     label: "Events Listed", icon: Star },
  { value: "60s",     label: "Avg. Checkout Time", icon: Zap },
  { value: "100%",    label: "Secure Payments", icon: Shield },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    icon: Search,
    title: "Find Your Event",
    description: "Browse concerts, sports matches, and conferences across Kenya. Filter by category or search by artist, team, or venue.",
    detail: "Updated daily",
    color: "blue",
  },
  {
    step: "02",
    icon: Smartphone,
    title: "Pay with M-Pesa",
    description: "Enter your Safaricom number, confirm the STK push prompt on your phone, and your payment is done in under 60 seconds.",
    detail: "No card needed",
    color: "green",
  },
  {
    step: "03",
    icon: Ticket,
    title: "Get Your Digital Ticket",
    description: "A unique QR-coded ticket is generated instantly. It lives in your NeneTickets account — no printing, no fuss.",
    detail: "Instant delivery",
    color: "purple",
  },
  {
    step: "04",
    icon: Star,
    title: "Attend & Earn Coins",
    description: "Scan your QR code at the gate and walk straight in. Every purchase earns NeneCoins — redeem them for discounts on your next event.",
    detail: "Loyalty rewards",
    color: "yellow",
  },
];

const COLOR_MAP: Record<string, { bg: string; text: string; border: string; stepBg: string }> = {
  blue:   { bg: "bg-blue-500/10",   text: "text-blue-400",   border: "border-blue-500/20",   stepBg: "bg-blue-500/20" },
  green:  { bg: "bg-green-500/10",  text: "text-green-400",  border: "border-green-500/20",  stepBg: "bg-green-500/20" },
  purple: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/20", stepBg: "bg-purple-500/20" },
  yellow: { bg: "bg-yellow-500/10", text: "text-yellow-400", border: "border-yellow-500/20", stepBg: "bg-yellow-500/20" },
};

const TESTIMONIALS = [
  { name: "Amina W.", role: "Event Attendee", quote: "Paid with M-Pesa and got my ticket in seconds. Super smooth!", avatar: "AW" },
  { name: "Brian O.", role: "Event Organizer", quote: "Created my event in under 5 minutes. Sales started rolling in immediately.", avatar: "BO" },
  { name: "Faith K.", role: "Sports Fan", quote: "Booked Gor Mahia tickets from my phone during my lunch break. NeneTickets is the move.", avatar: "FK" },
];

interface StoredTicket {
  id: string;
  title: string;
  type: string;
  date: string;
  time: string;
  location: string;
  image: string;
}

export default function Home() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [upcomingTickets, setUpcomingTickets] = useState<StoredTicket[]>([]);

  useEffect(() => {
    try {
      const all: StoredTicket[] = JSON.parse(localStorage.getItem("nene_sold_tickets") ?? "[]");
      const now = new Date();
      const upcoming = all
        .filter((t) => new Date(t.date) >= now)
        .slice(0, 3);
      setUpcomingTickets(upcoming);
    } catch {
      setUpcomingTickets([]);
    }
  }, []);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (query.trim()) router.push(`/events?search=${encodeURIComponent(query)}`);
  };

  return (
    <main className="min-h-screen bg-black text-white selection:bg-blue-500 selection:text-white">
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <div className="relative min-h-[85vh] flex items-center justify-center overflow-hidden pt-24">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070')] bg-cover bg-center opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black" />

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 backdrop-blur-md mb-6">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium text-gray-300">Live in Nairobi</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight tracking-tight">
            Experience the <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Extraordinary.</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Discover and book the hottest concerts, sports matches, and tech conferences in Kenya — paid instantly via M-Pesa.
          </p>

          <form onSubmit={handleSearch} className="relative max-w-xl mx-auto group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur opacity-25 group-hover:opacity-40 transition duration-500" />
            <div className="relative flex items-center bg-white/10 backdrop-blur-xl border border-white/10 rounded-full p-2 pl-6 focus-within:bg-black/80 focus-within:border-blue-500/50 transition-all">
              <Search className="w-5 h-5 text-gray-400 mr-3" />
              <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder="Search events, artists, or venues..."
                className="bg-transparent border-none outline-none text-white w-full placeholder-gray-500 h-10" />
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 py-2.5 font-bold text-sm flex items-center gap-2 transition-all hover:scale-105 active:scale-95">
                Find <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          <div className="flex justify-center gap-4 mt-8 text-sm font-bold text-gray-400">
            <Link href="/events?category=Music" className="hover:text-white flex items-center gap-2 transition"><Music className="w-4 h-4" /> Music</Link>
            <Link href="/events?category=Sports" className="hover:text-white flex items-center gap-2 transition"><Trophy className="w-4 h-4" /> Sports</Link>
            <Link href="/events?category=Business" className="hover:text-white flex items-center gap-2 transition"><Briefcase className="w-4 h-4" /> Business</Link>
          </div>

          {/* Payment Trust Strip */}
          <div className="flex justify-center items-center gap-3 mt-8 flex-wrap">
            <span className="text-xs text-gray-500 uppercase tracking-widest font-bold">Secure payments via</span>
            <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
              <div className="w-5 h-5 bg-[#00A651] rounded-full flex items-center justify-center"><span className="text-white text-[8px] font-black">M</span></div>
              <span className="text-white text-xs font-bold">M-Pesa</span>
            </div>
            <div className="flex items-center bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
              <span className="bg-[#1A1F71] text-white px-1.5 py-0.5 rounded text-[10px] font-black italic tracking-wider">VISA</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
              <div className="flex -space-x-1.5"><div className="w-4 h-4 rounded-full bg-[#EB001B]" /><div className="w-4 h-4 rounded-full bg-[#F79E1B]" /></div>
              <span className="text-white text-xs font-bold ml-1">Mastercard</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
              <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
              <span className="text-green-400 text-xs font-bold">SSL Secured</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── STATS BAR ─────────────────────────────────────────────────────── */}
      <div className="border-y border-white/5 bg-white/[0.02]">
        <div className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map(({ value, label, icon: Icon }) => (
              <div key={label} className="text-center">
                <div className="flex justify-center mb-2">
                  <Icon className="w-5 h-5 text-blue-400" />
                </div>
                <div className="text-3xl font-bold mb-1">{value}</div>
                <div className="text-sm text-gray-400 font-medium">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── TRENDING ──────────────────────────────────────────────────────── */}
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
          {TRENDING_EVENTS.map((event) => <EventCard key={event.id} event={event} />)}
        </div>
        <div className="mt-12 text-center md:hidden">
          <Link href="/events">
            <button className="bg-white/10 border border-white/10 text-white px-8 py-3 rounded-xl font-bold w-full">View All Events</button>
          </Link>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────────── */}
      <section className="py-24 border-t border-white/5 bg-gradient-to-b from-transparent to-white/[0.02]">
        <div className="container mx-auto px-4">

          {/* Heading */}
          <div className="text-center mb-16">
            <p className="text-blue-400 font-bold uppercase tracking-widest text-sm mb-3">Simple. Fast. Secure.</p>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">How NeneTickets Works</h2>
            <p className="text-gray-400 max-w-lg mx-auto">From discovery to the front row in four easy steps — all from your phone.</p>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {/* Connector dots (desktop) */}
            <div className="hidden lg:flex absolute top-10 left-[18%] right-[18%] items-center justify-between px-[6%] pointer-events-none">
              {[0,1,2].map((i) => (
                <div key={i} className="flex-1 h-px bg-gradient-to-r from-white/10 to-white/5 mx-4" />
              ))}
            </div>

            {HOW_IT_WORKS.map((item) => {
              const c = COLOR_MAP[item.color];
              const Icon = item.icon;
              return (
                <div key={item.step} className={`relative bg-white/5 border ${c.border} rounded-2xl p-6 hover:bg-white/[0.07] transition-all duration-300 group`}>
                  {/* Step pill */}
                  <div className={`inline-flex items-center gap-1.5 ${c.stepBg} ${c.text} text-xs font-black uppercase tracking-widest px-2.5 py-1 rounded-full mb-5`}>
                    <CheckCircle className="w-3 h-3" /> Step {item.step}
                  </div>

                  {/* Icon */}
                  <div className={`w-12 h-12 ${c.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-6 h-6 ${c.text}`} />
                  </div>

                  <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-4">{item.description}</p>

                  {/* Detail badge */}
                  <div className={`inline-flex items-center gap-1 text-xs font-bold ${c.text} ${c.bg} px-2 py-1 rounded-full`}>
                    <Zap className="w-3 h-3" /> {item.detail}
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA */}
          <div className="text-center mt-14">
            <Link href="/events">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-10 py-4 rounded-full flex items-center gap-3 mx-auto shadow-lg shadow-blue-600/30 transition-all hover:scale-105 active:scale-95">
                <CreditCard className="w-5 h-5" /> Browse Events & Get Started
              </button>
            </Link>
            <p className="text-gray-500 text-sm mt-4">No account needed to browse. Sign up only at checkout.</p>
          </div>
        </div>
      </section>

      {/* ── PERSONALIZED: YOUR UPCOMING EVENTS ───────────────────────────── */}
      <SignedIn>
        {upcomingTickets.length > 0 && (
          <section className="py-16 border-t border-white/5">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-1">Your Account</p>
                  <h2 className="text-2xl font-bold">Your Upcoming Events</h2>
                </div>
                <Link href="/tickets">
                  <button className="flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 font-bold transition">
                    View all tickets <ChevronRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {upcomingTickets.map((ticket) => (
                  <Link key={ticket.id} href="/tickets">
                    <div className="bg-white/5 border border-white/10 hover:border-white/20 rounded-2xl overflow-hidden flex items-stretch transition group cursor-pointer">
                      {ticket.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={ticket.image} alt={ticket.title} className="w-20 h-full object-cover flex-shrink-0" />
                      )}
                      <div className="p-4 flex-1 min-w-0">
                        <p className="text-blue-400 text-xs font-bold uppercase capitalize mb-1">{ticket.type}</p>
                        <p className="font-bold text-sm leading-tight mb-2 truncate group-hover:text-blue-400 transition">{ticket.title}</p>
                        <div className="space-y-1 text-xs text-gray-500">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3 h-3" /> {ticket.date}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3 h-3" /> {ticket.location}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center pr-3">
                        <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-white transition" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </SignedIn>

      {/* ── TESTIMONIALS ─────────────────────────────────────────────────── */}
      <section className="py-20 border-t border-white/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">What People Are Saying</h2>
            <p className="text-gray-400">Thousands of Kenyans use NeneTickets every month.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition">
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[1,2,3,4,5].map((s) => <Star key={s} className="w-4 h-4 text-yellow-400 fill-yellow-400" />)}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-6">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-black text-white">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-bold text-sm">{t.name}</p>
                    <p className="text-gray-500 text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
