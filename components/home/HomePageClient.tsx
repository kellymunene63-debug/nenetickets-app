"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Search, Ticket, TrendingUp, Shield, Zap,
  MapPin, Calendar, ChevronRight, Star, Users,
  Clock, Music, Trophy, Briefcase,
} from "lucide-react";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import Navbar from "../shared/Navbar";
import Footer from "../shared/Footer";
import EventCard from "./EventCard";

interface TrendingEvent {
  id: string; title: string; date: string; location: string;
  price: string; image: string; category: string; aiTag: string;
}

interface UpcomingTicket {
  id: string; title: string; type: string; price: number;
  quantity: number; date: string; time: string;
  location: string; image: string; purchasedAt: string;
}

const STATS = [
  { value: "12,000+", label: "Tickets Sold",        icon: Ticket },
  { value: "80+",     label: "Events Listed",        icon: Calendar },
  { value: "60s",     label: "Avg. Checkout Time",   icon: Zap },
  { value: "100%",    label: "Secure Payments",      icon: Shield },
];

const CATEGORIES = [
  { label: "Music",    icon: Music,    q: "Music"    },
  { label: "Sports",   icon: Trophy,   q: "Sports"   },
  { label: "Business", icon: Briefcase,q: "Business" },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Browse Events",    desc: "Discover concerts, sports, business summits and more happening across Kenya.", icon: Search,  color: "from-blue-600 to-blue-400" },
  { step: "02", title: "Pick Your Tickets",desc: "Choose your seats, select the quantity, and confirm your booking in seconds.", icon: Ticket,  color: "from-purple-600 to-purple-400" },
  { step: "03", title: "Pay with M-Pesa",  desc: "Complete your payment securely via M-Pesa — Kenya's most trusted payment method.", icon: Zap,     color: "from-green-600 to-green-400" },
  { step: "04", title: "Enjoy the Event",  desc: "Receive your digital ticket instantly. Show your QR code at the gate and enjoy!", icon: Star,    color: "from-pink-600 to-pink-400" },
];

const TESTIMONIALS = [
  { name: "Amara N.", role: "Music Fan",         text: "Bought my Safaricom Jazz tickets in under 2 minutes. The M-Pesa checkout is seamless!", rating: 5, avatar: "A", color: "bg-blue-600" },
  { name: "Brian K.", role: "Sports Enthusiast", text: "Got my Gor Mahia tickets without any hassle. NeneTickets is the real deal for Kenyan fans.", rating: 5, avatar: "B", color: "bg-purple-600" },
  { name: "Cynthia W.", role: "Tech Professional",text: "Booked the AI Summit and the confirmation was instant. Love how smooth the whole process is.", rating: 5, avatar: "C", color: "bg-pink-600" },
];

export default function HomePageClient({
  trendingEvents,
  upcomingTickets,
}: {
  trendingEvents: TrendingEvent[];
  upcomingTickets: UpcomingTicket[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(query.trim() ? `/events?q=${encodeURIComponent(query.trim())}` : "/events");
  };

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center overflow-hidden px-4">

        {/* Background photo */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070"
            alt="Concert crowd"
            fill
            priority
            className="object-cover opacity-40"
          />
          {/* Dark + purple overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto">

          {/* Live badge */}
          <div className="inline-flex items-center gap-2 bg-black/60 border border-white/15 text-white text-sm font-medium px-4 py-2 rounded-full mb-8 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Live in Nairobi
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-tight mb-6">
            Experience the
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Extraordinary.
            </span>
          </h1>

          <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Discover and book the hottest concerts, sports matches, and tech
            conferences in Kenya — paid instantly via M-Pesa.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex items-center gap-0 max-w-xl mx-auto mb-8 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-1 focus-within:border-blue-500 transition">
            <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search events, artists, or venues..."
              className="flex-1 bg-transparent px-3 py-3 text-white placeholder:text-gray-500 outline-none text-sm"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-2.5 rounded-full transition text-sm whitespace-nowrap"
            >
              Find →
            </button>
          </form>

          {/* Category quick links */}
          <div className="flex items-center justify-center gap-6 mb-12">
            {CATEGORIES.map(({ label, icon: Icon, q }) => (
              <button
                key={label}
                onClick={() => router.push(`/events?category=${q}`)}
                className="flex items-center gap-1.5 text-gray-400 hover:text-white transition text-sm font-medium"
              >
                <Icon className="w-4 h-4" /> {label}
              </button>
            ))}
          </div>

          {/* Payment badges */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mr-1">
              Secure payments via
            </span>

            {/* M-Pesa */}
            <span className="flex items-center gap-2 bg-green-600/20 border border-green-500/30 px-3 py-1.5 rounded-full">
              {/* M-Pesa: green circle + wordmark */}
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="9" cy="9" r="9" fill="#00A550"/>
                <path d="M4.5 12V7L6.8 10.5L9 7L11.2 10.5L13.5 7V12" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
              <span className="text-green-400 text-xs font-bold tracking-wide">M-PESA</span>
            </span>

            {/* Visa */}
            <span className="flex items-center gap-2 bg-[#1A1F71]/40 border border-[#1A1F71]/60 px-3 py-1.5 rounded-full">
              <svg width="36" height="12" viewBox="0 0 36 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* VISA wordmark — italic bold */}
                <text
                  x="18" y="10"
                  textAnchor="middle"
                  fontFamily="Arial, sans-serif"
                  fontSize="13"
                  fontWeight="900"
                  fontStyle="italic"
                  fill="white"
                  letterSpacing="0.5"
                >VISA</text>
              </svg>
            </span>

            {/* Mastercard */}
            <span className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
              <svg width="30" height="18" viewBox="0 0 30 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="11" cy="9" r="9" fill="#EB001B"/>
                <circle cx="19" cy="9" r="9" fill="#F79E1B"/>
                {/* Overlap — blended orange */}
                <path d="M15 2.8C16.7 4.1 17.8 6.1 17.8 8.4C17.8 10.7 16.7 12.7 15 14C13.3 12.7 12.2 10.7 12.2 8.4C12.2 6.1 13.3 4.1 15 2.8Z" fill="#FF5F00"/>
              </svg>
              <span className="text-gray-300 text-xs font-bold">Mastercard</span>
            </span>

            {/* SSL */}
            <span className="flex items-center gap-1.5 bg-green-600/10 border border-green-500/20 text-green-400 text-xs font-bold px-3 py-1.5 rounded-full">
              <svg width="11" height="13" viewBox="0 0 11 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5.5 0.5L1 2.5V6C1 9 3 11.8 5.5 12.5C8 11.8 10 9 10 6V2.5L5.5 0.5Z" fill="#4ADE80" fillOpacity="0.2" stroke="#4ADE80" strokeWidth="0.8"/>
                <path d="M3.5 6.5L5 8L7.5 5" stroke="#4ADE80" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              SSL Secured
            </span>
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────────────────── */}
      <section className="border-y border-white/5 bg-white/[0.02] py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map(({ value, label, icon: Icon }) => (
              <div key={label} className="text-center">
                <div className="flex justify-center mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-blue-400" />
                  </div>
                </div>
                <div className="text-3xl font-black text-white mb-1">{value}</div>
                <div className="text-sm text-gray-500 font-medium">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trending Events ──────────────────────────────────────────────────── */}
      {trendingEvents.length > 0 && (
        <section className="py-24 px-4">
          <div className="container mx-auto">
            <div className="flex items-end justify-between mb-12">
              <div>
                <div className="inline-flex items-center gap-2 text-pink-400 text-sm font-bold uppercase tracking-widest mb-3">
                  <TrendingUp className="w-4 h-4" /> Trending Now
                </div>
                <h2 className="text-4xl font-black">
                  Newest{" "}
                  <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                    Events
                  </span>
                </h2>
              </div>
              <Link href="/events" className="hidden md:flex items-center gap-1.5 text-sm font-bold text-gray-400 hover:text-white transition group">
                See all events <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {trendingEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
            <div className="mt-10 text-center md:hidden">
              <Link href="/events">
                <button className="inline-flex items-center gap-2 border border-white/20 text-white font-bold px-8 py-3 rounded-full hover:bg-white/5 transition">
                  See All Events <ChevronRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── How It Works ─────────────────────────────────────────────────────── */}
      <section className="py-24 px-4 bg-white/[0.02] border-y border-white/5">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 text-blue-400 text-sm font-bold uppercase tracking-widest mb-3">
              <Zap className="w-4 h-4" /> Simple &amp; Fast
            </div>
            <h2 className="text-4xl font-black">
              How It{" "}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Works</span>
            </h2>
            <p className="text-gray-500 mt-4 max-w-lg mx-auto">
              From browsing to enjoying your event — the entire process takes less than 3 minutes.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {HOW_IT_WORKS.map(({ step, title, desc, icon: Icon, color }) => (
              <div key={step} className="relative group">
                <div className="relative z-10 bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all duration-300 group-hover:bg-white/[0.08]">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-5 shadow-lg`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-xs font-black text-gray-600 uppercase tracking-widest mb-2">Step {step}</div>
                  <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Upcoming Tickets (signed-in) ─────────────────────────────────────── */}
      <SignedIn>
        {upcomingTickets.length > 0 && (
          <section className="py-24 px-4">
            <div className="container mx-auto">
              <div className="flex items-end justify-between mb-12">
                <div>
                  <div className="inline-flex items-center gap-2 text-green-400 text-sm font-bold uppercase tracking-widest mb-3">
                    <Ticket className="w-4 h-4" /> Your Tickets
                  </div>
                  <h2 className="text-4xl font-black">
                    Upcoming{" "}
                    <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">Events</span>
                  </h2>
                </div>
                <Link href="/tickets" className="hidden md:flex items-center gap-1.5 text-sm font-bold text-gray-400 hover:text-white transition group">
                  All tickets <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingTickets.map((ticket) => (
                  <div key={ticket.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-300">
                    <div className="h-32 w-full relative overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={ticket.image} alt={ticket.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                      <div className="absolute bottom-3 left-3">
                        <span className="text-xs font-bold text-green-400 bg-green-400/10 border border-green-400/20 px-2 py-0.5 rounded-full">✓ Confirmed</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-white text-sm mb-2 line-clamp-1">{ticket.title}</h3>
                      <div className="flex items-center text-gray-500 text-xs mb-1 gap-1.5">
                        <Calendar className="w-3.5 h-3.5 flex-shrink-0" /> {ticket.date}{ticket.time && ` at ${ticket.time}`}
                      </div>
                      <div className="flex items-center text-gray-500 text-xs mb-3 gap-1.5">
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0" /> {ticket.location}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">{ticket.quantity} ticket{ticket.quantity !== 1 ? "s" : ""}</span>
                        <Link href="/tickets">
                          <button className="text-xs font-bold text-blue-400 hover:text-blue-300 transition">View →</button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </SignedIn>

      {/* ── Testimonials ─────────────────────────────────────────────────────── */}
      <section className="py-24 px-4 bg-white/[0.02] border-y border-white/5">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 text-yellow-400 text-sm font-bold uppercase tracking-widest mb-3">
              <Star className="w-4 h-4" /> Reviews
            </div>
            <h2 className="text-4xl font-black">
              What Our{" "}
              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">Customers Say</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map(({ name, role, text, rating, avatar, color }) => (
              <div key={name} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all duration-300">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-6">&ldquo;{text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center text-sm font-black text-white`}>{avatar}</div>
                  <div>
                    <p className="font-bold text-sm text-white">{name}</p>
                    <p className="text-xs text-gray-500">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="container mx-auto">
          <div className="relative bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/20 rounded-3xl p-12 text-center overflow-hidden">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 text-white text-xs font-bold px-4 py-2 rounded-full mb-6">
                <Clock className="w-3.5 h-3.5 text-blue-400" /> Limited Tickets Available
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Don&apos;t Miss Out</h2>
              <p className="text-gray-400 text-lg max-w-xl mx-auto mb-8">
                The hottest events in Kenya sell out fast. Browse now and secure your tickets before they&apos;re gone.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link href="/events">
                  <button className="bg-white text-black font-black px-10 py-4 rounded-full hover:bg-gray-100 transition-all duration-200 text-sm">Browse Events Now</button>
                </Link>
                <Link href="/host">
                  <button className="border border-white/20 hover:border-white/40 text-white font-bold px-10 py-4 rounded-full transition-all duration-200 hover:bg-white/5 text-sm">Host an Event</button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
