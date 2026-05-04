"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar, MapPin, Clock, Tag, Share2, Users,
  ChevronRight, Plus, Minus, Ticket, AlertTriangle,
  Copy, Check, Twitter, Facebook, MessageCircle,
  ExternalLink, ChevronLeft, Eye,
} from "lucide-react";
import Navbar from "../shared/Navbar";
import ReviewSection from "../ReviewSection";
import type { EventData, CapacityData } from "../../app/event/[id]/page";

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatPrice(price: number): string {
  if (price === 0) return "FREE";
  return `KES ${price.toLocaleString("en-KE")}`;
}

function formatPriceShort(price: number): string {
  if (price === 0) return "Free";
  return `KES ${price.toLocaleString("en-KE")}`;
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  event: EventData;
  capacityData: CapacityData;
  recommendations: EventData[];
  eventId: string;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function EventPageClient({ event, capacityData, recommendations, eventId }: Props) {
  const router = useRouter();

  // ── Ticket selection ───────────────────────────────────────────────────────
  // Build the list of selectable ticket types
  const ticketOptions: { name: string; price: number; soldOut: boolean; available: number }[] = (() => {
    if (event.ticketTypes && event.ticketTypes.length > 0) {
      return event.ticketTypes.map((t) => {
        const cap = capacityData[t.name];
        return {
          name: t.name,
          price: t.price,
          soldOut: cap ? cap.soldOut : false,
          available: cap ? cap.available : 999,
        };
      });
    }
    // Static event — regular + VIP
    const options = [];
    if (event.basePrice >= 0) {
      options.push({ name: "Regular", price: event.basePrice, soldOut: false, available: 999 });
    }
    if (event.baseVipPrice > 0) {
      options.push({ name: "VIP", price: event.baseVipPrice, soldOut: false, available: 999 });
    }
    return options;
  })();

  const firstAvailable = ticketOptions.find((t) => !t.soldOut) ?? ticketOptions[0];
  const [selectedTicketName, setSelectedTicketName] = useState(firstAvailable?.name ?? "");
  const [quantity, setQuantity] = useState(1);

  const selectedTicket = ticketOptions.find((t) => t.name === selectedTicketName) ?? ticketOptions[0];
  const total = (selectedTicket?.price ?? 0) * quantity;
  const maxQty = Math.min(10, selectedTicket?.available ?? 10);

  // ── Viewers ────────────────────────────────────────────────────────────────
  const [viewers, setViewers] = useState<number | null>(null);

  useEffect(() => {
    // Record this visit + get initial count
    fetch(`/api/viewers/${eventId}`, { method: "POST" })
      .then((r) => r.json())
      .then((d: { count: number }) => setViewers(d.count))
      .catch(() => {});

    // Poll every 30 s
    const interval = setInterval(() => {
      fetch(`/api/viewers/${eventId}`)
        .then((r) => r.json())
        .then((d: { count: number }) => setViewers(d.count))
        .catch(() => {});
    }, 30_000);

    return () => clearInterval(interval);
  }, [eventId]);

  // ── Share menu ─────────────────────────────────────────────────────────────
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const pageUrl = typeof window !== "undefined" ? window.location.href : `https://nenetickets.co.ke/event/${eventId}`;
  const shareText = `Check out ${event.title} on NeneTickets! 🎟`;

  const copyLink = useCallback(() => {
    navigator.clipboard.writeText(pageUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [pageUrl]);

  // ── Checkout ───────────────────────────────────────────────────────────────
  const handleCheckout = useCallback(() => {
    if (!selectedTicket || event.cancelled) return;

    // If image is base64, stash in sessionStorage and use sentinel in URL
    let imageParam = event.image;
    if (event.image?.startsWith("data:")) {
      try {
        sessionStorage.setItem(`nene_img_${eventId}`, event.image);
        imageParam = "__session__";
      } catch {
        imageParam = ""; // storage full — pass empty
      }
    }

    const params = new URLSearchParams({
      title:    event.title,
      type:     selectedTicket.name,
      price:    String(selectedTicket.price),
      quantity: String(quantity),
      date:     event.date,
      time:     event.time,
      location: event.location,
      eventId,
      image:    imageParam,
    });

    router.push(`/checkout?${params.toString()}`);
  }, [selectedTicket, quantity, event, eventId, router]);

  // ── Tag colour ─────────────────────────────────────────────────────────────
  const tagColour = (() => {
    const t = (event.tag ?? "").toUpperCase();
    if (t.includes("FREE"))    return "bg-green-500/20 text-green-400 border-green-500/30";
    if (t.includes("SOLD"))    return "bg-red-500/20 text-red-400 border-red-500/30";
    if (t.includes("FAST") || t.includes("HOT") || t.includes("HIGH"))
                               return "bg-orange-500/20 text-orange-400 border-orange-500/30";
    if (t.includes("GLOBAL") || t.includes("MUST") || t.includes("TREND"))
                               return "bg-purple-500/20 text-purple-400 border-purple-500/30";
    return "bg-blue-500/20 text-blue-400 border-blue-500/30";
  })();

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="relative w-full h-64 sm:h-80 md:h-96 lg:h-[420px] overflow-hidden">
        <Image
          src={event.image?.startsWith("data:") ? event.image : (event.image || "/placeholder.jpg")}
          alt={event.title}
          fill
          priority
          className="object-cover"
          unoptimized={event.image?.startsWith("data:")}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="absolute top-20 left-4 md:left-8 flex items-center gap-2 bg-black/60 hover:bg-black/80 backdrop-blur-sm text-white text-sm font-bold px-4 py-2 rounded-full border border-white/10 transition"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>

        {/* Tag + Share row */}
        <div className="absolute top-20 right-4 md:right-8 flex items-center gap-2">
          {event.tag && (
            <span className={`text-xs font-bold px-3 py-1.5 rounded-full border uppercase tracking-wider ${tagColour}`}>
              {event.tag}
            </span>
          )}
          <div className="relative">
            <button
              onClick={() => setShareOpen((v) => !v)}
              className="flex items-center gap-1.5 bg-black/60 hover:bg-black/80 backdrop-blur-sm text-white text-sm font-bold px-4 py-2 rounded-full border border-white/10 transition"
            >
              <Share2 className="w-4 h-4" /> Share
            </button>
            {shareOpen && (
              <div className="absolute right-0 top-12 w-56 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50">
                <button onClick={copyLink} className="flex items-center gap-3 w-full px-4 py-3 hover:bg-white/5 transition text-sm">
                  {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
                  {copied ? "Copied!" : "Copy link"}
                </button>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(pageUrl)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 w-full px-4 py-3 hover:bg-white/5 transition text-sm"
                >
                  <Twitter className="w-4 h-4 text-sky-400" /> Share on X
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 w-full px-4 py-3 hover:bg-white/5 transition text-sm"
                >
                  <Facebook className="w-4 h-4 text-blue-500" /> Share on Facebook
                </a>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(shareText + " " + pageUrl)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 w-full px-4 py-3 hover:bg-white/5 transition text-sm"
                >
                  <MessageCircle className="w-4 h-4 text-green-400" /> Share on WhatsApp
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Title + meta overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 px-4 md:px-8 pb-6">
          <div className="max-w-5xl mx-auto">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2 block">
              {event.category}
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black leading-tight mb-3 drop-shadow-lg">
              {event.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-blue-400" /> {event.date}
              </span>
              {event.time && (
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-blue-400" /> {event.time}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-blue-400" /> {event.location}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Cancelled banner ─────────────────────────────────────────────── */}
      {event.cancelled && (
        <div className="bg-red-900/40 border-y border-red-500/30 px-4 md:px-8 py-4">
          <div className="max-w-5xl mx-auto flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-red-300">This event has been cancelled</p>
              {event.cancelReason && (
                <p className="text-sm text-red-400/80 mt-1">{event.cancelReason}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Body ──────────────────────────────────────────────────────────── */}
      {/* On mobile: About → Ticket Sidebar → Reviews
          On desktop: [About / Map] [Sidebar (row-span-2)]
                      [Reviews]      ^same sidebar^ */}
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-10">

        {/* Click outside share menu */}
        {shareOpen && (
          <div className="fixed inset-0 z-40" onClick={() => setShareOpen(false)} />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">

          {/* ── Left col: About + Map ──────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-8">

            {/* Viewers badge */}
            {viewers !== null && viewers > 1 && (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Eye className="w-4 h-4 text-blue-400 animate-pulse" />
                <span>
                  <span className="font-bold text-white">{viewers}</span> people viewing this event right now
                </span>
              </div>
            )}

            {/* About */}
            <div>
              <h2 className="text-xl font-bold mb-4">About this Event</h2>
              <p className="text-gray-300 leading-relaxed whitespace-pre-line">{event.description}</p>
            </div>

            {/* Event details cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Date & Time</p>
                  <p className="font-bold">{event.date}</p>
                  {event.time && <p className="text-sm text-gray-400">{event.time}</p>}
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Location</p>
                  <p className="font-bold">{event.location}</p>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(event.location + ", Nairobi, Kenya")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-400 hover:underline flex items-center gap-1 mt-1"
                  >
                    View on map <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* Google Maps embed */}
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <div className="px-5 pt-5 pb-3 flex items-center justify-between">
                <h3 className="font-bold text-sm">Venue Map</h3>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(event.location + ", Kenya")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-400 hover:underline flex items-center gap-1"
                >
                  Open in Google Maps <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <iframe
                title={`Map for ${event.location}`}
                width="100%"
                height="240"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(event.location + ", Kenya")}&output=embed&z=14`}
              />
            </div>
          </div>

          {/* ── Right col: Ticket Sidebar (spans 2 rows on desktop) ────── */}
          <div className="lg:row-span-2">
            <div className="sticky top-24 space-y-4">

              {/* Pricing summary */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold">Get Tickets</h2>
                  {viewers !== null && viewers > 1 && (
                    <span className="flex items-center gap-1 text-xs text-orange-400 font-bold">
                      <Users className="w-3.5 h-3.5" />
                      {viewers} viewing
                    </span>
                  )}
                </div>

                {/* Starting price */}
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Starting from</p>
                  <p className="text-3xl font-black">
                    {formatPrice(selectedTicket?.price ?? event.basePrice)}
                  </p>
                </div>

                {/* Ticket type selection */}
                {ticketOptions.length > 1 && (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Ticket Type</p>
                    <div className="space-y-2">
                      {ticketOptions.map((opt) => (
                        <button
                          key={opt.name}
                          onClick={() => !opt.soldOut && setSelectedTicketName(opt.name)}
                          disabled={opt.soldOut}
                          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-bold transition
                            ${opt.soldOut ? "opacity-40 cursor-not-allowed border-white/5 bg-white/5" : ""}
                            ${selectedTicketName === opt.name && !opt.soldOut
                              ? "border-blue-500 bg-blue-600/20 text-white"
                              : !opt.soldOut
                                ? "border-white/10 bg-white/5 hover:border-white/20 text-gray-300"
                                : ""
                            }`}
                        >
                          <span className="flex items-center gap-2">
                            <Ticket className="w-4 h-4" />
                            {opt.name}
                          </span>
                          <span>{opt.soldOut ? "Sold Out" : formatPriceShort(opt.price)}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity */}
                {!event.cancelled && selectedTicket && !selectedTicket.soldOut && (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Quantity</p>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        disabled={quantity <= 1}
                        className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-xl font-bold w-8 text-center">{quantity}</span>
                      <button
                        onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                        disabled={quantity >= maxQty}
                        className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <span className="text-xs text-gray-500 ml-1">
                        {selectedTicket.available < 999
                          ? `${selectedTicket.available} left`
                          : "Max 10"}
                      </span>
                    </div>
                  </div>
                )}

                {/* Total + CTA */}
                {!event.cancelled && selectedTicket && (
                  <>
                    {selectedTicket.soldOut ? (
                      <div className="bg-red-900/20 border border-red-500/20 rounded-xl px-4 py-3 text-center">
                        <p className="text-red-400 font-bold text-sm">This ticket type is sold out</p>
                      </div>
                    ) : (
                      <>
                        {total > 0 && (
                          <div className="flex items-center justify-between text-sm pt-2 border-t border-white/10">
                            <span className="text-gray-400">
                              {quantity} × {formatPriceShort(selectedTicket.price)}
                            </span>
                            <span className="font-bold text-white text-base">
                              KES {total.toLocaleString("en-KE")}
                            </span>
                          </div>
                        )}
                        <button
                          onClick={handleCheckout}
                          className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-black py-4 rounded-xl transition shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] flex items-center justify-center gap-2"
                        >
                          <Ticket className="w-5 h-5" />
                          {total === 0 ? "Get Free Ticket" : `Buy Ticket — KES ${total.toLocaleString("en-KE")}`}
                        </button>
                        <p className="text-center text-xs text-gray-600">
                          Secure checkout · Instant e-ticket delivery
                        </p>
                      </>
                    )}
                  </>
                )}

                {event.cancelled && (
                  <div className="bg-red-900/20 border border-red-500/20 rounded-xl px-4 py-4 text-center">
                    <AlertTriangle className="w-5 h-5 text-red-400 mx-auto mb-2" />
                    <p className="text-red-300 font-bold text-sm">Ticket sales closed</p>
                    <p className="text-red-400/70 text-xs mt-1">This event has been cancelled</p>
                  </div>
                )}
              </div>

              {/* Capacity breakdown (hosted events only) */}
              {Object.keys(capacityData).length > 0 && (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Availability</h3>
                  {Object.entries(capacityData).map(([name, data]) => {
                    const pct = data.capacity > 0 ? Math.min(100, (data.sold / data.capacity) * 100) : 0;
                    return (
                      <div key={name}>
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="font-bold text-gray-300">{name}</span>
                          <span className={data.soldOut ? "text-red-400 font-bold" : "text-gray-500"}>
                            {data.soldOut ? "Sold Out" : `${data.available} left`}
                          </span>
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-orange-500" : "bg-blue-500"
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Share card (desktop only) */}
              <div className="hidden lg:block bg-white/5 border border-white/10 rounded-2xl p-5">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Share this Event</h3>
                <div className="flex gap-2">
                  <button
                    onClick={copyLink}
                    className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-2.5 text-xs font-bold transition"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "Copied!" : "Copy"}
                  </button>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(shareText + " " + pageUrl)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-2.5 text-xs font-bold transition"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-green-400" /> WhatsApp
                  </a>
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(pageUrl)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-2.5 text-xs font-bold transition"
                  >
                    <Twitter className="w-3.5 h-3.5 text-sky-400" /> X
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* ── Reviews (row 2, left col on desktop) ──────────────────── */}
          <div className="lg:col-span-2">
            <ReviewSection eventId={eventId} />
          </div>

        </div>

        {/* ── Recommendations ────────────────────────────────────────────── */}
        {recommendations.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">You might also like</h2>
              <Link href="/events" className="text-blue-400 hover:underline text-sm font-bold flex items-center gap-1">
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((rec) => (
                <Link
                  key={rec.id}
                  href={`/event/${rec.id}`}
                  className="group bg-white/5 border border-white/10 hover:border-white/20 rounded-2xl overflow-hidden transition hover:bg-white/[0.07]"
                >
                  <div className="relative h-44 overflow-hidden">
                    <Image
                      src={rec.image?.startsWith("data:") ? "/placeholder.jpg" : (rec.image || "/placeholder.jpg")}
                      alt={rec.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      unoptimized={false}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    {rec.tag && (
                      <span className="absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full bg-blue-600/80 text-white border border-blue-500/30">
                        {rec.tag}
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-blue-400 font-bold uppercase tracking-wider mb-1">{rec.category}</p>
                    <h3 className="font-bold leading-snug mb-2 group-hover:text-blue-400 transition line-clamp-2">
                      {rec.title}
                    </h3>
                    <div className="flex items-center justify-between text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> {rec.date}
                      </span>
                      <span className="font-bold text-white">
                        {formatPrice(rec.basePrice)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {rec.location}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
