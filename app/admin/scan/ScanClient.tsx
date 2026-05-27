"use client";
// app/admin/scan/ScanClient.tsx
// The actual scanner UI — receives all approved events as props.

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Camera, Keyboard, CheckCircle2, XCircle, AlertCircle,
  Loader2, ChevronDown, RotateCcw, Ticket, Users,
  Clock, ShieldCheck, CameraOff,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────

interface HostedEvent {
  id:       string;
  title:    string;
  date:     string;
  venue?:   string;
}

interface ScanResult {
  valid:        boolean;
  alreadyUsed?: boolean;
  message:      string;
  attendee?: {
    name:         string;
    email:        string;
    bookingRef:   string;
    quantity:     number;
    eventTitle:   string;
    checkedInAt?: string;
  };
}

type ScanStatus = "idle" | "scanning" | "success" | "error" | "duplicate";

// ─── Component ───────────────────────────────────────────────────

export default function AdminScanClient({ events }: { events: HostedEvent[] }) {
  const [selectedEventId, setSelectedEventId] = useState<string>(
    events.length === 1 ? events[0].id : ""
  );
  const [mode,        setMode]        = useState<"camera" | "manual">("camera");
  const [manualToken, setManualToken] = useState("");
  const [status,      setStatus]      = useState<ScanStatus>("idle");
  const [result,      setResult]      = useState<ScanResult | null>(null);
  const [scanCount,   setScanCount]   = useState(0);
  const [sessionLog,  setSessionLog]  = useState<
    { name: string; time: string; valid: boolean }[]
  >([]);

  const scannerRef  = useRef<HTMLDivElement>(null);
  const html5QrRef  = useRef<{ stop: () => Promise<void> } | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Validate token ────────────────────────────────────────────
  const validate = useCallback(async (token: string) => {
    const clean = token.trim();
    if (!clean) return;

    const urlMatch   = clean.match(/\/verify\/(tk_[a-zA-Z0-9]+)/);
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
        setSessionLog((log) => [
          {
            name:  data.attendee?.name ?? "Unknown",
            time:  new Date().toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" }),
            valid: true,
          },
          ...log.slice(0, 9), // keep last 10
        ]);
      } else if (data.alreadyUsed) {
        setStatus("duplicate");
        setSessionLog((log) => [
          {
            name:  data.attendee?.name ?? "Unknown",
            time:  new Date().toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" }),
            valid: false,
          },
          ...log.slice(0, 9),
        ]);
      } else {
        setStatus("error");
      }
    } catch {
      setResult({ valid: false, message: "Connection error. Check your internet." });
      setStatus("error");
    }
  }, [selectedEventId]);

  // ── Camera scanner ────────────────────────────────────────────
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
      const { Html5Qrcode } = await import("html5-qrcode");
      if (!active || !scannerRef.current) return;

      const scanner = new Html5Qrcode("admin-qr-reader");
      html5QrRef.current = scanner;

      try {
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 240, height: 240 } },
          (decodedText) => {
            if (debounceRef.current) return;
            debounceRef.current = setTimeout(() => {
              debounceRef.current = null;
            }, 2500);
            validate(decodedText);
          },
          () => {}
        );
      } catch {
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

  function reset() {
    setStatus("idle");
    setResult(null);
    setManualToken("");
  }

  const selectedEvent = events.find((e) => e.id === selectedEventId);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pb-24">

      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0a0a0a]/95 backdrop-blur border-b border-white/10 px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-orange-500/15 border border-orange-500/25 rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-orange-400" />
            </div>
            <div>
              <h1 className="text-base font-bold leading-tight">Admin Scanner</h1>
              <p className="text-[10px] text-orange-400 font-semibold uppercase tracking-wider">
                Platform Admin
              </p>
            </div>
          </div>
          {scanCount > 0 && (
            <div className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 rounded-full px-3 py-1">
              <Users className="w-3.5 h-3.5 text-green-400" />
              <span className="text-xs font-bold text-green-400">{scanCount} in</span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-5 space-y-4">

        {/* Event selector */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Event ({events.length} active)
          </label>
          {events.length === 0 ? (
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 text-sm text-orange-300">
              No approved events found on the platform yet.
            </div>
          ) : (
            <div className="relative">
              <select
                value={selectedEventId}
                onChange={(e) => { setSelectedEventId(e.target.value); reset(); }}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm appearance-none focus:outline-none focus:border-orange-500 pr-10"
              >
                <option value="">— All events (no filter) —</option>
                {events.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.title} ·{" "}
                    {new Date(e.date).toLocaleDateString("en-KE", {
                      day: "numeric", month: "short",
                    })}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          )}
          {selectedEvent?.venue && (
            <p className="text-xs text-gray-500 mt-1.5 pl-1">📍 {selectedEvent.venue}</p>
          )}
        </div>

        {/* Mode toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => { setMode("camera"); reset(); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
              mode === "camera" ? "bg-orange-500 text-white" : "bg-white/5 text-gray-400 hover:bg-white/10"
            }`}
          >
            <Camera className="w-4 h-4" /> Camera
          </button>
          <button
            onClick={() => { setMode("manual"); reset(); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
              mode === "manual" ? "bg-orange-500 text-white" : "bg-white/5 text-gray-400 hover:bg-white/10"
            }`}
          >
            <Keyboard className="w-4 h-4" /> Manual
          </button>
        </div>

        {/* Camera */}
        {mode === "camera" && (
          <div className="relative">
            <div
              id="admin-qr-reader"
              ref={scannerRef}
              className="w-full rounded-2xl overflow-hidden bg-black"
              style={{ minHeight: 280 }}
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative w-52 h-52">
                <div className="absolute top-0 left-0 w-7 h-7 border-t-4 border-l-4 border-orange-400 rounded-tl-xl" />
                <div className="absolute top-0 right-0 w-7 h-7 border-t-4 border-r-4 border-orange-400 rounded-tr-xl" />
                <div className="absolute bottom-0 left-0 w-7 h-7 border-b-4 border-l-4 border-orange-400 rounded-bl-xl" />
                <div className="absolute bottom-0 right-0 w-7 h-7 border-b-4 border-r-4 border-orange-400 rounded-br-xl" />
              </div>
            </div>
            <p className="text-center text-xs text-gray-500 mt-2">
              Point camera at attendee&apos;s QR code
            </p>
          </div>
        )}

        {/* Manual */}
        {mode === "manual" && (
          <div className="space-y-3">
            <input
              type="text"
              value={manualToken}
              onChange={(e) => setManualToken(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && validate(manualToken)}
              placeholder="Paste ticket token or full verify URL…"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 placeholder:text-gray-600 font-mono"
              autoFocus
            />
            <button
              onClick={() => validate(manualToken)}
              disabled={!manualToken.trim() || status === "scanning"}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {status === "scanning"
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Checking…</>
                : <><Ticket className="w-4 h-4" /> Validate Ticket</>}
            </button>
          </div>
        )}

        {/* Scanning spinner (camera mode) */}
        {mode === "camera" && status === "scanning" && (
          <div className="flex items-center justify-center gap-3 py-3 text-orange-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm font-medium">Validating…</span>
          </div>
        )}

        {/* Result card */}
        {status !== "idle" && status !== "scanning" && result && (
          <div className={`rounded-2xl border p-5 space-y-4 ${
            status === "success"   ? "bg-green-500/10 border-green-500/30"
            : status === "duplicate" ? "bg-yellow-500/10 border-yellow-500/30"
            : "bg-red-500/10 border-red-500/30"
          }`}>
            <div className="flex items-start gap-3">
              {status === "success"   && <CheckCircle2 className="w-7 h-7 text-green-400 shrink-0 mt-0.5" />}
              {status === "duplicate" && <AlertCircle  className="w-7 h-7 text-yellow-400 shrink-0 mt-0.5" />}
              {status === "error"     && <XCircle      className="w-7 h-7 text-red-400 shrink-0 mt-0.5" />}
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

            {result.attendee && (
              <div className="bg-white/5 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Name</span>
                  <span className="font-semibold">{result.attendee.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Event</span>
                  <span className="font-semibold text-right max-w-[55%]">{result.attendee.eventTitle}</span>
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
                      <Clock className="w-3 h-3" /> Scanned at
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

            <button
              onClick={reset}
              className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white font-medium py-2.5 rounded-xl transition-colors text-sm"
            >
              <RotateCcw className="w-4 h-4" /> Scan next ticket
            </button>
          </div>
        )}

        {/* Camera fallback tip */}
        {mode === "camera" && (
          <p className="text-center text-xs text-gray-600">
            Camera not working?{" "}
            <button onClick={() => setMode("manual")} className="text-orange-400 underline">
              Switch to manual entry
            </button>
          </p>
        )}

        {/* Session log */}
        {sessionLog.length > 0 && (
          <div className="mt-2">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-3.5 h-3.5 text-gray-500" />
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Session log
              </p>
            </div>
            <div className="space-y-1.5">
              {sessionLog.map((entry, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs ${
                    entry.valid
                      ? "bg-green-500/5 border border-green-500/15"
                      : "bg-yellow-500/5 border border-yellow-500/15"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {entry.valid
                      ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                      : <AlertCircle  className="w-3.5 h-3.5 text-yellow-400" />}
                    <span className="text-gray-300 font-medium">{entry.name}</span>
                  </div>
                  <span className="text-gray-500">{entry.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Current filter indicator */}
        <div className="flex items-center gap-2 text-xs text-gray-600 justify-center pt-1">
          <CameraOff className="w-3.5 h-3.5" />
          <span>
            {selectedEvent
              ? <>Filtering: <span className="text-gray-400 font-medium">{selectedEvent.title}</span></>
              : <span className="text-gray-500">No event filter — accepting all events</span>}
          </span>
        </div>

      </div>
    </div>
  );
}
