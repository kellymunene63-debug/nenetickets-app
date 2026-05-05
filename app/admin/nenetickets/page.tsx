"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ShieldCheck, Lock, Eye, EyeOff, CheckCircle2, XCircle,
  Clock, AlertCircle, RefreshCw, LogOut, Ticket, Calendar,
  MapPin, User, Mail, Phone, CreditCard, Search, Filter,
} from "lucide-react";

interface Event {
  id: string;
  title: string;
  date: string;
  time?: string;
  location: string;
  category?: string;
  organizerEmail?: string;
  organizerName?: string;
  status?: "pending" | "approved" | "rejected";
  rejectReason?: string;
  createdAt?: string;
  cancelled?: boolean;
  tickets?: Array<{ name: string; price: string; capacity: string }>;
  subaccount_code?: string;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  image?: string;
}

type StatusFilter = "all" | "pending" | "approved" | "rejected";

export default function AdminPage() {
  const [authed,       setAuthed]       = useState(false);
  const [password,     setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authError,    setAuthError]    = useState("");
  const [authLoading,  setAuthLoading]  = useState(false);

  const [events,       setEvents]       = useState<Event[]>([]);
  const [loading,      setLoading]      = useState(false);
  const [actionId,     setActionId]     = useState<string | null>(null);
  const [rejectModal,  setRejectModal]  = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending");
  const [search,       setSearch]       = useState("");

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/events?admin=1");
      if (res.ok) setEvents(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authed) fetchEvents();
  }, [authed, fetchEvents]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json() as { success: boolean; error?: string };
      if (data.success) {
        setAuthed(true);
        sessionStorage.setItem("nene_admin_authed", "1");
      } else {
        setAuthError(data.error ?? "Incorrect password");
      }
    } catch {
      setAuthError("Network error. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  };

  // Restore session on page reload
  useEffect(() => {
    if (sessionStorage.getItem("nene_admin_authed") === "1") setAuthed(true);
  }, []);

  const approve = async (id: string) => {
    setActionId(id);
    try {
      await fetch(`/api/events/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved" }),
      });
      setEvents((prev) => prev.map((e) => e.id === id ? { ...e, status: "approved" } : e));
    } finally {
      setActionId(null);
    }
  };

  const reject = async (id: string) => {
    setActionId(id);
    try {
      await fetch(`/api/events/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rejected", rejectReason }),
      });
      setEvents((prev) => prev.map((e) => e.id === id ? { ...e, status: "rejected", rejectReason } : e));
      setRejectModal(null);
      setRejectReason("");
    } finally {
      setActionId(null);
    }
  };

  const logout = () => {
    sessionStorage.removeItem("nene_admin_authed");
    setAuthed(false);
  };

  // ── Login screen ─────────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <main className="min-h-screen bg-[#050511] text-white flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-white/5 border border-white/10 rounded-3xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-600/30">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-xl font-bold">Admin Panel</h1>
            <p className="text-gray-500 text-sm mt-1">NeneTickets · Restricted Access</p>
          </div>

          {authError && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl mb-4 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Admin password"
                required
                className="w-full bg-black/50 border border-white/10 rounded-xl p-3.5 text-white outline-none focus:border-blue-500 transition pr-10 placeholder:text-gray-700"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-gray-500 hover:text-white transition">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2"
            >
              {authLoading
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Verifying…</>
                : <><Lock className="w-4 h-4" /> Enter Admin Panel</>
              }
            </button>
          </form>
        </div>
      </main>
    );
  }

  // ── Derived data ─────────────────────────────────────────────────────────────
  const counts = {
    pending:  events.filter((e) => !e.status || e.status === "pending").length,
    approved: events.filter((e) => e.status === "approved").length,
    rejected: events.filter((e) => e.status === "rejected").length,
  };

  const filtered = events.filter((e) => {
    const matchStatus =
      statusFilter === "all" ? true :
      statusFilter === "pending" ? (!e.status || e.status === "pending") :
      e.status === statusFilter;

    const q = search.toLowerCase();
    const matchSearch = !q ||
      e.title?.toLowerCase().includes(q) ||
      e.organizerEmail?.toLowerCase().includes(q) ||
      e.location?.toLowerCase().includes(q);

    return matchStatus && matchSearch;
  });

  // ── Admin dashboard ───────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-[#050511] text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/40 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 max-w-6xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-blue-400" />
            <div>
              <h1 className="font-bold text-sm">NeneTickets Admin</h1>
              <p className="text-xs text-gray-500">Event Moderation Panel</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchEvents}
              disabled={loading}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white border border-white/10 px-3 py-2 rounded-xl transition hover:border-white/20"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
            </button>
            <button onClick={logout} className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 border border-red-500/20 px-3 py-2 rounded-xl transition">
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Pending Review", count: counts.pending,  color: "yellow", icon: Clock },
            { label: "Approved",       count: counts.approved, color: "green",  icon: CheckCircle2 },
            { label: "Rejected",       count: counts.rejected, color: "red",    icon: XCircle },
          ].map(({ label, count, color, icon: Icon }) => (
            <div key={label} className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <div className={`text-xs font-bold uppercase tracking-wider text-${color}-400 mb-1 flex items-center gap-1.5`}>
                <Icon className="w-3.5 h-3.5" /> {label}
              </div>
              <div className="text-3xl font-bold">{count}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, organizer email, or location…"
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white outline-none focus:border-blue-500 transition placeholder:text-gray-600"
            />
          </div>
          <div className="flex gap-2">
            {(["all", "pending", "approved", "rejected"] as StatusFilter[]).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`text-xs font-bold px-3 py-2.5 rounded-xl border capitalize transition ${
                  statusFilter === s
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
                }`}
              >
                {s} {s !== "all" && `(${counts[s as keyof typeof counts] ?? 0})`}
              </button>
            ))}
          </div>
        </div>

        {/* Event list */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-500">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-3" />
            Loading events…
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-600">
            <Filter className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No events match this filter</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((ev) => {
              const isPending  = !ev.status || ev.status === "pending";
              const isApproved = ev.status === "approved";
              const isRejected = ev.status === "rejected";

              return (
                <div
                  key={ev.id}
                  className={`bg-white/5 border rounded-2xl p-5 transition ${
                    isPending  ? "border-yellow-500/30" :
                    isApproved ? "border-green-500/20" :
                    "border-red-500/20"
                  }`}
                >
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Event image */}
                    {ev.image && (
                      <div className="w-full md:w-24 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gray-800">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={ev.image} alt={ev.title} className="w-full h-full object-cover" />
                      </div>
                    )}

                    {/* Event details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h2 className="font-bold text-base">{ev.title}</h2>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                              isPending  ? "text-yellow-400 border-yellow-500/30 bg-yellow-500/10" :
                              isApproved ? "text-green-400 border-green-500/30 bg-green-500/10" :
                              "text-red-400 border-red-500/30 bg-red-500/10"
                            }`}>
                              {isPending ? "⏳ Pending" : isApproved ? "✓ Approved" : "✗ Rejected"}
                            </span>
                            {ev.cancelled && (
                              <span className="text-xs font-bold px-2 py-0.5 rounded-full border text-red-400 border-red-500/30 bg-red-500/10">
                                Cancelled
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-3 text-xs text-gray-500 mt-1">
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{ev.date}{ev.time && ` · ${ev.time}`}</span>
                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{ev.location}</span>
                            {ev.category && <span className="flex items-center gap-1"><Ticket className="w-3 h-3" />{ev.category}</span>}
                          </div>
                        </div>
                      </div>

                      {/* Organizer info */}
                      <div className="mt-3 pt-3 border-t border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-500">
                        {ev.organizerEmail && (
                          <span className="flex items-center gap-1.5"><Mail className="w-3 h-3 text-blue-400" />{ev.organizerEmail}</span>
                        )}
                        {ev.organizerName && (
                          <span className="flex items-center gap-1.5"><User className="w-3 h-3 text-purple-400" />{ev.organizerName}</span>
                        )}
                        {ev.bankName && (
                          <span className="flex items-center gap-1.5"><CreditCard className="w-3 h-3 text-green-400" />{ev.bankName}</span>
                        )}
                        {ev.accountNumber && (
                          <span className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-orange-400" />Acc: {ev.accountNumber} — {ev.accountName}</span>
                        )}
                        {ev.subaccount_code && (
                          <span className="flex items-center gap-1.5 col-span-2 text-green-500/70">
                            ✓ Paystack subaccount: {ev.subaccount_code}
                          </span>
                        )}
                      </div>

                      {/* Ticket types */}
                      {ev.tickets && ev.tickets.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {ev.tickets.map((t, i) => (
                            <span key={i} className="text-xs bg-white/5 border border-white/10 px-2 py-1 rounded-lg">
                              {t.name} · KES {parseInt(t.price || "0").toLocaleString()} · {t.capacity} seats
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Reject reason */}
                      {isRejected && ev.rejectReason && (
                        <div className="mt-3 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                          <p className="text-xs text-red-400"><strong>Rejection reason:</strong> {ev.rejectReason}</p>
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex md:flex-col gap-2 flex-shrink-0 md:items-end justify-end">
                      {isPending && (
                        <>
                          <button
                            onClick={() => approve(ev.id)}
                            disabled={actionId === ev.id}
                            className="flex items-center gap-1.5 text-xs font-bold bg-green-600/15 hover:bg-green-600/25 border border-green-600/25 text-green-400 px-4 py-2.5 rounded-xl transition disabled:opacity-50"
                          >
                            {actionId === ev.id ? <div className="w-3.5 h-3.5 border-2 border-green-400/30 border-t-green-400 rounded-full animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                            Approve
                          </button>
                          <button
                            onClick={() => { setRejectModal(ev.id); setRejectReason(""); }}
                            className="flex items-center gap-1.5 text-xs font-bold bg-red-600/15 hover:bg-red-600/25 border border-red-600/25 text-red-400 px-4 py-2.5 rounded-xl transition"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </button>
                        </>
                      )}
                      {isApproved && (
                        <button
                          onClick={() => { setRejectModal(ev.id); setRejectReason(""); }}
                          className="flex items-center gap-1.5 text-xs font-bold bg-red-600/10 hover:bg-red-600/20 border border-red-600/20 text-red-400/70 px-4 py-2.5 rounded-xl transition"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Revoke
                        </button>
                      )}
                      {isRejected && (
                        <button
                          onClick={() => approve(ev.id)}
                          disabled={actionId === ev.id}
                          className="flex items-center gap-1.5 text-xs font-bold bg-green-600/10 hover:bg-green-600/20 border border-green-600/20 text-green-400/70 px-4 py-2.5 rounded-xl transition disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Re-approve
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reject / Revoke modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f0f2e] border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-400" /> Reject Event
            </h3>
            <p className="text-sm text-gray-500 mb-4">Optionally provide a reason. The organizer can see this in their dashboard.</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Incomplete event details, suspicious content, duplicate listing…"
              rows={3}
              className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-red-500 resize-none placeholder:text-gray-700 mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => setRejectModal(null)} className="flex-1 border border-white/10 text-gray-400 font-bold py-3 rounded-xl hover:bg-white/5 transition text-sm">
                Cancel
              </button>
              <button
                onClick={() => reject(rejectModal)}
                disabled={actionId === rejectModal}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white font-bold py-3 rounded-xl transition text-sm flex items-center justify-center gap-2"
              >
                {actionId === rejectModal ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <XCircle className="w-4 h-4" />}
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
