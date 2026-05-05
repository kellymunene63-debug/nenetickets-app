"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Calculator, CheckCircle2, ArrowRight, Zap, Shield,
  Clock, Banknote, Ticket, TrendingUp, Users, Star,
  ChevronDown, ChevronUp, AlertCircle, Gift,
} from "lucide-react";

const faqs = [
  {
    q: "When do I receive my payout?",
    a: "Payouts are processed within 24–48 hours after each ticket sale, directly to your registered bank account via Paystack.",
  },
  {
    q: "Are there any hidden fees?",
    a: "None. For paid events, the 5% platform fee is the only deduction from your ticket revenue. For free events, a flat KES 5,000 listing fee applies per event. What you see is exactly what you get.",
  },
  {
    q: "Who pays the 3% booking fee?",
    a: "The booking fee is paid by the ticket buyer on top of the ticket price you set. It does not come out of your earnings.",
  },
  {
    q: "Is the booking fee refundable?",
    a: "No. The 3% booking fee is non-refundable. It covers payment processing and platform costs which are incurred at the time of purchase regardless of what happens later.",
  },
  {
    q: "What if my event is cancelled or I issue a refund?",
    a: "Refunds are paid out from the organizer's earnings — not from the booking fee. Buyers receive back the ticket price they paid, but the 3% booking fee is retained as it covers costs already incurred.",
  },
  {
    q: "How does the KES 5,000 free-event fee work?",
    a: "If you're hosting a free event (KES 0 tickets), a flat listing fee of KES 5,000 is charged per event before it goes live. This covers promotion, listing, and platform infrastructure for events with no ticket revenue.",
  },
  {
    q: "Is there a minimum ticket price for paid events?",
    a: "Yes. For paid events, the minimum ticket price is KES 100.",
  },
  {
    q: "Do I need a Paystack account?",
    a: "No. We handle the Paystack setup for you during organizer signup — you just need your bank details.",
  },
];

export default function PricingPage() {
  const [ticketPrice,  setTicketPrice]  = useState(2000);
  const [ticketCount,  setTicketCount]  = useState(100);
  const [openFaq,      setOpenFaq]      = useState<number | null>(null);

  const grossRevenue   = ticketPrice * ticketCount;
  const platformFee    = grossRevenue * 0.05;
  const organizerEarns = grossRevenue * 0.95;

  const buyerBookingFee = ticketPrice * 0.03;
  const buyerTotal      = ticketPrice + buyerBookingFee;

  const fmt = (n: number) =>
    "KES " + Math.round(n).toLocaleString("en-KE");

  return (
    <main className="min-h-screen bg-[#050511] text-white">

      {/* ── Nav ─────────────────────────────────────────────────────── */}
      <nav className="border-b border-white/10 bg-black/40 backdrop-blur sticky top-0 z-20">
        <div className="container mx-auto px-4 py-4 max-w-6xl flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Ticket className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg">NeneTickets</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm text-gray-400 hover:text-white transition hidden sm:block">
              Browse Events
            </Link>
            <Link
              href="/host"
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-4 py-2 rounded-xl transition"
            >
              Start Selling
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section className="container mx-auto px-4 pt-20 pb-12 max-w-4xl text-center">
        <div className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-600/20 text-blue-400 text-xs font-bold px-3 py-1.5 rounded-full mb-6">
          <Zap className="w-3.5 h-3.5" /> Simple, transparent pricing
        </div>
        <h1 className="text-4xl md:text-6xl font-black mb-5 leading-tight">
          You Keep{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
            95%
          </span>{" "}
          of Every Ticket
        </h1>
        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
          We charge a flat 5% fee on paid ticket sales. Free events pay a one-time
          KES 5,000 listing fee. The 3% booking fee is paid by your buyers and is non-refundable.
        </p>
      </section>

      {/* ── Fee cards ───────────────────────────────────────────────── */}
      <section className="container mx-auto px-4 pb-16 max-w-6xl">
        <div className="grid md:grid-cols-3 gap-6">

          {/* Paid events card */}
          <div className="bg-white/5 border border-blue-500/30 rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-600/10 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="relative">
              <div className="w-12 h-12 bg-blue-600/20 border border-blue-500/30 rounded-2xl flex items-center justify-center mb-5">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <div className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-2">
                Paid Events
              </div>
              <div className="flex items-end gap-2 mb-1">
                <span className="text-5xl font-black">5%</span>
                <span className="text-gray-400 pb-2">per ticket sold</span>
              </div>
              <p className="text-gray-500 text-sm mb-6">
                Deducted from your ticket revenue. You receive 95% directly to
                your bank account per sale.
              </p>
              <ul className="space-y-3">
                {[
                  "No setup or registration fees",
                  "No monthly subscription",
                  "Direct bank payouts via Paystack",
                  "24–48 hr settlement after each sale",
                  "Refunds paid from your earnings",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-gray-300">
                    <CheckCircle2 className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Free events card */}
          <div className="bg-white/5 border border-green-500/30 rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-green-600/10 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="relative">
              <div className="w-12 h-12 bg-green-600/20 border border-green-500/30 rounded-2xl flex items-center justify-center mb-5">
                <Gift className="w-6 h-6 text-green-400" />
              </div>
              <div className="text-xs font-bold uppercase tracking-widest text-green-400 mb-2">
                Free Events
              </div>
              <div className="flex items-end gap-2 mb-1">
                <span className="text-5xl font-black">5K</span>
                <span className="text-gray-400 pb-2">flat per event</span>
              </div>
              <p className="text-gray-500 text-sm mb-6">
                Hosting a free event? A one-time KES 5,000 listing fee applies
                before your event goes live.
              </p>
              <ul className="space-y-3">
                {[
                  "KES 5,000 charged once per event",
                  "No per-ticket fee (tickets are free)",
                  "Full event listing & QR check-in",
                  "Paid before admin approval",
                  "No booking fee charged to attendees",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-gray-300">
                    <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Buyer card */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-purple-600/10 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="relative">
              <div className="w-12 h-12 bg-purple-600/20 border border-purple-500/30 rounded-2xl flex items-center justify-center mb-5">
                <Ticket className="w-6 h-6 text-purple-400" />
              </div>
              <div className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-2">
                For Ticket Buyers
              </div>
              <div className="flex items-end gap-2 mb-1">
                <span className="text-5xl font-black">3%</span>
                <span className="text-gray-400 pb-2">booking fee</span>
              </div>
              <p className="text-gray-500 text-sm mb-6">
                A small booking fee added at checkout. Covers payment processing
                and platform infrastructure.
              </p>
              <ul className="space-y-3">
                {[
                  "Shown clearly before payment",
                  "Covers secure Paystack processing",
                  "Instant ticket confirmation via email",
                  "QR code ticket delivery",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-gray-300">
                    <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
                <li className="flex items-start gap-2.5 text-sm text-amber-400/80">
                  <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  Booking fee is non-refundable
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Refund policy notice */}
        <div className="mt-6 bg-amber-500/5 border border-amber-500/20 rounded-2xl px-6 py-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-200/70 leading-relaxed">
            <strong className="text-amber-300">Refund policy:</strong> When an organizer cancels an event or issues a refund,
            the ticket price is refunded from the organizer&apos;s earnings. The 3% booking fee paid by the buyer
            is <strong className="text-amber-300">non-refundable</strong> as it covers costs already incurred during the transaction.
          </p>
        </div>
      </section>

      {/* ── Calculator ──────────────────────────────────────────────── */}
      <section className="container mx-auto px-4 pb-20 max-w-3xl">
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-10">
          <div className="flex items-center gap-3 mb-2">
            <Calculator className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-black">Run the Numbers</h2>
          </div>
          <p className="text-gray-500 text-sm mb-8">
            Adjust the sliders to see exactly what you and your buyers pay.
          </p>

          {/* Ticket price slider */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400">
                Ticket Price
              </label>
              <span className="text-2xl font-black text-white">
                KES {ticketPrice.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min={100}
              max={50000}
              step={100}
              value={ticketPrice}
              onChange={(e) => setTicketPrice(Number(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-xs text-gray-600 mt-1.5">
              <span>KES 100</span><span>KES 50,000</span>
            </div>
          </div>

          {/* Ticket count slider */}
          <div className="mb-10">
            <div className="flex justify-between items-center mb-3">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400">
                Tickets Sold
              </label>
              <span className="text-2xl font-black text-white">
                {ticketCount.toLocaleString()} tickets
              </span>
            </div>
            <input
              type="range"
              min={10}
              max={5000}
              step={10}
              value={ticketCount}
              onChange={(e) => setTicketCount(Number(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-xs text-gray-600 mt-1.5">
              <span>10</span><span>5,000</span>
            </div>
          </div>

          {/* Results */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-black/40 rounded-2xl p-5 border border-white/5">
              <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                Gross Revenue
              </div>
              <div className="text-xl font-black text-white">{fmt(grossRevenue)}</div>
              <div className="text-xs text-gray-600 mt-1">
                {ticketCount.toLocaleString()} × KES {ticketPrice.toLocaleString()}
              </div>
            </div>

            <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-5">
              <div className="text-xs font-bold uppercase tracking-wider text-green-400 mb-1.5">
                You Receive
              </div>
              <div className="text-xl font-black text-white">{fmt(organizerEarns)}</div>
              <div className="text-xs text-green-600 mt-1">95% of gross revenue</div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-5">
              <div className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-1.5">
                Platform Fee
              </div>
              <div className="text-xl font-black text-white">{fmt(platformFee)}</div>
              <div className="text-xs text-blue-600 mt-1">5% of gross revenue</div>
            </div>
          </div>

          {/* Buyer view */}
          <div className="bg-purple-500/5 border border-purple-500/20 rounded-2xl p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-3">
              What your buyer pays per ticket
            </div>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="text-sm text-gray-500">Ticket price</div>
                <div className="text-lg font-bold">KES {ticketPrice.toLocaleString()}</div>
              </div>
              <div className="text-gray-600 text-xl">+</div>
              <div>
                <div className="text-sm text-gray-500">Booking fee (3%)</div>
                <div className="text-lg font-bold text-purple-400">
                  KES {Math.round(buyerBookingFee).toLocaleString()}
                </div>
              </div>
              <div className="text-gray-600 text-xl">=</div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Buyer total</div>
                <div className="text-2xl font-black">
                  KES {Math.round(buyerTotal).toLocaleString()}
                </div>
              </div>
            </div>
            <p className="text-xs text-amber-400/60 mt-3">
              * The 3% booking fee is non-refundable
            </p>
          </div>
        </div>
      </section>

      {/* ── Value props ─────────────────────────────────────────────── */}
      <section className="border-t border-white/5 bg-white/[0.02]">
        <div className="container mx-auto px-4 py-20 max-w-5xl">
          <h2 className="text-3xl font-black text-center mb-12">
            Why Organizers Choose NeneTickets
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Banknote,
                color: "green",
                title: "Direct Payouts",
                desc: "Money goes straight to your bank account — no waiting for us to release funds.",
              },
              {
                icon: Shield,
                color: "blue",
                title: "Admin Verified",
                desc: "Every event is reviewed before going live, protecting your brand and your buyers.",
              },
              {
                icon: Clock,
                color: "yellow",
                title: "24–48hr Settlement",
                desc: "Fast settlements so your cash flow keeps up with your event.",
              },
              {
                icon: TrendingUp,
                color: "purple",
                title: "No Hidden Charges",
                desc: "5% on paid tickets, KES 5,000 flat for free events. No monthly fees, no withdrawal fees.",
              },
            ].map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className={`w-10 h-10 bg-${color}-500/10 border border-${color}-500/20 rounded-xl flex items-center justify-center mb-4`}>
                  <Icon className={`w-5 h-5 text-${color}-400`} />
                </div>
                <h3 className="font-bold mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Comparison ──────────────────────────────────────────────── */}
      <section className="container mx-auto px-4 py-20 max-w-3xl">
        <h2 className="text-3xl font-black text-center mb-3">
          How We Compare
        </h2>
        <p className="text-gray-500 text-center text-sm mb-10">
          NeneTickets is built for the Kenyan market — local banks, local support, local prices.
        </p>
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="grid grid-cols-3 bg-white/5 border-b border-white/10">
            <div className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500">Feature</div>
            <div className="p-4 text-xs font-bold uppercase tracking-wider text-blue-400 text-center border-l border-white/10">NeneTickets</div>
            <div className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500 text-center border-l border-white/10">Others</div>
          </div>
          {[
            ["Organizer fee (paid events)", "5%",                   "8–12%"],
            ["Free event fee",              "KES 5,000 flat",       "Often % per RSVP"],
            ["Setup cost",                  "Free",                 "Paid plans"],
            ["Monthly subscription",        "None",                 "Often required"],
            ["Local bank payouts",          "✓ Yes",                "Limited"],
            ["Admin event review",          "✓ Included",           "Rarely"],
            ["Refund source",               "Organizer earnings",   "Varies"],
            ["Kenya-specific support",      "✓ Local team",         "International only"],
          ].map(([feature, ours, theirs], i) => (
            <div key={feature} className={`grid grid-cols-3 border-b border-white/5 ${i % 2 === 0 ? "" : "bg-white/[0.02]"}`}>
              <div className="p-4 text-sm text-gray-400">{feature}</div>
              <div className="p-4 text-sm font-bold text-green-400 text-center border-l border-white/5">{ours}</div>
              <div className="p-4 text-sm text-gray-600 text-center border-l border-white/5">{theirs}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────── */}
      <section className="border-t border-white/5 bg-white/[0.02]">
        <div className="container mx-auto px-4 py-20 max-w-2xl">
          <h2 className="text-3xl font-black text-center mb-3">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-500 text-center text-sm mb-10">
            Still have questions? Reach us at{" "}
            <a href="mailto:hello@nenetickets.co.ke" className="text-blue-400 hover:underline">
              hello@nenetickets.co.ke
            </a>
          </p>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-white/5 transition"
                >
                  <span className="font-semibold text-sm pr-4">{faq.q}</span>
                  {openFaq === i
                    ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  }
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 text-sm text-gray-400 leading-relaxed border-t border-white/5 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────── */}
      <section className="container mx-auto px-4 py-20 max-w-3xl text-center">
        <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/10 border border-blue-500/20 rounded-3xl p-12">
          <Star className="w-10 h-10 text-blue-400 mx-auto mb-5" />
          <h2 className="text-3xl md:text-4xl font-black mb-4">
            Ready to Sell Tickets?
          </h2>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            Create your organizer account in minutes. No fees until you start selling.
          </p>
          <Link
            href="/host"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-2xl transition text-lg"
          >
            Get Started Free <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-gray-600 text-xs mt-4">
            No credit card required · Approved within 24 hours
          </p>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer className="border-t border-white/10 py-8">
        <div className="container mx-auto px-4 max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-600">
          <span>© 2026 NeneTickets. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-gray-400 transition">Terms</Link>
            <Link href="/privacy" className="hover:text-gray-400 transition">Privacy</Link>
            <Link href="/about" className="hover:text-gray-400 transition">About</Link>
          </div>
        </div>
      </footer>

    </main>
  );
}
