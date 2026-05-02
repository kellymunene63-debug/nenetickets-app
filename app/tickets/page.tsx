"use client";

import Navbar from "../../components/shared/Navbar";
import { useEffect, useState } from "react";
import { Ticket, Calendar, MapPin, Download, Share2, MessageCircle, ChevronRight, Inbox } from "lucide-react";
import Link from "next/link";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";

interface PurchasedTicket {
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
  phone: string;
}

function QRCode({ value }: { value: string }) {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(value)}&color=111111&bgcolor=ffffff&margin=10`;
  return (
    <div style={{ background: "white", borderRadius: 8, padding: 6, display: "inline-block" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={qrUrl} alt={`QR code for ticket ${value}`} width={110} height={110} style={{ display: "block", borderRadius: 4 }} />
    </div>
  );
}

function TicketCard({ ticket }: { ticket: PurchasedTicket }) {
  const [expanded, setExpanded] = useState(false);

  const handleShare = () => {
    const text =
      `🎟 *NeneTickets — My Ticket*\n\n` +
      `*${ticket.title}*\n` +
      `📅 ${ticket.date} at ${ticket.time}\n` +
      `📍 ${ticket.location}\n\n` +
      `Ticket Type: ${ticket.type}\n` +
      `Quantity: ${ticket.quantity}\n` +
      `Ticket ID: *${ticket.id}*\n\n` +
      `Show this ID or QR code at the gate.\n` +
      `🔗 https://nenetickets.co.ke/tickets`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const isPast = new Date(ticket.date) < new Date();

  return (
    <div className={`bg-white/5 border rounded-2xl overflow-hidden transition-all ${isPast ? "border-white/5 opacity-60" : "border-white/10 hover:border-white/20"}`}>
      <div className="flex items-stretch">
        {/* Event image strip */}
        {ticket.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={ticket.image}
            alt={ticket.title}
            className="w-20 md:w-28 object-cover flex-shrink-0"
          />
        )}

        {/* Main content */}
        <div className="flex-1 p-4 md:p-5">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              {isPast && (
                <span className="text-xs bg-white/10 text-gray-500 px-2 py-0.5 rounded-full font-bold mr-2">Past</span>
              )}
              <span className="text-blue-400 text-xs font-bold uppercase tracking-wider capitalize">{ticket.type}</span>
            </div>
            <span className="text-xs text-gray-600 flex-shrink-0">#{ticket.id}</span>
          </div>

          <h3 className="font-bold text-white text-base leading-tight mb-2">{ticket.title}</h3>

          <div className="space-y-1 text-xs text-gray-400">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3 h-3 text-gray-600" /> {ticket.date} at {ticket.time}
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-gray-600" /> {ticket.location}
            </div>
          </div>
        </div>

        {/* Right: price + expand toggle */}
        <div className="flex flex-col items-end justify-between p-4 flex-shrink-0">
          <span className="text-sm font-bold text-white">KES {ticket.price.toLocaleString()}</span>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-blue-400 text-xs font-bold flex items-center gap-1 hover:text-blue-300 transition"
          >
            {expanded ? "Hide" : "View"} <ChevronRight className={`w-3 h-3 transition-transform ${expanded ? "rotate-90" : ""}`} />
          </button>
        </div>
      </div>

      {/* Expanded: QR + actions */}
      {expanded && (
        <div className="border-t border-dashed border-white/10 px-5 py-5 flex flex-col md:flex-row items-center gap-6">
          <div className="text-center">
            <QRCode value={ticket.id} />
            <p className="text-xs text-gray-500 mt-2 font-mono tracking-widest">{ticket.id}</p>
          </div>

          <div className="flex-1 space-y-3 w-full">
            <p className="text-xs text-gray-500 text-center md:text-left">
              Show this QR code at the venue gate. Each code is unique and can only be scanned once.
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-black/30 rounded-xl p-3">
                <p className="text-gray-500 mb-0.5">Quantity</p>
                <p className="font-bold">{ticket.quantity} ticket{ticket.quantity > 1 ? "s" : ""}</p>
              </div>
              <div className="bg-black/30 rounded-xl p-3">
                <p className="text-gray-500 mb-0.5">Purchased</p>
                <p className="font-bold">{new Date(ticket.purchasedAt).toLocaleDateString("en-KE", { day: "numeric", month: "short" })}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleShare}
                className="flex-1 flex items-center justify-center gap-1.5 bg-green-600/10 hover:bg-green-600/20 border border-green-600/20 text-green-400 py-2.5 rounded-xl text-xs font-bold transition"
              >
                <MessageCircle className="w-3.5 h-3.5" /> Share on WhatsApp
              </button>
              <button className="flex-1 flex items-center justify-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white py-2.5 rounded-xl text-xs font-bold transition">
                <Download className="w-3.5 h-3.5" /> Save Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MyTicketsPage() {
  const [tickets, setTickets] = useState<PurchasedTicket[]>([]);
  const [filter, setFilter] = useState<"upcoming" | "past" | "all">("upcoming");

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("nene_sold_tickets") ?? "[]");
      // Sort newest first
      stored.sort((a: PurchasedTicket, b: PurchasedTicket) =>
        new Date(b.purchasedAt).getTime() - new Date(a.purchasedAt).getTime()
      );
      setTickets(stored);
    } catch {
      setTickets([]);
    }
  }, []);

  const now = new Date();
  const filtered = tickets.filter((t) => {
    const isPast = new Date(t.date) < now;
    if (filter === "upcoming") return !isPast;
    if (filter === "past") return isPast;
    return true;
  });

  return (
    <main className="min-h-screen bg-[#050511] text-white">
      <Navbar />

      <SignedOut>
        <div className="min-h-screen flex items-center justify-center flex-col gap-4 text-center px-4 pt-20">
          <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center mb-2">
            <Ticket className="w-8 h-8 text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold">Sign in to see your tickets</h2>
          <p className="text-gray-400 max-w-sm">Your purchased tickets will appear here after you sign in.</p>
          <SignInButton mode="modal">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-bold transition mt-2">
              Sign In
            </button>
          </SignInButton>
        </div>
      </SignedOut>

      <SignedIn>
        <div className="container mx-auto px-4 pt-28 pb-16 max-w-2xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold">My Tickets</h1>
              <p className="text-gray-400 text-sm mt-1">{tickets.length} ticket{tickets.length !== 1 ? "s" : ""} total</p>
            </div>
            <Share2 className="w-5 h-5 text-gray-600" />
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 mb-6">
            {(["upcoming", "past", "all"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition capitalize ${
                  filter === f
                    ? "bg-blue-600 text-white"
                    : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Ticket list */}
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Inbox className="w-7 h-7 text-gray-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">
                {filter === "upcoming" ? "No upcoming tickets" : filter === "past" ? "No past events" : "No tickets yet"}
              </h3>
              <p className="text-gray-500 text-sm mb-6">
                {filter === "upcoming" ? "Browse events and grab your tickets!" : "Your ticket history will show up here."}
              </p>
              <Link href="/events">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-full font-bold transition text-sm">
                  Browse Events
                </button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} />
              ))}
            </div>
          )}
        </div>
      </SignedIn>
    </main>
  );
}
