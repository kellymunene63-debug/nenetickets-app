"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Menu, X, LogIn, LogOut, HelpCircle } from "lucide-react";

export default function Navbar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  // 1. CHECK LOGIN STATUS
  useEffect(() => {
    const savedUser = localStorage.getItem("nene_user_profile");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // 2. LOGOUT FUNCTION
  const handleLogout = () => {
    localStorage.removeItem("nene_user_profile");
    setUser(null);
    setIsOpen(false);
    router.push("/");
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-black/90 backdrop-blur-md border-b border-white/10">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* LOGO */}
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer select-none">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-xl">🎟️</div>
              <span className="text-xl font-bold text-white tracking-wide">NeneTickets</span>
          </div>
        </Link>

        {/* DESKTOP LINKS */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
            <Link href="/events" className="hover:text-white transition">Browse Events</Link>
            
            {/* NEW: SUPPORT LINK */}
            <Link href="/support" className="hover:text-white transition flex items-center gap-2">
                Support
            </Link>

            {user && (
                <Link href="/tickets" className="hover:text-white transition">My Tickets</Link>
            )}
        </div>

        {/* RIGHT SIDE ACTIONS */}
        <div className="hidden md:flex items-center gap-4">
            <Link 
                href="/host" 
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/5 transition text-xs font-bold text-white uppercase tracking-wider select-none cursor-pointer"
            >
                Host an Event
            </Link>
            
            {/* LOGGED IN VIEW */}
            {user ? (
                <div className="flex items-center gap-4 pl-4 border-l border-white/10">
                    {/* Profile Link */}
                    <Link href="/profile" className="flex items-center gap-3 group">
                        <div className="text-right hidden lg:block">
                            <div className="text-xs text-gray-400 group-hover:text-white transition">Welcome</div>
                            <div className="text-sm font-bold leading-none">{user.name.split(" ")[0]}</div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-lg font-bold border border-white/10 group-hover:border-white/50 transition">
                            {user.name.charAt(0)}
                        </div>
                    </Link>

                    {/* LOGOUT BUTTON */}
                    <button 
                        onClick={handleLogout}
                        className="text-gray-500 hover:text-red-400 transition p-2 hover:bg-white/5 rounded-full"
                        title="Log Out"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            ) : (
                // LOGGED OUT VIEW
                <Link href="/login">
                    <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full font-bold transition shadow-lg shadow-blue-600/20 text-sm">
                        <LogIn className="w-4 h-4" /> Sign In
                    </button>
                </Link>
            )}
        </div>

        {/* MOBILE MENU BUTTON */}
        <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="md:hidden text-white p-2 rounded-lg hover:bg-white/10 transition"
        >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* MOBILE DROPDOWN */}
      {isOpen && (
        <div className="md:hidden bg-black/95 border-b border-white/10 absolute w-full left-0 top-16 p-4 flex flex-col gap-4 shadow-2xl">
            <Link href="/events" onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-white py-2 border-b border-white/5">
                Browse Events
            </Link>
            
            {/* NEW: SUPPORT LINK MOBILE */}
            <Link href="/support" onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-white py-2 border-b border-white/5 flex items-center gap-2">
                <HelpCircle className="w-4 h-4" /> Help & Support
            </Link>
            
            {user ? (
                <>
                    <Link href="/tickets" onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-white py-2 border-b border-white/5">
                        My Tickets
                    </Link>
                    <Link href="/profile" onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-white py-2 border-b border-white/5">
                        My Profile ({user.name})
                    </Link>
                    <button 
                        onClick={handleLogout} 
                        className="text-red-400 font-bold py-2 border-b border-white/5 text-left flex items-center gap-2"
                    >
                        <LogOut className="w-4 h-4" /> Log Out
                    </button>
                </>
            ) : (
                <Link href="/login" onClick={() => setIsOpen(false)} className="text-blue-400 font-bold py-2 border-b border-white/5">
                    Sign In / Register
                </Link>
            )}
            
            <Link href="/host" onClick={() => setIsOpen(false)} className="text-blue-400 font-bold py-2">
                Host an Event
            </Link>
        </div>
      )}
    </nav>
  );
}