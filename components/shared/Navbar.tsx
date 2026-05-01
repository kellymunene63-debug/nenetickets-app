"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Ticket, ChevronRight } from "lucide-react";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

const NAV_LINKS = [
  { href: "/events", label: "Browse Events" },
  { href: "/support", label: "Support" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const close = () => setIsOpen(false);

  const handleNav = (href: string) => {
    close();
    router.push(href);
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">

        {/* Logo */}
        <Link href="/" onClick={close} className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-xl">
            <Ticket className="w-5 h-5 text-white transform -rotate-45" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            Nene<span className="text-blue-500">Tickets</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-bold text-gray-300">
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-white transition">
              {l.label}
            </Link>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/host">
            <button className="text-sm font-bold text-gray-300 hover:text-white transition">
              HOST AN EVENT
            </button>
          </Link>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-full text-sm font-bold transition shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:shadow-[0_0_25px_rgba(37,99,235,0.6)]">
                Sign In
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: "w-10 h-10 border-2 border-blue-500" } }} />
          </SignedIn>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-white p-1 rounded-lg hover:bg-white/10 transition"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu — slides down with CSS transition */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-black/95 border-t border-white/10 px-4 pb-6 pt-2 flex flex-col gap-1">
          {NAV_LINKS.map((l) => (
            <button
              key={l.href}
              onClick={() => handleNav(l.href)}
              className="flex items-center justify-between w-full text-left text-gray-300 hover:text-white font-bold py-3 px-2 rounded-xl hover:bg-white/5 transition"
            >
              {l.label}
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          ))}
          <button
            onClick={() => handleNav("/host")}
            className="flex items-center justify-between w-full text-left text-gray-300 hover:text-white font-bold py-3 px-2 rounded-xl hover:bg-white/5 transition"
          >
            Host an Event
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>

          <div className="mt-3 pt-3 border-t border-white/10 flex justify-center">
            <SignedOut>
              <SignInButton mode="modal">
                <button
                  onClick={close}
                  className="bg-blue-600 hover:bg-blue-700 text-white w-full py-3 rounded-xl font-bold transition"
                >
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <div onClick={close}>
                <UserButton afterSignOutUrl="/" />
              </div>
            </SignedIn>
          </div>
        </div>
      </div>
    </nav>
  );
}
