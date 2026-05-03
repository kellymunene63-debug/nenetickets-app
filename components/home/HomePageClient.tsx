"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search, Ticket, TrendingUp, Shield, Zap,
  MapPin, Calendar, ChevronRight, Star, Users, Clock,
} from "lucide-react";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import Navbar from "../shared/Navbar";
import Footer from "../shared/Footer";
import EventCard from "./EventCard";

interface TrendingEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  price: string;
  image: string;
  category: string;
  aiTag: string;
}

interface UpcomingTicket {
  id: string;
  title: string;
  type: string;
  price: number;
  quantity: number;
  date: string;
  time: string;
  location: string;
  image: string;
  purchasedAt: string;
}

const STATS = [
  { value: "50K+", label: "Tickets Sold",   icon: Ticket },
  { value: "200+", label: "Events Listed",   icon: Calendar },
  { value: "98%",  label: "Happy Buyers",    icon: Star },
  { value: "24/7", label: "Support",         icon: Shield },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Browse Events",
    desc: "Discover concerts, sports, business summits and more happening across Kenya.",
    icon: Search,
    color: "from-blue-600 to-blue-400",
  },
  {
    step: "02",
    title: "Pick Your Tickets",
    desc: "Choose your seats, select the quantity, and confirm your booking in seconds.",
    icon: Ticket,
    color: "from-purple-600 to-purple-400",
  },
  {
    step: "03",
    title: "Pay with M-Pesa",
    desc: "Complete your payment securely via M-Pesa — Kenya's most trusted payment method.",
    icon: Zap,
    color: "from-green-600 to-green-400",
  },
  {
    step: "04",
    title: "Enjoy the Event",
    desc: "Receive your digital ticket instantly. Show your QR code at the gate and enjoy!",
    icon: Star,
    color: "from-pink-600 to-pink-400",
  },
];

const TESTIMONIALS = [
  {
    name: "Amara N.",
    role: "Music Fan",
    text: "Bought my Safaricom Jazz tickets in under 2 minutes. The M-Pesa checkout is seamless!",
    rating: 5,
    avatar: "A",
    color: "bg-blue-600",
  },
  {
    name: "Brian K.",
    role: "Sports Enthusiast",
    text: "Got my Gor Mahia tickets without any hassle. NeneTickets is the real deal for Kenyan fans.",
    rating: 5,
    avatar: "B",
    color: "bg-purple-600",
  },
  {
    name: "Cynthia W.",
    role: "Tech Professional",
    text: "Booked the AI Summit and the confirmation was instant. Love how smooth the whole process is.",
    rating: 5,
    avatar: "C",
    color: "bg-pink-600",
  },
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
    if (query.trim()) {
      router.push(`/events?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push("/events");
    }
  };

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center overflow-hidden px-4">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] bg-blue-600/15 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-[500px] h-[400px] bg-purple-600/10 rounded-full blur-3xl" />
          <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-pink-600/10 rounded-full blur-3xl" />
        </div>

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />

        <div className="relative z-10 max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-500/20 text-blue-400 text-xs font-bold px-4 py-2 rounded-full mb-6">
            <Zap className="w-3.5 h-3.5" />
            Kenya&apos;s #1 Ticket Platform
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-tight mb-6">
            Book Tickets{" "}
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Instantly
            </span>
            <br />
            Pay with M-Pesa
          </h1>

          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Discover concerts, sports matches, and business events across Kenya.
            Secure your spot in seconds — no queues, no hassle.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto mb-10">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search events, artists, venues…"
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500 focus:bg-white/8 transition text-sm"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-4 rounded-2xl transition-all duration-200 shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] whitespace-nowrap"
            >
              Find Events
            </button>
          </form>

          {/* CTA buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/events">
              <button className="group flex items-center gap-2 bg-white text-black font-bold px-8 py-3.5 rounded-full hover:bg-gray-100 transition-all duration-200">
                Browse All Events
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="flex items-center gap-2 border border-white/20 hover:border-white/40 text-white font-bold px-8 py-3.5 rounded-full transition-all duration-200 hover:bg-white/5">
                  <Users className="w-4 h-4" /> Get Started Free
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link href="/host">
                <button className="flex items-center gap-2 border border-white/20 hover:border-white/40 text-white font-bold px-8 py-3.5 rounded-full transition-all duration-200 hover:bg-white/5">
                  <TrendingUp className="w-4 h-4" /> Host an Event
                </button>
              </Link>
            </SignedIn>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-600 animate-bounce">
          <span className="text-xs font-medium uppercase tracking-widest">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-gray-600 to-transparent" />
        </div>
      </section>

      {/* ── Stats ── */}
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

      {/* ── Trending Events ── */}
      {trendingEvents.length > 0 && (
        <section className="py-24 px-4">
          <div className="container mx-auto">
            {/* Section header */}
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
                See all events
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Event cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {trendingEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>

            {/* Mobile "see all" link */}
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

      {/* ── How It Works ── */}
      <section className="py-24 px-4 bg-white/[0.02] border-y border-white/5">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 text-blue-400 text-sm font-bold uppercase tracking-widest mb-3">
              <Zap className="w-4 h-4" /> Simple &amp; Fast
            </div>
            <h2 className="text-4xl font-black">
              How It{" "}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Works
              </span>
            </h2>
            <p className="text-gray-500 mt-4 max-w-lg mx-auto">
              From browsing to enjoying your event — the entire process takes less than 3 minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {HOW_IT_WORKS.map(({ step, title, desc, icon: Icon, color }) => (
              <div key={step} className="relative group">
                {/* Connector line */}
                <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-white/10 to-transparent z-0 last:hidden" />

                <div className="relative z-10 bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all duration-300 group-hover:bg-white/8">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-5 shadow-lg`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-xs font-black text-gray-600 uppercase tracking-widest mb-2">
                    Step {step}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Upcoming Tickets (signed-in users who've purchased) ── */}
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
                    <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                      Events
                    </span>
                  </h2>
                </div>
                <Link href="/tickets" className="hidden md:flex items-center gap-1.5 text-sm font-bold text-gray-400 hover:text-white transition group">
                  All tickets
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-300"
                  >
                    <div className="h-32 w-full relative overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={ticket.image}
                        alt={ticket.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                      <div className="absolute bottom-3 left-3">
                        <span className="text-xs font-bold text-green-400 bg-green-400/10 border border-green-400/20 px-2 py-0.5 rounded-full">
                          ✓ Confirmed
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-white text-sm mb-2 line-clamp-1">{ticket.title}</h3>
                      <div className="flex items-center text-gray-500 text-xs mb-1 gap-1.5">
                        <Calendar className="w-3.5 h-3.5 flex-shrink-0" /> {ticket.date}
                        {ticket.time && ` at ${ticket.time}`}
                      </div>
                      <div className="flex items-center text-gray-500 text-xs mb-3 gap-1.5">
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0" /> {ticket.location}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">
                          {ticket.quantity} ticket{ticket.quantity !== 1 ? "s" : ""}
                        </span>
                        <Link href="/tickets">
                          <button className="text-xs font-bold text-blue-400 hover:text-blue-300 transition">
                            View →
                          </button>
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

      {/* ── Testimonials ── */}
      <section className="py-24 px-4 bg-white/[0.02] border-y border-white/5">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 text-yellow-400 text-sm font-bold uppercase tracking-widest mb-3">
              <Star className="w-4 h-4" /> Reviews
            </div>
            <h2 className="text-4xl font-black">
              What Our{" "}
              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                Customers Say
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map(({ name, role, text, rating, avatar, color }) => (
              <div
                key={name}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all duration-300"
              >
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                <p className="text-gray-300 text-sm leading-relaxed mb-6">&ldquo;{text}&rdquo;</p>

                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center text-sm font-black text-white`}>
                    {avatar}
                  </div>
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

      {/* ── CTA Banner ── */}
      <section className="py-24 px-4">
        <div className="container mx-auto">
          <div className="relative bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/20 rounded-3xl p-12 text-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5 rounded-3xl" />
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 text-white text-xs font-bold px-4 py-2 rounded-full mb-6">
                <Clock className="w-3.5 h-3.5 text-blue-400" /> Limited Tickets Available
              </div>

              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                Don&apos;t Miss Out
              </h2>
              <p className="text-gray-400 text-lg max-w-xl mx-auto mb-8">
                The hottest events in Kenya sell out fast. Browse now and secure your tickets before they&apos;re gone.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link href="/events">
                  <button className="bg-white text-black font-black px-10 py-4 rounded-full hover:bg-gray-100 transition-all duration-200 text-sm">
                    Browse Events Now
                  </button>
                </Link>
                <Link href="/host">
                  <button className="border border-white/20 hover:border-white/40 text-white font-bold px-10 py-4 rounded-full transition-all duration-200 hover:bg-white/5 text-sm">
                    Host an Event
                  </button>
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
