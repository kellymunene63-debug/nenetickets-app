"use client";
// app/host/scan/page.tsx
// Ticket scanner for event organizers.
// Uses html5-qrcode for camera scanning + manual entry fallback.
// Install: npm install html5-qrcode qrcode.react

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Camera, CameraOff, Keyboard, CheckCircle2,
  XCircle, AlertCircle, Loader2, ChevronDown,
  RotateCcw, Ticket, Users, Clock,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────

interface HostedEvent {
  id:        string;
  title:     string;
  date:      string;
  venue?:    string;
  status?:   string;
  cancelled?: boolean;
}

interface ScanResult {
  valid:       boolean;
  alreadyUsed?: boolean;
  message:     string;
  attendee?: {
    name:        string;
    email:       string;
    bookingRef:  string;
    quantity:    number;
    eventTitle:  string;
    checkedInAt?: string;
  };
}

type ScanStatus = "idle" | "scanning" | "success" | "error" | "duplicate";

// ─── Main page ────────────────────────────────────────────────────

export default function ScanPage() {
  const [events,          setEvents]          = useState<HostedEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [loadingEvents,   setLoadingEvents]   = useState(true);

  const [mode,            setMode]            = useState<"camera" | "manual">("camera");
  const [manualToken,     setManualToken]     = useState("");
  const [status,          setStatus]          = useState<ScanStatus>("idle");
  const [result,          setResult]          = useState<ScanResult | null>(null);
  const [scanCount,       setScanCount]       = useState(0);

  const scannerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const html5QrRef = useRef<any>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Load organiser's events ────────────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        const res  = await fetch("/api/host/events");
        const data = await res.json() as HostedEvent[];
        // Only show approved, non-cancelled events
        const active = data.filter(
          (e) => !e.cancelled && e.status === "approved"
        );
        setEvents(active);
        if (active.length === 1) setSelectedEventId(active[0].id);
      } catch {
        /* ignore */
      } finally {
        setLoadingEvents(false);
      }
    }
    load();
  }, []);

  // ── Validate a token ──────────────────────────────────────────
  const validate = useCallback(async (token: string) => {
    const clean = token.trim();
    if (!clean) return;

    // Extract token from URL if someone scanned a full verify URL
    // e.g. https://nenetickets.co.ke/verify/tk_abc123
    const urlMatch = clean.match(/\/verify\/(tk_[a-zA-Z0-9]+)/);
    const ticketToken = urlMatch ? urlMatch[1] : clean;

    setStatus("scanning");
    setResult(null);

    try {
      const res  = await fetch("/api/tickets/validate", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          ticketToken,
          eventId: selectedEventId || undefined,
        }),
      });
      const data = await res.json() as ScanResult;
      setResult(data);

      if (data.valid) {
        setStatus("success");
        setScanCount((n) => n + 1);
      } else if (data.alreadyUsed) {
        setStatus("duplicate");
      } else {
        setStatus("error");
      }
    } catch {
      setResult({ valid: false, message: "Connection error. Check your internet." });
      setStatus("error");
    }
  }, [selectedEventId]);

  // ── Camera scanner setup ──────────────────────────────────────
  useEffect(() => {
    if (mode !== "camera") {
      if (html5QrRef.current) {
        html5QrRef.current.stop().catch(() => {});
        html5QrRef.current = null;
      }
      return;
    }

    let active = true;

    async function startScanner() {
      // Dynamically import to avoid SSR issues
      const { Html5Qrcode } = await import("html5-qrcode");

      if (!active || !scannerRef.current) return;

      const scanner = new Html5Qrcode("qr-reader");
      html5QrRef.current = scanner;

      try {
        await scanner.start(
          { facingMode: "environment" }, // rear camera
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            // Debounce: don't fire twice for the same scan
            if (debounceRef.current) return;
            debounceRef.current = setTimeout(() => {
              debounceRef.current = null;
            }, 2500);
            validate(decodedText);
          },
          () => { /* ignore frame errors */ }
        );
      } catch (err) {
        console.error("Camera error:", err);
        if (active) setMode("manual");
      }
    }

    startScanner();

    return () => {
      active = false;
      if (html5QrRef.current) {
        html5QrRef.current.stop().catch(() => {});
        html5QrRef.current = null;
      }
    };
  }, [mode, validate]);

  // ── Reset for next scan ───────────────────────────────────────
  function reset() {
    setStatus("idle");
    setResult(null);
    setManualToken("");
  }

  // ── Render ────────────────────────────────────────────────────

  const selectedEvent = events.find((e) => e.id === selectedEventId);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pb-20">

      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0a0a0a]/95 backdrop-blur border-b border-white/10 px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">Ticket Scanner</h1>
            <p className="text-xs text-gray-400">
              {scanCount > 0 ? `${scanCount} checked in this session` : "Scan attendee tickets"}
            </p>
          </div>
          {scanCount > 0 && (
            <div className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 rounded-full px-3 py-1">
              <Users className="w-3.5 h-3.5 text-green-400" />
              <span className="text-xs font-semibold text-green-400">{scanCount}</span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-6 space-y-5">

        {/* Event selector */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Scanning for event
          </label>

          {loadingEvents ? (
            <div className="h-12 bg-white/5 rounded-xl animate-pulse" />
          ) : events.length === 0 ? (
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 text-sm text-orange-300">
              No approved active events found. Make sure your event is approved on the platform.
            </div>
          ) : (
            <div className="relative">
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm appearance-none focus:outline-none focus:border-orange-500 pr-10"
              >
                <option value="">— Select event —</option>
                {events.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.title} · {new Date(e.date).toLocaleDateString("en-KE", { day: "numeric", month: "short" })}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          )}
        </div>

        {/* Mode toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => { setMode("camera"); reset(); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
              mode === "camera"
                ? "bg-orange-500 text-white"
                : "bg-white/5 text-gray-400 hover:bg-white/10"
            }`}
          >
            <Camera className="w-4 h-4" />
            Camera
          </button>
          <button
            onClick={() => { setMode("manual"); reset(); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
              mode === "manual"
                ? "bg-orange-500 text-white"
                : "bg-white/5 text-gray-400 hover:bg-white/10"
            }`}
          >
            <Keyboard className="w-4 h-4" />
            Manual
          </button>
        </div>

        {/* ── Camera view ── */}
        {mode === "camera" && (
          <div className="relative">
            <div
              id="qr-reader"
              ref={scannerRef}
              className="w-full rounded-2xl overflow-hidden bg-black"
              style={{ minHeight: 300 }}
            />
            {/* Overlay frame */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-56 h-56 border-2 border-orange-400 rounded-2xl opacity-70">
                {/* Corner accents */}
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-orange-400 rounded-tl-xl" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-orange-400 rounded-tr-xl" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-orange-400 rounded-bl-xl" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-orange-400 rounded-br-xl" />
              </div>
            </div>
            <p className="text-center text-xs text-gray-500 mt-2">
              Point camera at the QR code on the ticket
            </p>
          </div>
        )}

        {/* ── Manual entry ── */}
        {mode === "manual" && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Ticket token or booking ref
              </label>
              <input
                type="text"
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && validate(manualToken)}
                placeholder="tk_abc123… or paste full URL"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 placeholder:text-gray-600 font-mono"
                autoFocus
              />
            </div>
            <button
              onClick={() => validate(manualToken)}
              disabled={!manualToken.trim() || status === "scanning"}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {status === "scanning" ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Checking…</>
              ) : (
                <><Ticket className="w-4 h-4" /> Validate Ticket</>
              )}
            </button>
          </div>
        )}

        {/* ── Result card ── */}
        {status !== "idle" && status !== "scanning" && result && (
          <div className={`rounded-2xl border p-5 space-y-4 ${
            status === "success"
              ? "bg-green-500/10 border-green-500/30"
              : status === "duplicate"
              ? "bg-yellow-500/10 border-yellow-500/30"
              : "bg-red-500/10 border-red-500/30"
          }`}>
            {/* Status icon + message */}
            <div className="flex items-start gap-3">
              {status === "success" && <CheckCircle2 className="w-7 h-7 text-green-400 shrink-0 mt-0.5" />}
              {status === "duplicate" && <AlertCircle className="w-7 h-7 text-yellow-400 shrink-0 mt-0.5" />}
              {status === "error" && <XCircle className="w-7 h-7 text-red-400 shrink-0 mt-0.5" />}
              <div>
                <p className={`font-bold text-base ${
                  status === "success" ? "text-green-300"
                  : status === "duplicate" ? "text-yellow-300"
                  : "text-red-300"
                }`}>
                  {status === "success" ? "Entry Granted" : status === "duplicate" ? "Already Used" : "Invalid Ticket"}
                </p>
                <p className="text-sm text-gray-300 mt-0.5">{result.message}</p>
              </div>
            </div>

            {/* Attendee details */}
            {result.attendee && (
              <div className="bg-white/5 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Name</span>
                  <span className="font-semibold">{result.attendee.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Tickets</span>
                  <span className="font-semibold">{result.attendee.quantity} × entry</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Ref</span>
                  <span className="font-mono text-xs text-gray-300">{result.attendee.bookingRef}</span>
                </div>
                {result.attendee.checkedInAt && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Checked in
                    </span>
                    <span className="text-xs text-gray-300">
                      {new Date(result.attendee.checkedInAt).toLocaleTimeString("en-KE", {
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Next scan button */}
            <button
              onClick={reset}
              className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white font-medium py-2.5 rounded-xl transition-colors text-sm"
            >
              <RotateCcw className="w-4 h-4" />
              Scan next ticket
            </button>
          </div>
        )}

        {/* ── Scanning indicator (camera mode) ── */}
        {mode === "camera" && status === "scanning" && (
          <div className="flex items-center justify-center gap-3 py-4 text-orange-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm font-medium">Validating ticket…</span>
          </div>
        )}

        {/* No camera fallback tip */}
        {mode === "camera" && (
          <p className="text-center text-xs text-gray-600">
            Camera not working?{" "}
            <button
              onClick={() => setMode("manual")}
              className="text-orange-400 hover:text-orange-300 underline"
            >
              Switch to manual entry
            </button>
          </p>
        )}

        {/* Event info pill */}
        {selectedEvent && (
          <div className="flex items-center gap-2 text-xs text-gray-500 justify-center pt-2">
            <CameraOff className="w-3.5 h-3.5" />
            <span>
              Scanning for: <span className="text-gray-300 font-medium">{selectedEvent.title}</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
