import Link from "next/link";
import { Ticket, Home, Search, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#050511] text-white flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 mb-16">
        <div className="bg-blue-600 p-2 rounded-xl">
          <Ticket className="w-5 h-5 text-white transform -rotate-45" />
        </div>
        <span className="text-xl font-bold tracking-tight text-white">
          Nene<span className="text-blue-500">Tickets</span>
        </span>
      </Link>

      {/* 404 */}
      <div className="text-center relative z-10 max-w-lg">
        <p className="text-[120px] md:text-[160px] font-black leading-none text-transparent bg-clip-text bg-gradient-to-b from-white/20 to-white/5 select-none mb-0">
          404
        </p>

        <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-8 -mt-4 mb-8">
          <h1 className="text-2xl font-bold mb-3">Page Not Found</h1>
          <p className="text-gray-400 text-sm leading-relaxed">
            The page you&apos;re looking for doesn&apos;t exist or has been moved. It might be a broken link or a mistyped URL.
          </p>
        </div>

        {/* Quick actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/" className="flex-1">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20">
              <Home className="w-4 h-4" /> Go Home
            </button>
          </Link>
          <Link href="/events" className="flex-1">
            <button className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2">
              <Search className="w-4 h-4" /> Browse Events
            </button>
          </Link>
        </div>

        <Link href="javascript:history.back()" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-white transition mt-6 font-bold">
          <ArrowLeft className="w-4 h-4" /> Go back to previous page
        </Link>
      </div>
    </main>
  );
}
