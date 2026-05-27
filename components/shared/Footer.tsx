import Link from "next/link";
import Image from "next/image";
import { Twitter, Instagram, Facebook, MessageCircle } from "lucide-react";

const LINKS = {
  Discover: [
    { label: "Browse Events", href: "/events" },
    { label: "Music", href: "/events?category=Music" },
    { label: "Sports", href: "/events?category=Sports" },
    { label: "Business", href: "/events?category=Business" },
    { label: "Arts", href: "/events?category=Arts" },
  ],
  Account: [
    { label: "My Tickets", href: "/tickets" },
    { label: "Host an Event", href: "/host" },
    { label: "Ticket Validator", href: "/validator" },
    { label: "Support", href: "/support" },
  ],
  Company: [
    { label: "About Us", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
  ],
};

const SOCIALS = [
  { icon: Twitter, href: "#", label: "Twitter", color: "hover:bg-sky-500/20 hover:border-sky-500/40 hover:text-sky-400" },
  { icon: Instagram, href: "#", label: "Instagram", color: "hover:bg-pink-500/20 hover:border-pink-500/40 hover:text-pink-400" },
  { icon: Facebook, href: "#", label: "Facebook", color: "hover:bg-blue-500/20 hover:border-blue-500/40 hover:text-blue-400" },
  { icon: MessageCircle, href: "https://wa.me/254794588860", label: "WhatsApp", color: "hover:bg-green-500/20 hover:border-green-500/40 hover:text-green-400" },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#07071a] mt-auto">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">

          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center mb-4">
              <Image
                src="/logo.png"
                alt="NeneTickets"
                width={160}
                height={40}
                className="h-10 w-auto object-contain"
              />
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-xs">
              Kenya&apos;s fastest ticket platform. Book concerts, matches, and conferences — pay with M-Pesa in seconds.
            </p>

            {/* M-Pesa badge */}
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-2 rounded-xl mb-6">
              <div className="w-5 h-5 bg-[#00A651] rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-[8px] font-black">M</span>
              </div>
              <span className="text-xs text-gray-300 font-bold">M-Pesa Accepted</span>
            </div>

            {/* Socials */}
            <div className="flex gap-3">
              {SOCIALS.map(({ icon: Icon, href, label, color }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className={`w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-gray-400 transition-all duration-200 ${color}`}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([heading, items]) => (
            <div key={heading}>
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-5">{heading}</h3>
              <ul className="space-y-3.5">
                {items.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-sm text-gray-400 hover:text-white transition-colors duration-150 font-medium"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 mt-12 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} NeneTickets Ltd. All rights reserved.</p>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            <span className="text-gray-400">All systems operational</span>
          </div>
          <p className="text-gray-500">Built with ❤️ in Nairobi, Kenya</p>
        </div>
      </div>
    </footer>
  );
}
