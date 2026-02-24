"use client";

import { useState, useEffect, useRef } from "react";
import Navbar from "../../components/shared/Navbar";
import { Upload, CheckCircle2, DollarSign, Sparkles, Plus, Trash2, Tag, BarChart3, Users, ArrowLeft, LogOut, Eye, EyeOff, Lock, ShieldCheck, AlertCircle, ScanLine } from "lucide-react";
import Link from "next/link";

export default function HostPage() {
  // --- STATE MANAGEMENT ---
  const [view, setView] = useState('loading'); // 'auth' | 'dashboard' | 'create'
  const [host, setHost] = useState<any>(null);
  
  // Dashboard Data
  const [myEvents, setMyEvents] = useState<any[]>([]);
  const [stats, setStats] = useState({ revenue: 0, attendees: 0, events: 0 });

  // Creator Form Data
  const [formData, setFormData] = useState({
    title: "", location: "", date: "", category: "Music",
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070"
  });
  const [tickets, setTickets] = useState([{ name: "Regular", price: "2500" }]);
  const [newTicket, setNewTicket] = useState({ name: "", price: "" });
  const [isPublished, setIsPublished] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Security States
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);

  // --- 1. INITIAL LOAD ---
  useEffect(() => {
    const savedHost = localStorage.getItem("nene_active_session");
    if (savedHost) {
      setHost(JSON.parse(savedHost));
      loadDashboardData();
      setView('dashboard');
    } else {
      setView('auth');
    }
  }, []);

  // --- 2. AUTH HANDLERS ---
  const checkPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    setPasswordStrength(score);
    return score;
  };

  const handleSignup = (e: any) => {
    e.preventDefault();
    setAuthError("");
    const { name, email, phone, password, confirmPassword } = e.target;

    if (password.value !== confirmPassword.value) { setAuthError("Passwords do not match."); return; }
    if (passwordStrength < 3) { setAuthError("Password is too weak."); return; }

    const newHost = { name: name.value, email: email.value, phone: phone.value, password: password.value, joined: new Date().toLocaleDateString() };
    const existingUsers = JSON.parse(localStorage.getItem("nene_users_db") || "[]");
    
    if (existingUsers.find((u: any) => u.email === email.value)) { setAuthError("Account exists."); return; }

    existingUsers.push(newHost);
    localStorage.setItem("nene_users_db", JSON.stringify(existingUsers));
    localStorage.setItem("nene_active_session", JSON.stringify(newHost));
    setHost(newHost);
    loadDashboardData();
    setView('dashboard');
  };

  const handleLogin = (e: any) => {
    e.preventDefault();
    setAuthError("");
    const { email, password } = e.target;
    const existingUsers = JSON.parse(localStorage.getItem("nene_users_db") || "[]");
    const foundUser = existingUsers.find((u: any) => u.email === email.value && u.password === password.value);

    if (foundUser) {
        localStorage.setItem("nene_active_session", JSON.stringify(foundUser));
        setHost(foundUser);
        loadDashboardData();
        setView('dashboard');
    } else {
        setAuthError("Invalid email or password.");
    }
  };

  const handleLogout = () => { localStorage.removeItem("nene_active_session"); setHost(null); setView('auth'); setAuthMode('login'); };

  // --- 3. DASHBOARD & CREATOR HANDLERS ---
  const loadDashboardData = () => {
    const allEvents = JSON.parse(localStorage.getItem("nene_events") || "[]");
    setMyEvents(allEvents);
    const totalEvents = allEvents.length;
    const totalAttendees = totalEvents * 15; 
    let totalRevenue = 0;
    allEvents.forEach((ev: any) => {
        const priceStr = ev.price.replace(/[^0-9]/g, '');
        totalRevenue += ((parseInt(priceStr) || 0) * 15);
    });
    setStats({ revenue: totalRevenue, attendees: totalAttendees, events: totalEvents });
  };

  const handlePublish = () => {
    setIsLoading(true);
    const lowestPrice = tickets.length > 0 ? Math.min(...tickets.map(t => parseInt(t.price) || 0)) : 0;
    const newEvent = {
        id: Date.now().toString(),
        title: formData.title, date: formData.date, location: formData.location,
        price: `KES ${lowestPrice.toLocaleString()}`, image: formData.image, category: formData.category,
        aiTag: "New Added ✨", tickets: tickets
    };
    setTimeout(() => {
        const existingEvents = JSON.parse(localStorage.getItem("nene_events") || "[]");
        existingEvents.unshift(newEvent);
        localStorage.setItem("nene_events", JSON.stringify(existingEvents));
        setIsLoading(false); setIsPublished(true); loadDashboardData();
    }, 1500);
  };

  const handleChange = (e: any) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleImageUpload = (e: any) => {
    const file = e.target.files[0];
    if (file) setFormData({ ...formData, image: URL.createObjectURL(file) });
  };
  const addTicket = () => { if (newTicket.name && newTicket.price) { setTickets([...tickets, newTicket]); setNewTicket({ name: "", price: "" }); }};
  const removeTicket = (index: number) => setTickets(tickets.filter((_, i) => i !== index));

  // --- RENDER ---

  if (view === 'auth') {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center p-4">
         <Navbar />
         <div className="max-w-md w-full bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10"><ShieldCheck className="w-32 h-32" /></div>
            <div className="text-center mb-8 relative z-10">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg shadow-blue-600/20">🔒</div>
                <h1 className="text-2xl font-bold">{authMode === 'login' ? 'Organizer Login' : 'Secure Sign Up'}</h1>
                <p className="text-gray-400 text-sm">Access your NeneTickets dashboard safely.</p>
            </div>
            {authError && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl mb-6 flex items-center gap-2"><AlertCircle className="w-4 h-4" /> {authError}</div>}
            <form onSubmit={authMode === 'login' ? handleLogin : handleSignup} className="space-y-4 relative z-10">
                {authMode === 'signup' && (
                    <>
                        <div><label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Business Name</label><input name="name" required placeholder="e.g. Nene Events Ltd" className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-blue-500 transition" /></div>
                        <div><label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Phone Number</label><input name="phone" type="tel" required placeholder="07XX XXX XXX" className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-blue-500 transition" /></div>
                    </>
                )}
                <div><label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Email Address</label><input name="email" type="email" required placeholder="name@company.com" className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-blue-500 transition" /></div>
                <div><label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Password</label><div className="relative"><input name="password" type={showPassword ? "text" : "password"} required placeholder="••••••••" onChange={(e) => authMode === 'signup' && checkPasswordStrength(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-blue-500 transition pr-10" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-500 hover:text-white">{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button></div></div>
                {authMode === 'signup' && (
                    <div className="space-y-2">
                        <div className="flex gap-1 h-1"><div className={`flex-1 rounded-full ${passwordStrength > 0 ? 'bg-red-500' : 'bg-gray-700'}`}></div><div className={`flex-1 rounded-full ${passwordStrength > 1 ? 'bg-yellow-500' : 'bg-gray-700'}`}></div><div className={`flex-1 rounded-full ${passwordStrength > 2 ? 'bg-blue-500' : 'bg-gray-700'}`}></div><div className={`flex-1 rounded-full ${passwordStrength > 3 ? 'bg-green-500' : 'bg-gray-700'}`}></div></div>
                        <div><label className="block text-xs font-bold text-gray-500 mb-1 uppercase mt-4">Confirm Password</label><input name="confirmPassword" type="password" required placeholder="••••••••" className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-blue-500 transition" /></div>
                    </div>
                )}
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"><Lock className="w-4 h-4" /> {authMode === 'login' ? 'Secure Login' : 'Create Account'}</button>
            </form>
            <div className="mt-6 text-center text-sm"><p className="text-gray-400">{authMode === 'login' ? "Don't have an account? " : "Already have an account? "}<button onClick={() => {setAuthMode(authMode === 'login' ? 'signup' : 'login'); setAuthError("");}} className="text-blue-400 font-bold hover:underline">{authMode === 'login' ? 'Sign Up' : 'Log In'}</button></p></div>
         </div>
      </main>
    );
  }

  if (view === 'dashboard') {
    return (
      <main className="min-h-screen bg-black text-white">
        <Navbar />
        <div className="container mx-auto px-4 py-24">
            <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
                <div><h1 className="text-3xl font-bold mb-1">Welcome back, {host?.name}</h1><p className="text-gray-400">Secure session active.</p></div>
                
                {/* ACTION BUTTONS */}
                <div className="flex gap-4">
                    <button onClick={handleLogout} className="text-gray-400 hover:text-white flex items-center gap-2 text-sm font-bold px-4 py-2"><LogOut className="w-4 h-4"/> Logout</button>
                    
                    {/* NEW SCANNER BUTTON */}
                    <Link href="/validator">
                        <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition border border-purple-500 shadow-lg shadow-purple-900/20">
                            <ScanLine className="w-5 h-5" /> Scan Tickets
                        </button>
                    </Link>

                    <button onClick={() => setView('create')} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition shadow-lg shadow-blue-900/20">
                        <Plus className="w-5 h-5" /> Create Event
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-white/5 border border-white/10 p-6 rounded-2xl"><div className="flex items-center gap-2 text-gray-400 font-bold mb-2"><DollarSign className="w-4 h-4 text-green-400" /> Total Earnings</div><div className="text-3xl font-bold">KES {stats.revenue.toLocaleString()}</div></div>
                <div className="bg-white/5 border border-white/10 p-6 rounded-2xl"><div className="flex items-center gap-2 text-gray-400 font-bold mb-2"><Users className="w-4 h-4 text-blue-400" /> Total Attendees</div><div className="text-3xl font-bold">{stats.attendees}</div></div>
                <div className="bg-white/5 border border-white/10 p-6 rounded-2xl"><div className="flex items-center gap-2 text-gray-400 font-bold mb-2"><BarChart3 className="w-4 h-4 text-purple-400" /> Active Events</div><div className="text-3xl font-bold">{stats.events}</div></div>
            </div>
            <h2 className="text-xl font-bold mb-6">Your Events</h2>
            {myEvents.length > 0 ? (
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden"><table className="w-full text-left"><thead className="bg-white/5 text-gray-400 text-sm uppercase"><tr><th className="p-6">Event Name</th><th className="p-6">Date</th><th className="p-6">Status</th><th className="p-6 text-right">Price</th></tr></thead><tbody className="divide-y divide-white/5">{myEvents.map((event: any, i: number) => (<tr key={i} className="hover:bg-white/5 transition"><td className="p-6 font-bold flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-gray-800 overflow-hidden"><img src={event.image} className="w-full h-full object-cover" /></div>{event.title}</td><td className="p-6 text-gray-400">{event.date}</td><td className="p-6"><span className="bg-green-500/20 text-green-400 text-xs font-bold px-2 py-1 rounded-full">LIVE</span></td><td className="p-6 text-right font-mono">{event.price}</td></tr>))}</tbody></table></div>
            ) : (
                <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10"><p className="text-gray-400 mb-4">You haven't created any events yet.</p><button onClick={() => setView('create')} className="text-blue-400 font-bold hover:underline">Create your first event</button></div>
            )}
        </div>
      </main>
    );
  }

  // VIEW: CREATE (Unchanged logic, just keeping code concise)
  return (
    <main className="min-h-screen bg-black text-white selection:bg-pink-600 selection:text-white">
      <Navbar />
      <div className="container mx-auto px-4 py-24">
        <button onClick={() => { setView('dashboard'); setIsPublished(false); }} className="mb-8 flex items-center gap-2 text-gray-400 hover:text-white transition font-bold"><ArrowLeft className="w-4 h-4" /> Back to Dashboard</button>
        <div className="flex flex-col lg:flex-row gap-12">
            <div className="w-full lg:w-1/2 space-y-8">
                <div><h1 className="text-4xl font-bold mb-2">Create New Event</h1><p className="text-gray-400">Fill in the details below.</p></div>
                {!isPublished ? (
                    <div className="space-y-6 bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-sm">
                        <div><label className="block text-sm font-bold text-gray-400 mb-2">Event Title</label><input name="title" onChange={handleChange} placeholder="e.g. Nairobi Rock Festival" className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-blue-500 transition" /></div>
                        <div><label className="block text-sm font-bold text-gray-400 mb-2">Cover Image</label><input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" /><div className="grid grid-cols-2 gap-4"><div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-white/20 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-500/5 transition text-center group"><div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition"><Upload className="w-5 h-5 text-blue-400" /></div><span className="text-sm font-bold text-gray-300">Upload Photo</span></div><select name="image" onChange={handleChange} className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-blue-500 transition appearance-none cursor-pointer"><option value="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070">Use Stock: Concert</option><option value="https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=1931">Use Stock: Sports</option></select></div></div>
                        <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-bold text-gray-400 mb-2">Date</label><input name="date" onChange={handleChange} placeholder="e.g. Dec 12" className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-blue-500 transition" /></div><div><label className="block text-sm font-bold text-gray-400 mb-2">Location</label><input name="location" onChange={handleChange} placeholder="e.g. KICC" className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-blue-500 transition" /></div></div>
                        <div className="bg-black/30 p-6 rounded-2xl border border-white/5"><label className="block text-sm font-bold text-blue-400 mb-4 flex items-center gap-2"><Tag className="w-4 h-4" /> Ticket Options</label><div className="flex gap-4 mb-4"><input placeholder="Name (e.g. VVIP)" value={newTicket.name} onChange={(e) => setNewTicket({...newTicket, name: e.target.value})} className="w-2/3 bg-black/50 border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:border-blue-500" /><input type="number" placeholder="Price" value={newTicket.price} onChange={(e) => setNewTicket({...newTicket, price: e.target.value})} className="w-1/3 bg-black/50 border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:border-blue-500" /><button onClick={addTicket} className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-xl transition"><Plus className="w-5 h-5" /></button></div><div className="space-y-2">{tickets.map((ticket, index) => (<div key={index} className="flex justify-between items-center bg-white/5 px-4 py-3 rounded-lg border border-white/5"><span className="font-bold text-sm">{ticket.name}</span><div className="flex items-center gap-4"><span className="text-gray-400 text-sm">KES {parseInt(ticket.price).toLocaleString()}</span><button onClick={() => removeTicket(index)} className="text-red-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button></div></div>))}</div></div>
                        <button onClick={handlePublish} disabled={isLoading || tickets.length === 0} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2">{isLoading ? "Publishing..." : <><Sparkles className="w-5 h-5" /> Launch Event</>}</button>
                    </div>
                ) : (
                    <div className="bg-green-500/10 border border-green-500/20 p-8 rounded-3xl text-center"><div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle2 className="w-10 h-10 text-white" /></div><h2 className="text-3xl font-bold text-white mb-2">Event Live!</h2><p className="text-gray-300 mb-8">Your event is now tracking sales on your dashboard.</p><div className="flex gap-4 justify-center"><button onClick={() => { setView('dashboard'); setIsPublished(false); }} className="bg-white text-black font-bold py-3 px-6 rounded-xl hover:bg-gray-200 transition">Go to Dashboard</button></div></div>
                )}
            </div>
            <div className="hidden lg:flex w-1/2 flex-col items-start sticky top-24 h-fit"><div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div> Live Preview</div><div className="w-full max-w-sm bg-gray-900 border border-white/10 rounded-2xl overflow-hidden"><div className="h-64 relative bg-gray-800"><img src={formData.image} className="w-full h-full object-cover" /></div><div className="p-5"><h3 className="text-xl font-bold mb-2">{formData.title || "Your Event Title"}</h3><p className="text-gray-400 text-sm">{formData.date || "Date"} • {formData.location || "Location"}</p></div></div></div>
        </div>
      </div>
    </main>
  );
}