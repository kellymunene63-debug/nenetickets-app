"use client";

import Navbar from "../../components/shared/Navbar";
import { useState } from "react";
import {
  ChevronDown, Mail, MessageCircle, Phone,
  Ticket, RefreshCw, CreditCard, ShieldCheck, HelpCircle, Send, CheckCircle2
} from "lucide-react";

const FAQS = [
  {
    category: "Tickets & Booking",
    icon: <Ticket className="w-4 h-4" />,
    items: [
      {
        q: "How do I receive my ticket after payment?",
        a: "Your ticket is delivered instantly to your email after a successful M-Pesa payment. You'll also find it in the My Tickets section of your account. You can download and print it or show the QR code directly from your phone at the venue.",
      },
      {
        q: "Can I transfer my ticket to someone else?",
        a: "Yes! Head to My Tickets, find the ticket you want to transfer, and use the Transfer option. You'll need the recipient's email address. Transfers are instant and completely free.",
      },
      {
        q: "How many tickets can I buy at once?",
        a: "You can purchase up to 10 tickets per order. If you need more for a group or corporate event, please contact our support team and we'll assist you directly.",
      },
      {
        q: "I bought the wrong ticket type — can I upgrade?",
        a: "Yes — contact us within 24 hours of purchase and we'll arrange an upgrade for you. You'll only pay the difference between ticket types. Upgrades are subject to availability.",
      },
    ],
  },
  {
    category: "Payments & Refunds",
    icon: <CreditCard className="w-4 h-4" />,
    items: [
      {
        q: "What payment methods do you accept?",
        a: "We currently accept M-Pesa (STK Push and Paybill). We're working on adding card payments soon. M-Pesa covers over 90% of Kenyan transactions so we made sure to get that right first.",
      },
      {
        q: "My M-Pesa was deducted but I didn't receive a ticket. What do I do?",
        a: "Don't worry — this occasionally happens due to network delays. Wait 5 minutes and check your email and the My Tickets page. If the ticket still hasn't arrived after 10 minutes, contact us with your M-Pesa transaction code (e.g. QAB2X3F7K9) and we'll resolve it within 1 hour.",
      },
      {
        q: "Can I get a refund?",
        a: "Yes. If an event is cancelled by the organiser, you'll automatically receive a full refund to your M-Pesa within 24 hours. For personal cancellations, refunds are available up to 48 hours before the event. After that, tickets are non-refundable but can be transferred.",
      },
      {
        q: "How long do refunds take?",
        a: "M-Pesa refunds typically arrive within 24–48 hours of approval. You'll receive an SMS confirmation from M-Pesa once the money is sent.",
      },
    ],
  },
  {
    category: "Account & Security",
    icon: <ShieldCheck className="w-4 h-4" />,
    items: [
      {
        q: "Is my payment information safe?",
        a: "Absolutely. We do not store any M-Pesa PINs or card details. All payment processing goes through Safaricom's secure M-Pesa API. Your personal data is encrypted and never sold to third parties.",
      },
      {
        q: "I can't sign in — what should I do?",
        a: "Try signing in with Google or your email address. If you're still having trouble, click 'Forgot Password' on the sign-in screen. For persistent issues, reach out to us via WhatsApp and we'll get you back in within minutes.",
      },
    ],
  },
  {
    category: "Hosting Events",
    icon: <RefreshCw className="w-4 h-4" />,
    items: [
      {
        q: "How do I list my event on NeneTickets?",
        a: "Click 'Host an Event' in the top navigation. You'll need to sign in, then fill in your event details — name, date, venue, ticket types and prices. Once submitted, your event goes live immediately.",
      },
      {
        q: "What commission does NeneTickets charge?",
        a: "We charge a 5% platform fee on each ticket sold. There are no upfront listing fees — you only pay when you sell. Payouts are sent to your M-Pesa within 48 hours after your event ends.",
      },
    ],
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/5 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between gap-4 py-5 text-left group"
      >
        <span className="font-semibold text-white group-hover:text-blue-400 transition-colors text-sm md:text-base">
          {q}
        </span>
        <ChevronDown
          className={`w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5 transition-transform duration-200 ${open ? "rotate-180 text-blue-400" : ""}`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${open ? "max-h-64 pb-5" : "max-h-0"}`}
      >
        <p className="text-gray-400 leading-relaxed text-sm">{a}</p>
      </div>
    </div>
  );
}

export default function SupportPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [activeCategory, setActiveCategory] = useState(0);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSent(true);
    setName("");
    setEmail("");
    setMessage("");
    setTimeout(() => setSent(false), 5000);
  };

  return (
    <main className="min-h-screen bg-[#050511] text-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-purple-600/10" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-full text-blue-400 text-sm font-bold mb-6">
            <HelpCircle className="w-4 h-4" /> Support Centre
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            How can we <span className="text-blue-400">help you?</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Find answers instantly or reach our team — we typically respond within 1 hour.
          </p>
          {/* Quick contact buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
            <a
              href="https://wa.me/254700000000"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-full font-bold text-sm transition shadow-lg shadow-green-600/20"
            >
              <MessageCircle className="w-4 h-4" /> WhatsApp Us
            </a>
            <a
              href="mailto:support@nenetickets.co.ke"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-full font-bold text-sm transition border border-white/10"
            >
              <Mail className="w-4 h-4" /> Email Support
            </a>
            <a
              href="tel:+254700000000"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-full font-bold text-sm transition border border-white/10"
            >
              <Phone className="w-4 h-4" /> Call Us
            </a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto px-4 pb-20 max-w-4xl">
        {/* Category pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          {FAQS.map((cat, i) => (
            <button
              key={i}
              onClick={() => setActiveCategory(i)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${
                activeCategory === i
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                  : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10"
              }`}
            >
              {cat.icon} {cat.category}
            </button>
          ))}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8">
          {FAQS[activeCategory].items.map((item, i) => (
            <FAQItem key={i} q={item.q} a={item.a} />
          ))}
        </div>
      </section>

      {/* Contact Form */}
      <section className="container mx-auto px-4 pb-24 max-w-2xl">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold">Still need help?</h2>
          <p className="text-gray-400 mt-2">Send us a message and we&apos;ll get back to you within an hour.</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8">
          {sent ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Message Sent!</h3>
              <p className="text-gray-400">We&apos;ll reply to your email within 1 hour. Check your inbox.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Your Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Kamau"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">How can we help?</label>
                <textarea
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your issue in as much detail as possible..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500 transition resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
              >
                <Send className="w-4 h-4" /> Send Message
              </button>
            </form>
          )}
        </div>

        {/* Hours */}
        <div className="mt-6 grid grid-cols-3 gap-3 text-center">
          {[
            { label: "WhatsApp", value: "24/7", sub: "Instant replies" },
            { label: "Email", value: "< 1 hr", sub: "Mon – Sat" },
            { label: "Phone", value: "8am–8pm", sub: "Daily" },
          ].map((item) => (
            <div key={item.label} className="bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-xs text-gray-500 font-bold uppercase mb-1">{item.label}</p>
              <p className="font-bold text-white">{item.value}</p>
              <p className="text-xs text-gray-600 mt-0.5">{item.sub}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
