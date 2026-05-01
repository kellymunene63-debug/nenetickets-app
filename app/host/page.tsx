"use client";

import { useState, useEffect, useRef } from "react";
import Navbar from "../../components/shared/Navbar";
import {
  Upload, CheckCircle2, DollarSign, Sparkles, Plus, Trash2, Tag,
  BarChart3, Users, ArrowLeft, LogOut, Eye, EyeOff, Lock,
  ShieldCheck, AlertCircle, ScanLine, Ticket, TrendingUp, Calendar
} from "lucide-react";
import Link from "next/link";

export default function HostPage() {
  const [view, setView] = useState("loading");
  const [host, setHost] = useState<any>(null);
  const [myEvents, setMyEvents] = useState<any[]>([]);
  const [soldTickets, setSoldTickets] = useState<any[]>([]);
  const [stats, setStats] = useState({ revenue: 0, attendees: 0, events: 0 });

  const [formData, setFormData] = useState({
    title: "", location: "", date: "", category: "Music",
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070",
  });
  const [tickets, setTickets] = useState([{ name: "Regular", price: "2500" }]);
  const [newTicket, setNewTicket] = useState({ name: "", price: "" });
  const [isPublished, setIsPublished] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);

  useEffect(() => {
    const savedHost = localStorage.getItem("nene_active_session");
    if (savedHost) {
      setHost(JSON.parse(savedHost));
      loadDashboardData();
      setView("dashboard");
    } else {
      setView("auth");
    }
  }, []);

  const checkPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    setPasswordStrength(score);
    return score;
  };

  const handleSignup = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAuthError("");
    const form = e.currentTarget;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const phone = (form.elements.namedItem("phone") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;
    const confirmPassword = (form.elements.namedItem("confirmPassword") as HTMLInputElement).value;

    if (password !== confirmPassword) { setAuthError("Passwords do not match."); return; }
    if (passwordStrength < 3) { setAuthError("Password is too weak."); return; }

    const newHost = { name, email, phone, password, joined: new Date().toLocaleDateString() };
    const existingUsers = JSON.parse(localStorage.getItem("nene_users_db") || "[]");
    if (existingUsers.find((u: any) => u.email === email)) { setAuthError("Account already exists."); return; }

    existingUsers.push(newHost);
    localStorage.setItem("nene_users_db", JSON.stringify(existingUsers));
    localStorage.setItem("nene_active_session", JSON.stringify(newHost));
    setHost(newHost);
    loadDashboardData();
    setView("dashboard");
  };

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAuthError("");
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    const existingUsers = JSON.parse(localStorage.getItem("nene_users_db") || "[]");
    const foundUser = existingUsers.find((u: any) => u.email === email && u.password === password);
    if (foundUser) {
      localStorage.setItem("nene_active_session", JSON.stringify(foundUser));
      setHost(foundUser);
      loadDashboardData();
      setView("dashboard");
    } else {
      setAuthError("Invalid email or password.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("nene_active_session");
    setHost(null);
    setView("auth");
    setAuthMode("login");
  };

  const loadDashboardData = () => {
    const allEvents: any[] = JSON.parse(localStorage.getItem("nene_events") || "[]");
    const allSold: any[] = JSON.parse(localStorage.getItem("nene_sold_tickets") || "[]");

    setMyEvents(allEvents);
    setSoldTickets(allSold);

    // Calculate real revenue from actual ticket sales
    let totalRevenue = 0;
    allSold.forEach((ticket: any) => {
      const matchedEvent = allEvents.find((ev: any) =>
        ev.title === ticket.eventTitle
      );
      if (matchedEvent) {
        const priceStr = matchedEvent.price?.replace(/[^0-9]/g, "") || "0";
        totalRevenue += parseInt(priceStr) || 0;
      }
    });

    setStats({
      revenue: totalRevenue,
      attendees: allSold.length,
      events: allEvents.length,
    });
  };

  const getTicketsSoldForEvent = (eventTitle: string) => {
    return soldTickets.filter((t: any) => t.eventTitle === eventTitle).length;
  };

  const getRevenueForEvent = (event: any) => {
    const sold = getTicketsSoldForEvent(event.title);
    const priceStr = event.price?.replace(/[^0-9]/g, "") || "0";
    return sold * (parseInt(priceStr) || 0);
  };

  const handleDeleteEvent = (eventId: string) => {
    const updated = myEvents.filter((ev: any) => ev.id !== eventId);
    localStorage.setItem("nene_events", JSON.stringify(updated));
    setMyEvents(updated);
    setDeleteConfirm(null);
    loadDashboardData();
  };

  const handlePublish = () => {
    if (!formData.title || !formData.date || !formData.location) return;
    setIsLoading(true);
    const lowestPrice = tickets.length > 0
      ? Math.min(...tickets.map((t) => parseInt(t.price) || 0))
      : 0;
    const newEvent = {
      id: Date.now().toString(),
      title: formData.title,
      date: formData.date,
      location: formData.location,
      price: `KES ${lowestPrice.toLocaleString()}`,
      image: formData.image,
      category: formData.category,
      aiTag: "New Added ✨",
      tickets,
    };
    setTimeout(() => {
      const existing = JSON.parse(localStorage.getItem("nene_events") || "[]");
      existing.unshift(newEvent);
      localStorage.setItem("nene_events", JSON.stringify(existing));
      setIsLoading(false);
      setIsPublished(true);
      loadDashboardData();
    }, 1500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setFormData({ ...formData, image: URL.createObjectURL(file) });
  };

  const addTicket = () => {
    if (newTicket.name && newTicket.price) {
      setTickets([...tickets, newTicket]);
      setNewTicket({ name: "", price: "" });
    }
  };

  const removeTicket = (index: number) => setTickets(tickets.filter((_, i) => i !== index));

  // ─── AUTH VIEW ───────────────────────────────────────────────────────────────
  if (view === "auth") {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <Navbar />
        <div className="max-w-md w-full bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <ShieldCheck className="w-32 h-32" />
          </div>
          <div className="text-center mb-8 relative z-10">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg shadow-blue-600/20">🔒</div>
            <h1 className="text-2xl font-bold">{authMode === "login" ? "Organizer Login" : "Secure Sign Up"}</h1>
            <p className="text-gray-400 text-sm">Access your NeneTickets dashboard safely.</p>
          </div>

          {authError && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl mb-6 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> {authError}
            </div>
          )}

          <form onSubmit={authMode === "login" ? handleLogin : handleSignup} className="space-y-4 relative z-10">
            {authMode === "signup" && (
              <>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Business Name</label>
                  <input name="name" required placeholder="e.g. Nene Events Ltd" className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-blue-500 transition" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Phone Number</label>
                  <input name="phone" type="tel" required placeholder="07XX XXX XXX" className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-blue-500 transition" />
                </div>
              </>
            )}
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Email Address</label>
              <input name="email" type="email" required placeholder="name@company.com" className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-blue-500 transition" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Password</label>
              <div className="relative">
                <input name="password" type={showPassword ? "text" : "password"} required placeholder="••••••••"
                  onChange={(e) => authMode === "signup" && checkPasswordStrength(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-blue-500 transition pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-500 hover:text-white">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            {authMode === "signup" && (
              <div className="space-y-2">
                <div className="flex gap-1 h-1">
                  {[1,2,3,4].map((n) => (
                    <div key={n} className={`flex-1 rounded-full ${passwordStrength >= n ? (n <= 1 ? "bg-red-500" : n <= 2 ? "bg-yellow-500" : n <= 3 ? "bg-blue-500" : "bg-green-500") : "bg-gray-700"}`} />
                  ))}
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase mt-4">Confirm Password</label>
                  <input name="confirmPassword" type="password" required placeholder="••••••••" className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-blue-500 transition" />
                </div>
              </div>
            )}
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20">
              <Lock className="w-4 h-4" /> {authMode === "login" ? "Secure Login" : "Create Account"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <p className="text-gray-400">
              {authMode === "login" ? "Don't have an account? " : "Already have an account? "}
              <button onClick={() => { setAuthMode(authMode === "login" ? "signup" : "login"); setAuthError(""); }} className="text-blue-400 font-bold hover:underline">
                {authMode === "login" ? "Sign Up" : "Log In"}
              </button>
            </p>
          </div>
        </div>
      </main>
    );
  }

  // ─── DASHBOARD VIEW ──────────────────────────────────────────────────────────
  if (view === "dashboard") {
    return (
      <main className="min-h-screen bg-black text-white">
        <Navbar />
        <div className="container mx-auto px-4 py-24">

          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
            <div>
              <p className="text-blue-400 text-sm font-bold uppercase tracking-widest mb-1">Organizer Dashboard</p>
              <h1 className="text-3xl font-bold mb-1">Welcome back, {host?.name} 👋</h1>
              <p className="text-gray-400 text-sm">Here&apos;s how your events are performing.</p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <button onClick={handleLogout} className="text-gray-400 hover:text-white flex items-center gap-2 text-sm font-bold px-4 py-2 border border-white/10 rounded-xl hover:border-white/30 transition">
                <LogOut className="w-4 h-4" /> Logout
              </button>
              <Link href="/validator">
                <button className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition shadow-lg shadow-purple-900/30">
                  <ScanLine className="w-4 h-4" /> Scan Tickets
                </button>
              </Link>
              <button onClick={() => { setView("create"); setIsPublished(false); }} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition shadow-lg shadow-blue-900/30">
                <Plus className="w-4 h-4" /> Create Event
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:border-green-500/30 transition group">
              <div className="flex items-center gap-2 text-gray-400 font-bold mb-3 text-sm uppercase tracking-wider">
                <DollarSign className="w-4 h-4 text-green-400" /> Total Revenue
              </div>
              <div className="text-3xl font-bold mb-1">KES {stats.revenue.toLocaleString()}</div>
              <p className="text-xs text-gray-500">From {stats.attendees} ticket{stats.attendees !== 1 ? "s" : ""} sold</p>
            </div>
            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:border-blue-500/30 transition">
              <div className="flex items-center gap-2 text-gray-400 font-bold mb-3 text-sm uppercase tracking-wider">
                <Users className="w-4 h-4 text-blue-400" /> Attendees
              </div>
              <div className="text-3xl font-bold mb-1">{stats.attendees}</div>
              <p className="text-xs text-gray-500">Confirmed ticket holders</p>
            </div>
            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:border-purple-500/30 transition">
              <div className="flex items-center gap-2 text-gray-400 font-bold mb-3 text-sm uppercase tracking-wider">
                <BarChart3 className="w-4 h-4 text-purple-400" /> Active Events
              </div>
              <div className="text-3xl font-bold mb-1">{stats.events}</div>
              <p className="text-xs text-gray-500">Published & live</p>
            </div>
          </div>

          {/* Events Table */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Your Events</h2>
            {myEvents.length > 0 && (
              <span className="text-sm text-gray-400">{myEvents.length} event{myEvents.length !== 1 ? "s" : ""} published</span>
            )}
          </div>

          {myEvents.length > 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[640px]">
                  <thead className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Event</th>
                      <th className="px-6 py-4"><Calendar className="w-3.5 h-3.5 inline mr-1" />Date</th>
                      <th className="px-6 py-4"><Ticket className="w-3.5 h-3.5 inline mr-1" />Sold</th>
                      <th className="px-6 py-4"><TrendingUp className="w-3.5 h-3.5 inline mr-1" />Revenue</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {myEvents.map((event: any) => {
                      const sold = getTicketsSoldForEvent(event.title);
                      const revenue = getRevenueForEvent(event);
                      const isConfirming = deleteConfirm === event.id;
                      return (
                        <tr key={event.id} className="hover:bg-white/5 transition">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-gray-800 overflow-hidden flex-shrink-0">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                              </div>
                              <span className="font-bold text-sm">{event.title}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-400 text-sm">{event.date}</td>
                          <td className="px-6 py-4">
                            <span className={`font-bold text-sm ${sold > 0 ? "text-green-400" : "text-gray-500"}`}>
                              {sold} ticket{sold !== 1 ? "s" : ""}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-mono text-sm font-bold">
                            {revenue > 0 ? `KES ${revenue.toLocaleString()}` : <span className="text-gray-500">—</span>}
                          </td>
                          <td className="px-6 py-4">
                            <span className="bg-green-500/20 text-green-400 text-xs font-bold px-2 py-1 rounded-full">LIVE</span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {isConfirming ? (
                              <div className="flex items-center justify-end gap-2">
                                <span className="text-xs text-gray-400">Delete?</span>
                                <button onClick={() => handleDeleteEvent(event.id)} className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1 rounded-lg font-bold hover:bg-red-500/30 transition">Yes</button>
                                <button onClick={() => setDeleteConfirm(null)} className="text-xs bg-white/10 text-gray-300 px-3 py-1 rounded-lg font-bold hover:bg-white/20 transition">No</button>
                              </div>
                            ) : (
                              <button onClick={() => setDeleteConfirm(event.id)} className="text-gray-500 hover:text-red-400 transition p-1.5 rounded-lg hover:bg-red-500/10" title="Delete event">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-24 bg-white/5 rounded-2xl border border-white/10 border-dashed">
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">🎪</div>
              <h3 className="font-bold text-lg mb-2">No events yet</h3>
              <p className="text-gray-400 mb-6 text-sm">Create your first event and start selling tickets.</p>
              <button onClick={() => setView("create")} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition inline-flex items-center gap-2">
                <Plus className="w-4 h-4" /> Create First Event
              </button>
            </div>
          )}
        </div>
      </main>
    );
  }

  // ─── CREATE EVENT VIEW ───────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="container mx-auto px-4 py-24">
        <button onClick={() => { setView("dashboard"); setIsPublished(false); }} className="mb-8 flex items-center gap-2 text-gray-400 hover:text-white transition font-bold">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Form */}
          <div className="w-full lg:w-1/2 space-y-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">Create New Event</h1>
              <p className="text-gray-400">Fill in the details and launch your event.</p>
            </div>

            {!isPublished ? (
              <div className="space-y-6 bg-white/5 border border-white/10 p-8 rounded-3xl">
                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-2">Event Title <span className="text-red-400">*</span></label>
                  <input name="title" onChange={handleChange} placeholder="e.g. Nairobi Rock Festival" className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-blue-500 transition" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-2">Cover Image</label>
                  <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
                  <div className="grid grid-cols-2 gap-4">
                    <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-white/20 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-500/5 transition text-center group">
                      <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition">
                        <Upload className="w-5 h-5 text-blue-400" />
                      </div>
                      <span className="text-sm font-bold text-gray-300">Upload Photo</span>
                    </div>
                    <select name="image" onChange={handleChange} className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-blue-500 transition appearance-none cursor-pointer">
                      <option value="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070">Stock: Concert</option>
                      <option value="https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=1931">Stock: Sports</option>
                      <option value="https://images.unsplash.com/photo-1544531586-fde5298cdd40?q=80&w=2070">Stock: Conference</option>
                      <option value="https://images.unsplash.com/photo-1574169208507-84376144848b?q=80&w=2079">Stock: Art</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2">Date & Time <span className="text-red-400">*</span></label>
                    <input name="date" type="datetime-local"
                      onChange={(e) => {
                        const raw = e.target.value;
                        if (!raw) return;
                        const formatted = new Date(raw).toLocaleString("en-KE", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
                        setFormData({ ...formData, date: formatted });
                      }}
                      min={new Date().toISOString().slice(0, 16)}
                      className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-blue-500 transition [color-scheme:dark]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2">Location <span className="text-red-400">*</span></label>
                    <input name="location" onChange={handleChange} placeholder="e.g. KICC, Nairobi" className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-blue-500 transition" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-2">Category</label>
                  <select name="category" onChange={handleChange} className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-blue-500 transition appearance-none cursor-pointer">
                    {["Music", "Sports", "Business", "Arts", "Tech", "Nightlife"].map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Ticket Options */}
                <div className="bg-black/30 p-6 rounded-2xl border border-white/5">
                  <label className="block text-sm font-bold text-blue-400 mb-4 flex items-center gap-2">
                    <Tag className="w-4 h-4" /> Ticket Types
                  </label>
                  <div className="flex gap-3 mb-4">
                    <input placeholder="Type (e.g. VVIP)" value={newTicket.name} onChange={(e) => setNewTicket({ ...newTicket, name: e.target.value })} className="flex-1 bg-black/50 border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:border-blue-500" />
                    <input type="number" placeholder="KES Price" value={newTicket.price} onChange={(e) => setNewTicket({ ...newTicket, price: e.target.value })} className="w-32 bg-black/50 border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:border-blue-500" />
                    <button onClick={addTicket} className="bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 p-3 rounded-xl transition border border-blue-500/20">
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {tickets.map((ticket, index) => (
                      <div key={index} className="flex justify-between items-center bg-white/5 px-4 py-3 rounded-lg border border-white/5">
                        <span className="font-bold text-sm">{ticket.name}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-gray-400 text-sm font-mono">KES {parseInt(ticket.price).toLocaleString()}</span>
                          <button onClick={() => removeTicket(index)} className="text-gray-600 hover:text-red-400 transition">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button onClick={handlePublish}
                  disabled={isLoading || tickets.length === 0 || !formData.title || !formData.date || !formData.location}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold py-4 rounded-xl transition shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2">
                  {isLoading ? "Publishing..." : <><Sparkles className="w-5 h-5" /> Launch Event</>}
                </button>
              </div>
            ) : (
              <div className="bg-green-500/10 border border-green-500/20 p-10 rounded-3xl text-center">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30">
                  <CheckCircle2 className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Event Live! 🎉</h2>
                <p className="text-gray-300 mb-8">Your event is now live and accepting ticket purchases.</p>
                <div className="flex gap-4 justify-center flex-wrap">
                  <Link href="/events">
                    <button className="bg-white/10 border border-white/20 text-white font-bold py-3 px-6 rounded-xl hover:bg-white/20 transition">View on Events Page</button>
                  </Link>
                  <button onClick={() => { setView("dashboard"); setIsPublished(false); }} className="bg-white text-black font-bold py-3 px-6 rounded-xl hover:bg-gray-200 transition">
                    Go to Dashboard
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Live Preview */}
          <div className="hidden lg:flex w-1/2 flex-col items-start sticky top-24 h-fit">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Live Preview
            </div>
            <div className="w-full max-w-sm bg-gray-900 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
              <div className="h-56 relative bg-gray-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
              </div>
              <div className="p-5">
                <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">{formData.category}</span>
                <h3 className="text-xl font-bold mt-1 mb-2">{formData.title || "Your Event Title"}</h3>
                <p className="text-gray-400 text-sm">{formData.date || "Date"} • {formData.location || "Location"}</p>
                {tickets.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-xs text-gray-500 mb-2">From</p>
                    <p className="text-2xl font-bold">KES {Math.min(...tickets.map(t => parseInt(t.price) || 0)).toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
