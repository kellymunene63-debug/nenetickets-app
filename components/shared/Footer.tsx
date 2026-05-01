import Link from "next/link";
import { Ticket, Twitter, Instagram, Facebook, MessageCircle } from "lucide-react";

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
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: MessageCircle, href: "https://wa.me/254700000000", label: "WhatsApp" },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-black/60 backdrop-blur-sm mt-auto">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">

          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="bg-blue-600 p-2 rounded-xl">
                <Ticket className="w-5 h-5 text-white transform -rotate-45" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Nene<span className="text-blue-500">Tickets</span>
              </span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed mb-6 max-w-xs">
              Kenya&apos;s fastest ticket platform. Book concerts, matches, and conferences — pay with M-Pesa in seconds.
            </p>

            {/* M-Pesa badge */}
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-2 rounded-xl mb-6">
              <div className="w-5 h-5 bg-[#00A651] rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-[8px] font-black">M</span>
              </div>
              <span className="text-xs text-gray-400 font-bold">M-Pesa Accepted</span>
            </div>

            {/* Socials */}
            <div className="flex gap-3">
              {SOCIALS.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex items-center justify-center text-gray-500 hover:text-white transition"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([heading, items]) => (
            <div key={heading}>
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-4">{heading}</h3>
              <ul className="space-y-3">
                {items.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-sm text-gray-400 hover:text-white transition"
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
        <div className="border-t border-white/5 mt-12 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-gray-600">
          <p>© {new Date().getFullYear()} NeneTickets Ltd. All rights reserved.</p>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
            <span>All systems operational</span>
          </div>
          <p>Built with ❤️ in Nairobi, Kenya</p>
        </div>
      </div>
    </footer>
  );
}
