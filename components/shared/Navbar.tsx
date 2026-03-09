"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Ticket } from "lucide-react";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-xl">
            <Ticket className="w-5 h-5 text-white transform -rotate-45" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            Nene<span className="text-blue-500">Tickets</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-bold text-gray-300">
          <Link href="/events" className="hover:text-white transition">Browse Events</Link>
          <Link href="#" className="hover:text-white transition">Support</Link>
        </div>

        {/* Action Buttons & Authentication */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/host">
            <button className="text-sm font-bold text-gray-300 hover:text-white transition">
              HOST AN EVENT
            </button>
          </Link>
          
          {/* CLERK AUTHENTICATION MAGIC */}
          <SignedOut>
            <SignInButton mode="modal">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-full text-sm font-bold transition shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:shadow-[0_0_25px_rgba(37,99,235,0.6)]">
                Sign In
              </button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
             <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: "w-10 h-10 border-2 border-blue-500" } }}/>
          </SignedIn>

        </div>

        {/* Mobile Menu Toggle */}
        <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-black border-b border-white/10 p-4 flex flex-col gap-4 text-center">
          <Link href="/events" className="text-gray-300 hover:text-white font-bold py-2">Browse Events</Link>
          <Link href="#" className="text-gray-300 hover:text-white font-bold py-2">Support</Link>
          <Link href="/host" className="text-gray-300 hover:text-white font-bold py-2">Host an Event</Link>
          
          {/* Mobile CLERK AUTHENTICATION */}
          <div className="flex justify-center mt-2">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="bg-blue-600 hover:bg-blue-700 text-white w-full py-3 rounded-xl font-bold">
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
               <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </div>
      )}
    </nav>
  );
}