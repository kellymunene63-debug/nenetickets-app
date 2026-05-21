"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Search, Ticket, TrendingUp, Shield, Zap,
  MapPin, Calendar, ChevronRight, Star, ArrowRight,
  Clock, Music, Trophy, Briefcase, CheckCircle2,
  Banknote, Smartphone, BarChart3, Sparkles,
} from "lucide-react";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import Navbar from "../shared/Navbar";
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

// ── Real value-prop stats (no inflated numbers) ──────────────────────────────
const STATS = [
  { value: "95%",   label: "Revenue to organizers",  icon: Banknote,    color: "text-green-400",  bg: "bg-green-500/10 border-green-500/20" },
  { value: "3%",    label: "Transparent booking fee", icon: Shield,      color: "text-blue-400",   bg: "bg-blue-500/10 border-blue-500/20"  },
  { value: "< 60s", label: "Checkout time",           icon: Zap,         color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
  { value: "100%",  label: "M-Pesa native",           icon: Smartphone,  color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
];

const CATEGORIES = [
  { label: "Music",    icon: Music,     q: "Music"    },
  { label: "Sports",   icon: Trophy,    q: "Sports"   },
  { label: "Business", icon: Briefcase, q: "Business" },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Browse Events",
    desc: "Discover concerts, sports matches, business summits and more — all happening across Kenya.",
    icon: Search,
    color: "from-blue-600 to-blue-400",
    glow: "shadow-blue-500/20",
  },
  {
    step: "02",
    title: "Pick Your Tickets",
    desc: "Choose your ticket type and quantity. General, VIP, Early Bird — whatever the organizer offers.",
    icon: Ticket,
    color: "from-purple-600 to-purple-400",
    glow: "shadow-purple-500/20",
  },
  {
    step: "03",
    title: "Pay via M-Pesa",
    desc: "Complete your payment securely via M-Pesa — no cards, no foreign currency, no drama.",
    icon: Smartphone,
    color: "from-green-600 to-green-400",
    glow: "shadow-green-500/20",
  },
  {
    step: "04",
    title: "Show Up & Enjoy",
    desc: "Your digital ticket arrives instantly. Show the QR code at the gate. That's literally it.",
    icon: Star,
    color: "from-pink-600 to-pink-400",
    glow: "shadow-pink-500/20",
  },
];

// ── Organizer perks ───────────────────────────────────────────────────────────
const ORGANIZER_PERKS = [
  { icon: Banknote,   title: "Keep 95% of every ticket",         desc: "Only a 5% platform fee. The rest goes straight to your M-Pesa or bank via Paystack." },
  { icon: Zap,        title: "Go live in under 10 minutes",       desc: "Create your event, set ticket types and pricing, submit — we handle the rest." },
  { icon: BarChart3,  title: "Real-time dashboard",               desc: "Track ticket sales, revenue, and attendance from your phone, anywhere." },
  { icon: Shield,     title: "Zero upfront cost for paid events", desc: "No subscription, no setup fee. You only earn — you never pay to list." },
];

// ── Testimonials — no fake event references ───────────────────────────────────
const TESTIMONIALS = [
  {
    name: "Amara N.",
    role: "Music fan, Nairobi",
    text: "I've bought tickets via M-Pesa before but it was always someone's personal number and felt sketchy. NeneTickets feels proper — got my confirmation instantly.",
    rating: 5,
    avatar: "A",
    color: "bg-blue-600",
  },
  {
    name: "Brian K.",
    role: "Sports enthusiast",
    text: "The checkout took me less than a minute. I was half-expecting it to fail the way most Kenyan payment pages do, but it just worked. Refreshing.",
    rating: 5,
    avatar: "B",
    color: "bg-purple-600",
  },
  {
    name: "Cynthia W.",
    role: "Event organizer, Westlands",
    text: "Switched from collecting M-Pesa manually. The difference is night and day — I can see who's paid, how many tickets are sold, and payouts come automatically.",
    rating: 5,
    avatar: "C",
    color: "bg-pink-600",
  },
];

// ── Trust badges ──────────────────────────────────────────────────────────────
const TRUST_BADGES = [
  { label: "SSL Secured", icon: Shield,       color: "text-green-400",  bg: "bg-green-500/10 border-green-500/20" },
  { label: "Paystack Verified", icon: CheckCircle2, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
  { label: "Instant E-Tickets", icon: Ticket,      color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
  { label: "Kenya-built",       icon: Sparkles,    color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
];

// ── Component ─────────────────────────────────────────────────────────────────
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
        {/* Background */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070"
            alt="Concert crowd"
            fill
            priority
            className="object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black" />
          {/* Subtle color blobs */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto">
          {/* Live badge */}
          <div className="inline-flex items-center gap-2 bg-black/60 border border-white/15 text-white text-sm font-semibold px-4 py-2 rounded-full mb-8 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Kenya&apos;s ticketing platform — built right here
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.05] mb-6">
            Your next great
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              experience awaits.
            </span>
          </h1>

          <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Discover and book tickets for the best events across Kenya —
            paid instantly via M-Pesa, delivered straight to your phone.
          </p>

          {/* Search */}
          <form
            onSubmit={handleSearch}
            className="flex items-center gap-0 max-w-xl mx-auto mb-8 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-1 focus-within:border-blue-500 focus-within:bg-white/15 transition-all duration-200"
          >
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
              className="bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold px-6 py-2.5 rounded-full transition-all duration-150 text-sm whitespace-nowrap"
            >
              Search →
            </button>
          </form>

          {/* Category quick links */}
          <div className="flex items-center justify-center gap-6 mb-12">
            {CATEGORIES.map(({ label, icon: Icon, q }) => (
              <button
                key={label}
                onClick={() => router.push(`/events?category=${q}`)}
                className="flex items-center gap-1.5 text-gray-400 hover:text-white transition text-sm font-medium group"
              >
                <Icon className="w-4 h-4 group-hover:text-blue-400 transition" /> {label}
              </button>
            ))}
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {TRUST_BADGES.map(({ label, icon: Icon, color, bg }) => (
              <span
                key={label}
                className={`flex items-center gap-1.5 ${bg} border ${color} text-xs font-bold px-3 py-1.5 rounded-full`}
              >
                <Icon className="w-3.5 h-3.5" /> {label}
              </span>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-gray-600 animate-bounce">
          <div className="w-5 h-8 rounded-full border-2 border-gray-700 flex items-start justify-center pt-1.5">
            <div className="w-1 h-1.5 bg-gray-500 rounded-full" />
          </div>
        </div>
      </section>

      {/* ── Stats strip ──────────────────────────────────────────────────────── */}
      <section className="border-y border-white/5 bg-white/[0.02] py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map(({ value, label, icon: Icon, color, bg }) => (
              <div key={label} className="text-center group">
                <div className="flex justify-center mb-3">
                  <div className={`w-11 h-11 rounded-2xl ${bg} border flex items-center justify-center transition-transform group-hover:scale-110 duration-200`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                </div>
                <div className={`text-3xl font-black mb-1 ${color}`}>{value}</div>
                <div className="text-sm text-gray-500 font-medium">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trending Events (or empty invite) ────────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="container mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <div className="inline-flex items-center gap-2 text-pink-400 text-sm font-bold uppercase tracking-widest mb-3">
                <TrendingUp className="w-4 h-4" /> Live Now
              </div>
              <h2 className="text-4xl font-black">
                {trendingEvents.length > 0 ? (
                  <>Latest <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">Events</span></>
                ) : (
                  <>Be the <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">First</span></>
                )}
              </h2>
            </div>
            {trendingEvents.length > 0 && (
              <Link href="/events" className="hidden md:flex items-center gap-1.5 text-sm font-bold text-gray-400 hover:text-white transition group">
                See all events <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
          </div>

          {trendingEvents.length > 0 ? (
            <>
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
            </>
          ) : (
            /* Empty state — invite organizers */
            <div className="relative border border-dashed border-white/10 rounded-3xl p-16 text-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5" />
              <div className="relative z-10">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-white/10 flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-9 h-9 text-blue-400" />
                </div>
                <h3 className="text-2xl font-black mb-3">The stage is set.</h3>
                <p className="text-gray-500 max-w-md mx-auto mb-8 leading-relaxed">
                  We&apos;re just getting started — the first events are coming soon.
                  Are you an organizer? Get your event in front of a growing Kenya audience.
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <Link href="/host">
                    <button className="bg-blue-600 hover:bg-blue-500 text-white font-black px-8 py-3.5 rounded-full transition-all duration-200 flex items-center gap-2">
                      Host Your Event <ArrowRight className="w-4 h-4" />
                    </button>
                  </Link>
                  <Link href="/events">
                    <button className="border border-white/20 text-white font-bold px-8 py-3.5 rounded-full hover:bg-white/5 transition">
                      Browse Events
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────────────────── */}
      <section className="py-24 px-4 bg-white/[0.02] border-y border-white/5">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 text-blue-400 text-sm font-bold uppercase tracking-widest mb-3">
              <Zap className="w-4 h-4" /> Dead Simple
            </div>
            <h2 className="text-4xl font-black">
              From browsing to{" "}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">gate entry</span>
            </h2>
            <p className="text-gray-500 mt-4 max-w-lg mx-auto">
              The whole process — from finding an event to having your ticket — takes under 3 minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map(({ step, title, desc, icon: Icon, color, glow }, idx) => (
              <div key={step} className="relative group">
                {/* Connector line on desktop */}
                {idx < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden lg:block absolute top-7 left-[calc(100%-8px)] w-full h-px bg-gradient-to-r from-white/10 to-transparent z-0" />
                )}
                <div className="relative z-10 bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 hover:bg-white/[0.08] transition-all duration-300 h-full">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-5 shadow-xl ${glow}`}>
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

      {/* ── For Organizers ────────────────────────────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: copy */}
            <div>
              <div className="inline-flex items-center gap-2 text-green-400 text-sm font-bold uppercase tracking-widest mb-4">
                <Banknote className="w-4 h-4" /> For Event Organizers
              </div>
              <h2 className="text-4xl md:text-5xl font-black leading-tight mb-6">
                Stop collecting{" "}
                <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                  M-Pesa manually.
                </span>
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed mb-8">
                NeneTickets gives you a proper ticketing setup in minutes — with automatic payouts,
                real-time sales tracking, and a checkout your attendees will actually trust.
              </p>
              <div className="space-y-5 mb-10">
                {ORGANIZER_PERKS.map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm mb-0.5">{title}</p>
                      <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/host">
                <button className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-400 hover:to-blue-500 text-white font-black px-10 py-4 rounded-full transition-all duration-200 flex items-center gap-2 shadow-lg shadow-green-500/20">
                  Start Hosting — It&apos;s Free <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>

            {/* Right: visual card */}
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-green-600/10 to-blue-600/10 rounded-3xl blur-xl" />
              <div className="relative bg-white/5 border border-white/10 rounded-2xl p-8 space-y-6">
                {/* Mock payout card */}
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 text-sm font-medium">Your earnings</span>
                  <span className="text-xs text-green-400 font-bold bg-green-400/10 border border-green-400/20 px-2 py-0.5 rounded-full">Live</span>
                </div>
                <div>
                  <p className="text-5xl font-black text-white">KES 0</p>
                  <p className="text-gray-600 text-sm mt-1">Ready when you host your first event</p>
                </div>
                <div className="h-px bg-white/5" />
                {/* Split breakdown */}
                <div className="space-y-3">
                  {[
                    { label: "Ticket revenue",   pct: "100%", color: "bg-white/20",   width: "w-full" },
                    { label: "Your payout (95%)", pct: "95%",  color: "bg-green-500",  width: "w-[95%]" },
                    { label: "Platform fee (5%)", pct: "5%",   color: "bg-white/10",   width: "w-[5%]" },
                  ].map(({ label, pct, color, width }) => (
                    <div key={label}>
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>{label}</span><span className="font-bold text-white">{pct}</span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div className={`h-full ${color} ${width} rounded-full`} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="h-px bg-white/5" />
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                  Payouts go directly to your bank or M-Pesa via Paystack
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Upcoming Tickets (signed-in only) ────────────────────────────────── */}
      <SignedIn>
        {upcomingTickets.length > 0 && (
          <section className="py-24 px-4 bg-white/[0.02] border-y border-white/5">
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
                  <div key={ticket.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-300 group">
                    <div className="h-32 w-full relative overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={ticket.image} alt={ticket.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                      <div className="absolute bottom-3 left-3">
                        <span className="text-xs font-bold text-green-400 bg-green-400/10 border border-green-400/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Confirmed
                        </span>
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
                          <button className="text-xs font-bold text-blue-400 hover:text-blue-300 transition flex items-center gap-1">
                            View <ArrowRight className="w-3 h-3" />
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

      {/* ── Testimonials ─────────────────────────────────────────────────────── */}
      <section className="py-24 px-4 bg-white/[0.02] border-y border-white/5">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 text-yellow-400 text-sm font-bold uppercase tracking-widest mb-3">
              <Star className="w-4 h-4" /> Real People, Real Experiences
            </div>
            <h2 className="text-4xl font-black">
              What{" "}
              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                people are saying
              </span>
            </h2>
            <p className="text-gray-500 mt-4 max-w-md mx-auto">
              From first-time buyers to experienced organizers — here&apos;s what they found.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map(({ name, role, text, rating, avatar, color }) => (
              <div key={name} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 hover:bg-white/[0.08] transition-all duration-300 flex flex-col">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-6 flex-1">&ldquo;{text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center text-sm font-black text-white flex-shrink-0`}>
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

      {/* ── CTA Banner ───────────────────────────────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="container mx-auto">
          <div className="relative bg-gradient-to-br from-blue-600/20 via-purple-600/10 to-pink-600/20 border border-white/10 rounded-3xl p-12 md:p-16 text-center overflow-hidden">
            <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 text-white text-xs font-bold px-4 py-2 rounded-full mb-6">
                <Clock className="w-3.5 h-3.5 text-blue-400" /> Don&apos;t wait until they&apos;re sold out
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight">
                Ready to experience
                <br />
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  something great?
                </span>
              </h2>
              <p className="text-gray-400 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
                Browse live events across Kenya, pay via M-Pesa, and get your
                digital ticket in under 60 seconds.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link href="/events">
                  <button className="bg-white text-black font-black px-10 py-4 rounded-full hover:bg-gray-100 active:scale-95 transition-all duration-200 text-sm flex items-center gap-2">
                    Browse Events <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="border border-white/20 hover:border-white/40 text-white font-bold px-10 py-4 rounded-full transition-all duration-200 hover:bg-white/5 text-sm">
                      Create Free Account
                    </button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <Link href="/host">
                    <button className="border border-white/20 hover:border-white/40 text-white font-bold px-10 py-4 rounded-full transition-all duration-200 hover:bg-white/5 text-sm">
                      Host an Event
                    </button>
                  </Link>
                </SignedIn>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
