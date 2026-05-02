"use client";

import Navbar from "../../components/shared/Navbar";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  ScanLine, CheckCircle2, XCircle, Search, Ticket,
  Calendar, MapPin, User, RotateCcw, ShieldCheck, Hash,
  Camera, KeyboardIcon, CameraOff, Loader2
} from "lucide-react";
import Link from "next/link";

// ── Types ────────────────────────────────────────────────────────────────────
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
  phone?: string;
  validated?: boolean;
  validatedAt?: string;
}

type ScanResult = "idle" | "valid" | "already-used" | "not-found";
type ScanMode  = "manual" | "camera";

declare global {
  interface Window {
    Html5Qrcode: any; // loaded from CDN at runtime
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────
const RESULT_CONFIG = {
  idle: null,
  valid: {
    bg: "bg-green-500/10 border-green-500/30",
    icon: <CheckCircle2 className="w-16 h-16 text-green-400" />,
    title: "Ticket Valid ✓",
    titleColor: "text-green-400",
    glow: "shadow-green-500/20",
    flash: "bg-green-500",
  },
  "already-used": {
    bg: "bg-yellow-500/10 border-yellow-500/30",
    icon: <XCircle className="w-16 h-16 text-yellow-400" />,
    title: "Already Scanned",
    titleColor: "text-yellow-400",
    glow: "shadow-yellow-500/20",
    flash: "bg-yellow-500",
  },
  "not-found": {
    bg: "bg-red-500/10 border-red-500/30",
    icon: <XCircle className="w-16 h-16 text-red-400" />,
    title: "Invalid Ticket",
    titleColor: "text-red-400",
    glow: "shadow-red-500/20",
    flash: "bg-red-500",
  },
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function ValidatorPage() {
  const [mode, setMode]               = useState<ScanMode>("manual");
  const [code, setCode]               = useState("");
  const [result, setResult]           = useState<ScanResult>("idle");
  const [foundTicket, setFoundTicket] = useState<StoredTicket | null>(null);
  const [scannedCount, setScannedCount] = useState(0);
  const [history, setHistory]         = useState<{ code: string; status: ScanResult; title?: string; time: string }[]>([]);
  const [libLoaded, setLibLoaded]     = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [flashColor, setFlashColor]   = useState("");

  const inputRef    = useRef<HTMLInputElement>(null);
  const scannerRef  = useRef<any>(null); // html5-qrcode instance
  const scanLockRef = useRef(false); // prevent double-scans

  // Load html5-qrcode from CDN
  useEffect(() => {
    if (document.getElementById("html5-qrcode-lib")) { setLibLoaded(true); return; }
    const s = document.createElement("script");
    s.id  = "html5-qrcode-lib";
    s.src = "https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js";
    s.onload  = () => setLibLoaded(true);
    s.onerror = () => setCameraError("Could not load scanner library. Use manual entry.");
    document.body.appendChild(s);
  }, []);

  // Auto-focus manual input
  useEffect(() => {
    if (mode === "manual") inputRef.current?.focus();
  }, [mode]);

  // Flash screen feedback
  const flash = (color: string) => {
    setFlashColor(color);
    setTimeout(() => setFlashColor(""), 500);
  };

  // Core validation logic (shared between manual + camera)
  const validate = useCallback((rawCode: string) => {
    const trimmed = rawCode.trim().toUpperCase();
    if (!trimmed) return;

    const timeStr = new Date().toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" });

    try {
      const tickets: StoredTicket[] = JSON.parse(localStorage.getItem("nene_sold_tickets") ?? "[]");
      const ticket = tickets.find((t) => t.id.toUpperCase() === trimmed);

      if (!ticket) {
        setResult("not-found");
        setFoundTicket(null);
        setHistory((p) => [{ code: trimmed, status: "not-found", time: timeStr }, ...p.slice(0, 19)]);
        flash("bg-red-500");
        return;
      }

      if (ticket.validated) {
        setResult("already-used");
        setFoundTicket(ticket);
        setHistory((p) => [{ code: trimmed, status: "already-used", title: ticket.title, time: timeStr }, ...p.slice(0, 19)]);
        flash("bg-yellow-500");
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
      setHistory((p) => [{ code: trimmed, status: "valid", title: ticket.title, time: timeStr }, ...p.slice(0, 19)]);
      flash("bg-green-500");
    } catch {
      setResult("not-found");
      flash("bg-red-500");
    }
  }, []);

  // ── Camera scanner ──────────────────────────────────────────────────────────
  const stopCamera = useCallback(async () => {
    if (scannerRef.current) {
      try { await scannerRef.current.stop(); } catch { /* ignore */ }
      try { scannerRef.current.clear(); } catch { /* ignore */ }
      scannerRef.current = null;
    }
    setCameraActive(false);
    scanLockRef.current = false;
  }, []);

  const startCamera = useCallback(async () => {
    if (!libLoaded || !window.Html5Qrcode) {
      setCameraError("Scanner library not ready. Please wait.");
      return;
    }
    setCameraError("");
    setCameraActive(true);
    scanLockRef.current = false;

    try {
      const scanner = new window.Html5Qrcode("qr-reader-container");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" }, // back camera
        {
          fps: 15,
          qrbox: { width: 260, height: 260 },
          aspectRatio: 1.0,
        },
        (decodedText: string) => {
          // Debounce: only process once per result
          if (scanLockRef.current) return;
          scanLockRef.current = true;

          validate(decodedText);

          // Pause scanning for 2.5 s so the result is visible, then re-enable
          setTimeout(() => {
            scanLockRef.current = false;
          }, 2500);
        },
        () => { /* scan frame errors are expected — ignore */ }
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.toLowerCase().includes("permission")) {
        setCameraError("Camera permission denied. Please allow camera access in your browser settings.");
      } else {
        setCameraError("Could not start camera. Use manual entry instead.");
      }
      setCameraActive(false);
    }
  }, [libLoaded, validate]);

  // Stop camera when switching away
  useEffect(() => {
    if (mode !== "camera") stopCamera();
  }, [mode, stopCamera]);

  // Cleanup on unmount
  useEffect(() => () => { stopCamera(); }, [stopCamera]);

  const reset = () => {
    setResult("idle");
    setFoundTicket(null);
    setCode("");
    scanLockRef.current = false;
    if (mode === "manual") setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleManualSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    validate(code);
    setCode("");
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const cfg = result !== "idle" ? RESULT_CONFIG[result] : null;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-[#050511] text-white relative overflow-hidden">
      <Navbar />

      {/* Screen flash overlay */}
      {flashColor && (
        <div className={`fixed inset-0 z-50 pointer-events-none ${flashColor} opacity-20 transition-opacity duration-500`} />
      )}

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

          {/* ── LEFT: Scanner panel ──────────────────────────────────────────── */}
          <div className="space-y-5">

            {/* Mode tabs */}
            <div className="flex gap-2 bg-white/5 border border-white/10 p-1.5 rounded-2xl">
              <button
                onClick={() => setMode("manual")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition ${
                  mode === "manual"
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <KeyboardIcon className="w-4 h-4" /> Manual Entry
              </button>
              <button
                onClick={() => setMode("camera")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition ${
                  mode === "camera"
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Camera className="w-4 h-4" /> Camera Scan
              </button>
            </div>

            {/* ── MANUAL ENTRY ── */}
            {mode === "manual" && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <ScanLine className="w-5 h-5 text-purple-400" />
                  <h2 className="font-bold">Enter Ticket Code</h2>
                </div>
                <p className="text-gray-500 text-sm mb-5">
                  Type the 8-character ticket ID, or use a USB barcode scanner — it types the code automatically.
                </p>
                <form onSubmit={handleManualSubmit} className="space-y-4">
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
            )}

            {/* ── CAMERA SCAN ── */}
            {mode === "camera" && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Camera className="w-5 h-5 text-purple-400" />
                    <h2 className="font-bold">Camera QR Scanner</h2>
                  </div>
                  {cameraActive && (
                    <div className="flex items-center gap-1.5 text-xs text-green-400 font-bold">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                      Live
                    </div>
                  )}
                </div>

                {cameraError && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl mb-4 flex items-start gap-2">
                    <CameraOff className="w-4 h-4 flex-shrink-0 mt-0.5" /> {cameraError}
                  </div>
                )}

                {/* Camera preview container */}
                <div className="relative bg-black rounded-xl overflow-hidden mb-4" style={{ minHeight: 280 }}>
                  {/* html5-qrcode renders the video inside this div */}
                  <div id="qr-reader-container" className="w-full" />

                  {/* Overlay frame corners when active */}
                  {cameraActive && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <div className="relative w-56 h-56">
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-purple-400 rounded-tl-lg" />
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-purple-400 rounded-tr-lg" />
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-purple-400 rounded-bl-lg" />
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-purple-400 rounded-br-lg" />
                        {/* Scanning line animation */}
                        <div className="absolute left-2 right-2 h-0.5 bg-purple-400/70 animate-bounce top-1/2" style={{ animationDuration: "2s" }} />
                      </div>
                    </div>
                  )}

                  {!cameraActive && !cameraError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-gray-500 py-8">
                      <Camera className="w-10 h-10 text-gray-700" />
                      <p className="text-sm">Camera not started</p>
                    </div>
                  )}
                </div>

                {!cameraActive ? (
                  <button
                    onClick={startCamera}
                    disabled={!libLoaded}
                    className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-800 disabled:text-gray-600 text-white font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2"
                  >
                    {!libLoaded
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Loading scanner…</>
                      : <><Camera className="w-4 h-4" /> Start Camera</>
                    }
                  </button>
                ) : (
                  <button
                    onClick={stopCamera}
                    className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2"
                  >
                    <CameraOff className="w-4 h-4" /> Stop Camera
                  </button>
                )}

                <p className="text-xs text-gray-600 mt-3 text-center">
                  Point the camera at the QR code on the attendee&apos;s ticket. Validation is automatic.
                </p>
              </div>
            )}

            {/* ── Result card ── */}
            {cfg && (
              <div className={`border rounded-2xl p-6 ${cfg.bg} shadow-2xl ${cfg.glow}`}>
                <div className="flex flex-col items-center text-center mb-5">
                  <div className="mb-3">{cfg.icon}</div>
                  <h3 className={`text-2xl font-bold mb-1 ${cfg.titleColor}`}>{cfg.title}</h3>
                  {result === "not-found" && (
                    <p className="text-gray-400 text-sm">No ticket found with this code. Check for typos.</p>
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

            {result === "idle" && mode === "manual" && (
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

          {/* ── RIGHT: History ───────────────────────────────────────────────── */}
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
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
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
                    {item.status === "valid"
                      ? <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                      : <XCircle className={`w-4 h-4 flex-shrink-0 ${item.status === "already-used" ? "text-yellow-400" : "text-red-400"}`} />
                    }
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
