"use client";

import Navbar from "../../../components/shared/Navbar";
import ReviewSection from "../../../components/ReviewSection";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Calendar, MapPin, ArrowLeft, CheckCircle2, Minus, Plus, Share2,
  Copy, Twitter, MessageCircle, Info, Eye, TrendingUp, AlertTriangle, Clock
} from "lucide-react";

const EVENTS_DB: Record<string, {
  title: string; image: string; date: string; time: string; location: string;
  basePrice: number; baseVipPrice: number; description: string; category: string; tag: string;
}> = {
  "1": {
    title: "Safaricom Jazz Festival 2026",
    image: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=2070",
    date: "Jun 14, 2026", time: "6:00 PM", location: "Carnivore Grounds",
    basePrice: 2500, baseVipPrice: 8000,
    description: "Experience the magic of jazz under the Nairobi sky. Featuring world-renowned artists and local legends performing across three stages. Gates open at 4 PM — arrive early for the best spots.",
    category: "Music", tag: "SELLING FAST",
  },
  "2": {
    title: "Gor Mahia vs AFC Leopards",
    image: "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=1931",
    date: "Jun 21, 2026", time: "3:00 PM", location: "Kasarani Stadium",
    basePrice: 500, baseVipPrice: 2000,
    description: "The biggest derby in Kenya — the Mashemeji Derby! Watch Gor Mahia and AFC Leopards clash for bragging rights at a packed Kasarani. Bring your colours and your voice.",
    category: "Sports", tag: "HIGH DEMAND",
  },
  "3": {
    title: "Nairobi Tech Week: AI Summit",
    image: "https://images.unsplash.com/photo-1544531586-fde5298cdd40?q=80&w=2070",
    date: "Jul 05, 2026", time: "9:00 AM", location: "Sarit Centre",
    basePrice: 0, baseVipPrice: 1500,
    description: "Join the leading minds in African tech. Keynotes from Google, Microsoft, and NeneLabs on the future of AI in Africa. Networking sessions, workshops, and live demos all day.",
    category: "Business", tag: "TRENDING",
  },
  "4": {
    title: "Blankets & Wine: The Return",
    image: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=2070",
    date: "Jul 12, 2026", time: "12:00 PM", location: "Laureate Gardens",
    basePrice: 3000, baseVipPrice: 9000,
    description: "Kenya's most iconic outdoor music experience is back. Lay out your blanket, pour a glass, and let the music carry you through an afternoon of soulful performances in Nairobi's lush gardens.",
    category: "Music", tag: "NEW ADDED",
  },
  "5": {
    title: "WRC Safari Rally 2026",
    image: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=2070",
    date: "Aug 01, 2026", time: "8:00 AM", location: "Naivasha",
    basePrice: 1000, baseVipPrice: 5000,
    description: "The world's fastest rally drivers tackle Kenya's iconic terrain. Watch the WRC Safari Rally live — thrilling stages, spectacular jumps, and the smell of red dust in the Naivasha air.",
    category: "Sports", tag: "GLOBAL EVENT",
  },
  "6": {
    title: "Modern Art Gallery Opening",
    image: "https://images.unsplash.com/photo-1574169208507-84376144848b?q=80&w=2079",
    date: "Aug 15, 2026", time: "5:00 PM", location: "Nairobi Museum",
    basePrice: 1500, baseVipPrice: 4000,
    description: "An exclusive evening celebrating East Africa's most exciting contemporary artists. Private gallery walk, artist talks, curated refreshments, and a live performance by Nairobi's premier string quartet.",
    category: "Arts", tag: "EXCLUSIVE",
  },
};

function getDaysUntil(dateStr: string): number | null {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    return Math.ceil((d.getTime() - Date.now()) / 86400000);
  } catch { return null; }
}

export default function EventPage({ params }: { params: { id: string } }) {
  const event = EVENTS_DB[params.id];
  const [selectedTicket, setSelectedTicket] = useState<"regular" | "vip">("regular");
  const [quantity, setQuantity] = useState(1);
  const [copied, setCopied] = useState(false);
  const [viewers, setViewers] = useState(24);
  const [isSurge, setIsSurge] = useState(false);

  const daysUntil = event ? getDaysUntil(event.date) : null;

  useEffect(() => {
    const interval = setInterval(() => {
      setViewers((prev) => {
        const next = prev + Math.floor(Math.random() * 5) - 1;
        return next > 10 ? next : 10;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setIsSurge(viewers > 40);
  }, [viewers]);

  if (!event) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center flex-col gap-4">
        <Navbar />
        <h2 className="text-2xl font-bold">Event not found</h2>
        <Link href="/events" className="text-blue-400 hover:underline">Browse all events</Link>
      </main>
    );
  }

  const surgeMultiplier = isSurge ? 1.2 : 1;
  const regularPrice = Math.round(event.basePrice * surgeMultiplier);
  const vipPrice = Math.round(event.baseVipPrice * surgeMultiplier);
  const currentPrice = selectedTicket === "regular" ? regularPrice : vipPrice;
  const totalPrice = currentPrice * quantity;

  const handleQuantity = (type: "inc" | "dec") => {
    if (type === "dec" && quantity > 1) setQuantity(quantity - 1);
    if (type === "inc" && quantity < 10) setQuantity(quantity + 1);
  };

  const handleShare = (platform: "whatsapp" | "twitter" | "copy") => {
    const shareUrl = typeof window !== "undefined" ? window.location.href : "";
    const shareText = `Check out ${event.title} on NeneTickets! 🎟️`;
    if (platform === "whatsapp") window.open(`https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`, "_blank");
    else if (platform === "twitter") window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, "_blank");
    else { navigator.clipboard.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  };

  const checkoutUrl = `/checkout?title=${encodeURIComponent(event.title)}&type=${selectedTicket}&price=${currentPrice}&quantity=${quantity}&date=${encodeURIComponent(event.date)}&time=${encodeURIComponent(event.time)}&location=${encodeURIComponent(event.location)}&image=${encodeURIComponent(event.image)}`;

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      {/* Hero */}
      <div className="relative h-[60vh] w-full">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent z-10" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={event.image} alt={event.title} className="w-full h-full object-cover" />

        <div className="absolute top-24 left-4 z-50 container mx-auto px-4">
          <Link href="/events" className="inline-flex items-center gap-2 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full hover:bg-black/70 transition text-sm font-bold">
            <ArrowLeft className="w-4 h-4" /> All Events
          </Link>
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-20 p-8 container mx-auto px-8">
          {/* Countdown badge */}
          {daysUntil !== null && daysUntil >= 0 && (
            <div className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full mb-4 ${
              daysUntil <= 7 ? "bg-orange-500/90 text-white" : "bg-white/10 text-gray-300 border border-white/20"
            }`}>
              <Clock className="w-3.5 h-3.5" />
              {daysUntil === 0 ? "Today!" : daysUntil === 1 ? "Tomorrow" : `${daysUntil} days away`}
            </div>
          )}
          <span className="text-blue-400 text-sm font-bold uppercase tracking-widest block mb-2">{event.category}</span>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 max-w-2xl">{event.title}</h1>
          <div className="flex flex-col md:flex-row gap-3 md:gap-8 text-gray-300 font-medium text-sm">
            <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-blue-400" /> {event.date} at {event.time}</span>
            <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-pink-400" /> {event.location}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">

        {/* LEFT: Content */}
        <div className="lg:col-span-2 space-y-10">

          {/* About */}
          <section>
            <h2 className="text-2xl font-bold mb-4">About the Event</h2>
            <p className="text-gray-400 text-lg leading-relaxed">{event.description}</p>
          </section>

          {/* Live viewers alert */}
          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-400">
            <Eye className="w-5 h-5 flex-shrink-0 animate-pulse" />
            <span className="font-bold">{viewers} people are viewing this right now</span>
          </div>

          {/* Venue map */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-500" /> Venue Map
              </h3>
              <div className="text-xs text-gray-500 flex gap-4 font-bold uppercase">
                <span className="flex items-center gap-2"><div className="w-3 h-3 bg-pink-500 rounded-full" /> VIP</span>
                <span className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 rounded-full" /> Regular</span>
              </div>
            </div>
            <div className="relative w-full max-w-lg mx-auto">
              <div className="w-3/4 mx-auto h-14 bg-gray-800 rounded-t-3xl border-t-4 border-purple-500 flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(168,85,247,0.15)]">
                <span className="text-xs font-bold uppercase tracking-[0.3em] text-purple-400">Main Stage</span>
              </div>
              <div
                onClick={() => setSelectedTicket("vip")}
                className={`w-2/3 mx-auto h-20 mb-4 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-105 border-2 ${
                  selectedTicket === "vip"
                    ? "bg-pink-500/20 border-pink-500 shadow-[0_0_25px_rgba(236,72,153,0.4)]"
                    : "bg-white/5 border-white/10 hover:border-pink-500/50"
                }`}
              >
                <div className="text-center">
                  <span className={`block font-bold ${selectedTicket === "vip" ? "text-pink-400" : "text-gray-400"}`}>Golden Circle (VIP)</span>
                  <span className="text-xs text-gray-500">Front Row Experience</span>
                </div>
              </div>
              <div
                onClick={() => setSelectedTicket("regular")}
                className={`w-full h-28 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-105 border-2 ${
                  selectedTicket === "regular"
                    ? "bg-blue-500/20 border-blue-500 shadow-[0_0_25px_rgba(59,130,246,0.4)]"
                    : "bg-white/5 border-white/10 hover:border-blue-500/50"
                }`}
              >
                <div className="text-center">
                  <span className={`block font-bold ${selectedTicket === "regular" ? "text-blue-400" : "text-gray-400"}`}>General Admission</span>
                  <span className="text-xs text-gray-500">Standing / Seating Area</span>
                </div>
              </div>
            </div>
            <p className="text-center text-xs text-gray-500 mt-6 flex items-center justify-center gap-2">
              <Info className="w-4 h-4" /> Tap a zone to select your ticket type
            </p>
          </div>

          <ReviewSection />
        </div>

        {/* RIGHT: Sticky sidebar */}
        <div className="space-y-5 lg:sticky lg:top-24 h-fit">

          {/* Ticket selector card */}
          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl shadow-xl">
            {isSurge && (
              <div className="mb-5 bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-xl flex items-start gap-3">
                <div className="bg-yellow-500 p-1.5 rounded-lg text-black mt-0.5 flex-shrink-0">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-yellow-400 font-bold text-sm">High Demand — Prices Up 20%</h4>
                  <p className="text-yellow-200/60 text-xs mt-1">Price will drop when demand normalises.</p>
                </div>
              </div>
            )}

            <h3 className="text-xl font-bold mb-5">Select Ticket</h3>

            {/* Regular */}
            <div
              onClick={() => setSelectedTicket("regular")}
              className={`mb-3 p-4 rounded-xl border cursor-pointer transition-all relative ${
                selectedTicket === "regular"
                  ? "border-blue-500 bg-blue-500/10"
                  : "border-white/10 hover:border-white/30 hover:bg-white/5"
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-bold block">Regular Admission</span>
                  <span className="text-xs text-gray-500">General access</span>
                </div>
                <div className="text-right">
                  {isSurge && <span className="block text-xs text-gray-500 line-through">KES {event.basePrice.toLocaleString()}</span>}
                  <span className={`font-bold ${isSurge ? "text-yellow-400" : "text-blue-400"}`}>
                    {event.basePrice === 0 ? "Free" : `KES ${regularPrice.toLocaleString()}`}
                  </span>
                </div>
              </div>
              {selectedTicket === "regular" && <CheckCircle2 className="absolute top-4 right-4 text-blue-500 w-5 h-5" />}
            </div>

            {/* VIP */}
            <div
              onClick={() => setSelectedTicket("vip")}
              className={`mb-6 p-4 rounded-xl border cursor-pointer transition-all relative ${
                selectedTicket === "vip"
                  ? "border-pink-500 bg-pink-500/10"
                  : "border-white/10 hover:border-white/30 hover:bg-white/5"
              }`}
            >
              <div className="absolute -top-3 left-4 bg-gradient-to-r from-pink-600 to-purple-600 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded text-white font-bold">
                {event.tag}
              </div>
              <div className="flex justify-between items-center mt-1">
                <div>
                  <span className="font-bold text-lg block">VIP Experience</span>
                  <span className="text-xs text-gray-500">Front row + perks</span>
                </div>
                <div className="text-right">
                  {isSurge && <span className="block text-xs text-gray-500 line-through">KES {event.baseVipPrice.toLocaleString()}</span>}
                  <span className={`font-bold text-xl ${isSurge ? "text-yellow-400" : "text-pink-400"}`}>KES {vipPrice.toLocaleString()}</span>
                </div>
              </div>
              {selectedTicket === "vip" && <CheckCircle2 className="absolute top-4 right-4 text-pink-500 w-5 h-5" />}
            </div>

            {/* Quantity */}
            <div className="flex items-center justify-between mb-5 bg-black/40 p-4 rounded-xl border border-white/10">
              <div>
                <span className="text-gray-400 font-bold text-sm block">Quantity</span>
                <span className="text-xs text-gray-600">Max 10 per order</span>
              </div>
              <div className="flex items-center gap-4">
                <button onClick={() => handleQuantity("dec")} className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition active:scale-95 disabled:opacity-40" disabled={quantity === 1}>
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-bold text-2xl w-8 text-center">{quantity}</span>
                <button onClick={() => handleQuantity("inc")} className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition active:scale-95 disabled:opacity-40" disabled={quantity === 10}>
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Total & CTA */}
            <div className="flex justify-between items-center mb-4 text-sm">
              <span className="text-gray-400">{quantity} × {selectedTicket} ticket{quantity > 1 ? "s" : ""}</span>
              <span className="font-bold text-lg">KES {totalPrice.toLocaleString()}</span>
            </div>

            <Link href={checkoutUrl}>
              <button className={`w-full text-white font-bold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95 ${
                isSurge ? "bg-yellow-600 hover:bg-yellow-700 shadow-yellow-600/20" : "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20"
              }`}>
                {isSurge && <AlertTriangle className="w-5 h-5" />}
                Pay KES {totalPrice.toLocaleString()} →
              </button>
            </Link>

            <p className="text-center text-xs text-gray-600 mt-3 flex items-center justify-center gap-1">
              <span>🔒</span> Secure M-Pesa checkout
            </p>
          </div>

          {/* Share card */}
          <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
            <h3 className="text-sm font-bold text-gray-400 mb-4 flex items-center gap-2">
              <Share2 className="w-4 h-4" /> Share this Event
            </h3>
            <div className="flex gap-2">
              <button onClick={() => handleShare("whatsapp")} className="flex-1 bg-green-600/10 hover:bg-green-600/20 text-green-500 py-3 rounded-xl flex items-center justify-center transition border border-green-600/20 hover:border-green-600/40">
                <MessageCircle className="w-5 h-5" />
              </button>
              <button onClick={() => handleShare("twitter")} className="flex-1 bg-blue-400/10 hover:bg-blue-400/20 text-blue-400 py-3 rounded-xl flex items-center justify-center transition border border-blue-400/20 hover:border-blue-400/40">
                <Twitter className="w-5 h-5" />
              </button>
              <button onClick={() => handleShare("copy")} className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl flex items-center justify-center transition border border-white/10">
                {copied ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
