"use client";

import Link from "next/link";
import { Twitter, Instagram, Facebook, Mail, MapPin, Phone } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black border-t border-white/10 pt-16 pb-8 text-gray-400 text-sm">
      <div className="container mx-auto px-4">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* BRAND */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 select-none">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xl">🎟️</div>
                    <span className="text-xl font-bold text-white tracking-wide">NeneTickets</span>
                </div>
                <p className="leading-relaxed">
                    The future of event ticketing in Kenya. Secure, fast, and reliable booking for concerts, sports, and tech conferences.
                </p>
            </div>

            {/* QUICK LINKS */}
            <div>
                <h3 className="text-white font-bold mb-4 uppercase tracking-wider">Discover</h3>
                <ul className="space-y-3">
                    <li><Link href="/events" className="hover:text-blue-400 transition">Browse Events</Link></li>
                    <li><Link href="/events?category=Music" className="hover:text-blue-400 transition">Concerts</Link></li>
                    <li><Link href="/events?category=Sports" className="hover:text-blue-400 transition">Sports Matches</Link></li>
                    <li><Link href="/host" className="hover:text-blue-400 transition">Host an Event</Link></li>
                </ul>
            </div>

            {/* SUPPORT */}
            <div>
                <h3 className="text-white font-bold mb-4 uppercase tracking-wider">Support</h3>
                <ul className="space-y-3">
                    <li><Link href="/support" className="hover:text-blue-400 transition">Help Center</Link></li>
                    <li><Link href="/tickets" className="hover:text-blue-400 transition">My Tickets</Link></li>
                    <li><Link href="/privacy" className="hover:text-blue-400 transition">Privacy Policy</Link></li>
                    <li><Link href="/support" className="hover:text-blue-400 transition">Contact Us</Link></li>
                </ul>
            </div>

            {/* CONTACT */}
            <div>
                <h3 className="text-white font-bold mb-4 uppercase tracking-wider">Contact</h3>
                <ul className="space-y-3">
                    <li className="flex items-center gap-3"><MapPin className="w-4 h-4" /> Nairobi, Kenya</li>
                    <li className="flex items-center gap-3"><Mail className="w-4 h-4" /> support@nenetickets.co.ke</li>
                    <li className="flex items-center gap-3"><Phone className="w-4 h-4" /> +254 794 588 860</li>
                </ul>
                <div className="flex gap-4 mt-6">
                    <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-blue-600 hover:text-white transition"><Twitter className="w-4 h-4" /></a>
                    <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-pink-600 hover:text-white transition"><Instagram className="w-4 h-4" /></a>
                    <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-blue-800 hover:text-white transition"><Facebook className="w-4 h-4" /></a>
                </div>
            </div>
        </div>

        {/* BOTTOM BAR */}
        {/* Payment Methods Row */}
<div className="border-t border-white/10 pt-8 pb-8 flex flex-col items-center gap-4">
  <p className="text-xs uppercase tracking-widest font-bold text-gray-600">Accepted Payment Methods</p>
  <div className="flex items-center gap-4 flex-wrap justify-center">
    <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-lg">
      <div className="w-6 h-6 bg-[#00A651] rounded-full flex items-center justify-center">
        <span className="text-white text-[9px] font-black">M</span>
      </div>
      <span className="text-white text-sm font-bold">M-Pesa</span>
    </div>
    <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-lg">
      <span className="bg-[#1A1F71] text-white px-2 py-1 rounded text-xs font-black italic">VISA</span>
    </div>
    <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-lg">
      <div className="flex -space-x-2">
        <div className="w-5 h-5 rounded-full bg-[#EB001B]"></div>
        <div className="w-5 h-5 rounded-full bg-[#F79E1B]"></div>
      </div>
      <span className="text-white text-sm font-bold ml-1">Mastercard</span>
    </div>
    <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-lg">
      <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
      </svg>
      <span className="text-green-400 text-sm font-bold">SSL Secured</span>
    </div>
  </div>
</div>
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p>&copy; {currentYear} NeneTickets. All rights reserved.</p>
            <div className="flex gap-6 text-xs font-bold uppercase tracking-widest">
                <Link href="/privacy" className="hover:text-white transition">Privacy</Link>
                <Link href="/terms" className="hover:text-white transition">Terms</Link>
                <Link href="/sitemap" className="hover:text-white transition">Sitemap</Link>
            </div>
        </div>
      </div>
    </footer>
  );
}
