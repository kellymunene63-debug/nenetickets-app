import Navbar from "../../components/shared/Navbar";
import Link from "next/link";
import type { Metadata } from "next";
import { MapPin, Phone, Mail, ArrowRight, Zap, Shield, Users, Globe } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us | NeneTickets",
  description: "Learn about NeneTickets — Kenya's event ticketing platform, built by NeneLabs Agency Ltd.",
};

const VALUES = [
  {
    icon: Zap,
    title: "Speed",
    description: "From discovery to ticket in under 60 seconds. We built NeneTickets so Kenyans spend less time buying and more time enjoying.",
    color: "text-yellow-400",
    bg: "bg-yellow-400/10 border-yellow-400/20",
  },
  {
    icon: Shield,
    title: "Security",
    description: "Every transaction is secured by Paystack, Kenya's most trusted payment gateway. M-Pesa accepted, always.",
    color: "text-green-400",
    bg: "bg-green-400/10 border-green-400/20",
  },
  {
    icon: Users,
    title: "Community",
    description: "We exist to connect Kenyans with the experiences that matter — music, sport, business, culture, and everything in between.",
    color: "text-blue-400",
    bg: "bg-blue-400/10 border-blue-400/20",
  },
  {
    icon: Globe,
    title: "Reach",
    description: "Any organiser, anywhere in Kenya, can list an event and sell tickets in minutes — no gatekeepers, no complexity.",
    color: "text-purple-400",
    bg: "bg-purple-400/10 border-purple-400/20",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#050511] text-white">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-40 pb-24 px-4 overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-4">About NeneTickets</p>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
            Kenya&apos;s Home for<br />
            <span className="text-blue-500">Live Experiences</span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            NeneTickets is a ticketing platform built to make discovering and attending events in Kenya as seamless as possible — for fans and organisers alike.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="container mx-auto max-w-4xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-4">Our Story</p>
              <h2 className="text-3xl font-bold mb-6 leading-tight">Built in Kenya, for Kenya</h2>
              <div className="space-y-4 text-gray-400 leading-relaxed">
                <p>
                  NeneTickets was founded by <span className="text-white font-semibold">Kelly Munene</span> with a clear mission: to give every Kenyan easy access to the events that matter to them, and to give every organiser the tools to build a successful event business.
                </p>
                <p>
                  The platform is built and operated by <span className="text-white font-semibold">NeneLabs Agency Ltd</span>, a technology company dedicated to building digital products that work for the African market — fast, reliable, and designed around how Kenyans actually pay and communicate.
                </p>
                <p>
                  From sold-out concerts at Carnivore to community meetups and corporate summits, NeneTickets powers events of every size across the country.
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: "2026", label: "Founded" },
                { value: "80+", label: "Events Listed" },
                { value: "12,000+", label: "Tickets Sold" },
                { value: "60s", label: "Avg. Checkout" },
              ].map((stat) => (
                <div key={stat.label} className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center hover:border-blue-500/30 transition">
                  <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                  <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-4 bg-white/[0.02] border-t border-white/5">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-14">
            <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-4">What We Stand For</p>
            <h2 className="text-3xl font-bold">Our Values</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {VALUES.map((v) => (
              <div key={v.title} className={`border rounded-2xl p-6 ${v.bg} transition hover:scale-[1.02]`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 bg-black/30`}>
                  <v.icon className={`w-5 h-5 ${v.color}`} />
                </div>
                <h3 className="text-lg font-bold mb-2">{v.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-14">
            <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-4">The People Behind It</p>
            <h2 className="text-3xl font-bold mb-4">Our Team</h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              NeneTickets is powered by a broad, passionate team at NeneLabs Agency Ltd — designers, engineers, and operations specialists who share a love for live experiences and great technology.
            </p>
          </div>

          {/* Founder card */}
          <div className="max-w-sm mx-auto bg-white/5 border border-white/10 rounded-3xl p-8 text-center hover:border-blue-500/30 transition">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center mx-auto mb-4 text-3xl font-black shadow-lg shadow-blue-600/30">
              K
            </div>
            <h3 className="text-xl font-bold mb-1">Kelly Munene</h3>
            <p className="text-blue-400 text-sm font-bold uppercase tracking-wider mb-3">Founder</p>
            <p className="text-gray-500 text-sm leading-relaxed">
              Entrepreneur and builder behind NeneLabs Agency Ltd. Passionate about using technology to connect communities across Kenya.
            </p>
          </div>
        </div>
      </section>

      {/* Contact / Office */}
      <section className="py-20 px-4 bg-white/[0.02] border-t border-white/5">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-14">
            <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-4">Get In Touch</p>
            <h2 className="text-3xl font-bold">Contact Us</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center text-center hover:border-blue-500/30 transition">
              <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center mb-4">
                <MapPin className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="font-bold mb-2">Our Office</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Thika Road Mall<br />
                2nd Floor<br />
                Nairobi, Kenya
              </p>
            </div>

            <a href="tel:+254794588860" className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center text-center hover:border-green-500/30 hover:bg-green-500/5 transition group">
              <div className="w-12 h-12 bg-green-600/20 rounded-xl flex items-center justify-center mb-4">
                <Phone className="w-5 h-5 text-green-400" />
              </div>
              <h3 className="font-bold mb-2">Call Us</h3>
              <p className="text-gray-400 text-sm group-hover:text-green-400 transition">0794 588 860</p>
              <p className="text-gray-600 text-xs mt-1">Mon – Fri, 8am – 6pm</p>
            </a>

            <a href="mailto:support@nenetickets.co.ke" className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center text-center hover:border-purple-500/30 hover:bg-purple-500/5 transition group">
              <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center mb-4">
                <Mail className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="font-bold mb-2">Email Us</h3>
              <p className="text-gray-400 text-sm group-hover:text-purple-400 transition break-all">support@nenetickets.co.ke</p>
              <p className="text-gray-600 text-xs mt-1">We reply within 24 hours</p>
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to experience NeneTickets?</h2>
          <p className="text-gray-400 mb-8">Browse events happening across Kenya or list your own in minutes.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/events">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-xl transition shadow-lg shadow-blue-600/20 flex items-center gap-2 justify-center w-full sm:w-auto">
                Browse Events <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
            <Link href="/host">
              <button className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 text-white font-bold px-8 py-4 rounded-xl transition flex items-center gap-2 justify-center w-full sm:w-auto">
                Host an Event
              </button>
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}
