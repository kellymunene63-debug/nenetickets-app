"use client";

import Navbar from "../../components/shared/Navbar";
import { useState, useEffect, useRef } from "react";
import {
  ScanLine, CheckCircle2, XCircle, Search, Ticket,
  Calendar, MapPin, User, RotateCcw, ShieldCheck, Hash
} from "lucide-react";
import Link from "next/link";

interface StoredTicket {
  id: string;
  title: string;
  type: string;
  price: number;
  quantity: number;
  date: string;
  time: string;
  location: string;
  image: string;
  purchasedAt: string;
  phone: string;
  validated?: boolean;
  validatedAt?: string;
}

type ScanResult = "idle" | "valid" | "already-used" | "not-found";

export default function ValidatorPage() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState<ScanResult>("idle");
  const [foundTicket, setFoundTicket] = useState<StoredTicket | null>(null);
  const [scannedCount, setScannedCount] = useState(0);
  const [history, setHistory] = useState<{ code: string; status: ScanResult; title?: string; time: string }[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const validate = (rawCode: string) => {
    const trimmed = rawCode.trim().toUpperCase();
    if (!trimmed) return;

    try {
      const tickets: StoredTicket[] = JSON.parse(localStorage.getItem("nene_sold_tickets") ?? "[]");
      const ticket = tickets.find((t) => t.id.toUpperCase() === trimmed);

      const timeStr = new Date().toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" });

      if (!ticket) {
        setResult("not-found");
        setFoundTicket(null);
        setHistory((prev) => [{ code: trimmed, status: "not-found", time: timeStr }, ...prev.slice(0, 19)]);
        return;
      }

      if (ticket.validated) {
        setResult("already-used");
        setFoundTicket(ticket);
        setHistory((prev) => [{ code: trimmed, status: "already-used", title: ticket.title, time: timeStr }, ...prev.slice(0, 19)]);
        return;
      }

      // Mark as validated
      const updated = tickets.map((t) =>
        t.id.toUpperCase() === trimmed
          ? { ...t, validated: true, validatedAt: new Date().toISOString() }
          : t
      );
      localStorage.setItem("nene_sold_tickets", JSON.stringify(updated));
      setResult("valid");
      setFoundTicket({ ...ticket, validated: true });
      setScannedCount((n) => n + 1);
      setHistory((prev) => [{ code: trimmed, status: "valid", title: ticket.title, time: timeStr }, ...prev.slice(0, 19)]);
    } catch {
      setResult("not-found");
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    validate(code);
    setCode("");
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const reset = () => {
    setResult("idle");
    setFoundTicket(null);
    setCode("");
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const resultConfig = {
    idle: null,
    valid: {
      bg: "bg-green-500/10 border-green-500/30",
      icon: <CheckCircle2 className="w-16 h-16 text-green-400" />,
      title: "Ticket Valid ✓",
      titleColor: "text-green-400",
      glow: "shadow-green-500/20",
    },
    "already-used": {
      bg: "bg-yellow-500/10 border-yellow-500/30",
      icon: <XCircle className="w-16 h-16 text-yellow-400" />,
      title: "Already Scanned",
      titleColor: "text-yellow-400",
      glow: "shadow-yellow-500/20",
    },
    "not-found": {
      bg: "bg-red-500/10 border-red-500/30",
      icon: <XCircle className="w-16 h-16 text-red-400" />,
      title: "Invalid Ticket",
      titleColor: "text-red-400",
      glow: "shadow-red-500/20",
    },
  };

  const cfg = result !== "idle" ? resultConfig[result] : null;

  return (
    <main className="min-h-screen bg-[#050511] text-white">
      <Navbar />

      <div className="container mx-auto px-4 pt-28 pb-16 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
              <p className="text-purple-400 text-xs font-bold uppercase tracking-widest">Live Validator</p>
            </div>
            <h1 className="text-2xl font-bold">Ticket Scanner</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-center">
              <p className="text-2xl font-bold text-green-400">{scannedCount}</p>
              <p className="text-xs text-gray-500">Admitted today</p>
            </div>
            <Link href="/host">
              <button className="text-sm font-bold text-gray-400 hover:text-white border border-white/10 px-4 py-2 rounded-xl hover:border-white/30 transition">
                ← Dashboard
              </button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Scanner */}
          <div className="space-y-5">
            {/* Code input */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <ScanLine className="w-5 h-5 text-purple-400" />
                <h2 className="font-bold">Enter Ticket Code</h2>
              </div>
              <p className="text-gray-500 text-sm mb-5">
                Type the 8-character ticket reference from the attendee&apos;s ticket. Works with keyboard scanners too.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Hash className="w-4 h-4 text-gray-500 absolute left-4 top-4" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="e.g. AB3K7X2M"
                    maxLength={8}
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                    className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-3.5 text-white text-lg font-mono tracking-[0.3em] placeholder:text-gray-600 placeholder:tracking-normal focus:outline-none focus:border-purple-500 transition"
                  />
                  <span className="absolute right-4 top-4 text-xs text-gray-600">{code.length}/8</span>
                </div>
                <button
                  type="submit"
                  disabled={code.length < 3}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-800 disabled:text-gray-600 text-white font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20"
                >
                  <Search className="w-4 h-4" /> Validate Ticket
                </button>
              </form>
            </div>

            {/* Result card */}
            {cfg && (
              <div className={`border rounded-2xl p-6 ${cfg.bg} shadow-2xl ${cfg.glow}`}>
                <div className="flex flex-col items-center text-center mb-5">
                  <div className="mb-3">{cfg.icon}</div>
                  <h3 className={`text-2xl font-bold mb-1 ${cfg.titleColor}`}>{cfg.title}</h3>
                  {result === "not-found" && (
                    <p className="text-gray-400 text-sm">No ticket found with this reference. Check for typos.</p>
                  )}
                </div>

                {foundTicket && (
                  <div className="space-y-2.5 text-sm border-t border-white/10 pt-4">
                    <div className="flex items-center gap-2 font-bold">
                      <Ticket className="w-4 h-4 text-gray-500" />
                      <span>{foundTicket.title}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <User className="w-4 h-4 text-gray-600" />
                      <span className="capitalize">{foundTicket.type} ticket · {foundTicket.quantity} person{foundTicket.quantity > 1 ? "s" : ""}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <Calendar className="w-4 h-4 text-gray-600" />
                      <span>{foundTicket.date} at {foundTicket.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <MapPin className="w-4 h-4 text-gray-600" />
                      <span>{foundTicket.location}</span>
                    </div>
                    {result === "already-used" && foundTicket.validatedAt && (
                      <div className="flex items-center gap-2 text-yellow-400 bg-yellow-500/10 px-3 py-2 rounded-lg mt-2">
                        <ShieldCheck className="w-4 h-4" />
                        <span className="text-xs font-bold">
                          Already admitted at {new Date(foundTicket.validatedAt).toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <button
                  onClick={reset}
                  className="w-full mt-5 bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" /> Scan Next Ticket
                </button>
              </div>
            )}

            {result === "idle" && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
                <div className="w-20 h-20 mx-auto mb-4 relative">
                  <div className="w-full h-full border-2 border-dashed border-white/20 rounded-xl flex items-center justify-center">
                    <ScanLine className="w-8 h-8 text-gray-600" />
                  </div>
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-purple-500 rounded-tl" />
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-purple-500 rounded-tr" />
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-purple-500 rounded-bl" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-purple-500 rounded-br" />
                </div>
                <p className="text-gray-500 text-sm">Waiting for ticket scan…</p>
              </div>
            )}
          </div>

          {/* Right: History */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-gray-500" /> Scan History
              </h2>
              {history.length > 0 && (
                <button onClick={() => setHistory([])} className="text-xs text-gray-500 hover:text-white transition">
                  Clear
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
                <p className="text-gray-600 text-sm">No scans yet. Scanned tickets will appear here.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {history.map((item, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-3 p-4 rounded-xl border text-sm ${
                      item.status === "valid"
                        ? "bg-green-500/5 border-green-500/20"
                        : item.status === "already-used"
                        ? "bg-yellow-500/5 border-yellow-500/20"
                        : "bg-red-500/5 border-red-500/20"
                    }`}
                  >
                    {item.status === "valid" ? (
                      <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                    ) : (
                      <XCircle className={`w-4 h-4 flex-shrink-0 ${item.status === "already-used" ? "text-yellow-400" : "text-red-400"}`} />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-mono font-bold text-xs">{item.code}</p>
                      {item.title && <p className="text-gray-500 text-xs truncate">{item.title}</p>}
                      {item.status === "not-found" && <p className="text-gray-600 text-xs">Not found</p>}
                      {item.status === "already-used" && <p className="text-yellow-500/70 text-xs">Already admitted</p>}
                    </div>
                    <span className="text-xs text-gray-600 flex-shrink-0">{item.time}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
