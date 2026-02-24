"use client";

import { useState, useEffect } from "react";
import Navbar from "../../components/shared/Navbar";
import { User, Mail, Phone, MapPin, CreditCard, LogOut, Settings, Ticket, Calendar, CheckCircle2 } from "lucide-react";

export default function ProfilePage() {
  // 1. STATE
  const [user, setUser] = useState({
    name: "",
    email: "",
    phone: "",
    username: "",
    location: ""
  });

  const [isSaved, setIsSaved] = useState(false);

  // 2. LOAD DATA (Runs once when page loads)
  useEffect(() => {
    const savedData = localStorage.getItem("nene_user_profile");
    if (savedData) {
      setUser(JSON.parse(savedData));
    }
  }, []);

  // 3. HANDLE INPUT CHANGE
  const handleChange = (e: any) => {
    setUser({ ...user, [e.target.name]: e.target.value });
    setIsSaved(false); // Reset "Saved" status when typing
  };

  // 4. SAVE DATA
  const handleSave = () => {
    localStorage.setItem("nene_user_profile", JSON.stringify(user));
    setIsSaved(true);
    
    // Reset button after 2 seconds
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      {/* HEADER BANNER */}
      <div className="h-64 bg-gradient-to-r from-blue-900 to-purple-900 relative">
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <div className="container mx-auto px-4 -mt-20 relative z-10 pb-20">
        <div className="flex flex-col lg:flex-row gap-8">
            
            {/* LEFT COLUMN: Live Preview Card */}
            <div className="w-full lg:w-1/3">
                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md shadow-2xl sticky top-24">
                    <div className="flex flex-col items-center text-center">
                        <div className="w-32 h-32 bg-gray-700 rounded-full mb-4 border-4 border-black flex items-center justify-center text-4xl overflow-hidden relative">
                             {user.name ? (
                                <span className="font-bold text-white text-4xl">{user.name.charAt(0)}</span>
                            ) : (
                                "👤"
                            )}
                        </div>
                        
                        <h2 className="text-2xl font-bold mb-1">
                            {user.name || "Your Name"}
                        </h2>
                        
                        <p className="text-blue-400 text-sm font-bold uppercase tracking-widest mb-6">
                            {user.username || "@username"}
                        </p>
                        
                        <div className="w-full space-y-4 text-left">
                            <div className="flex items-center gap-3 text-gray-300 p-3 bg-black/20 rounded-xl">
                                <Mail className="w-5 h-5 text-gray-500" />
                                <span className="truncate">{user.email || "email@example.com"}</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-300 p-3 bg-black/20 rounded-xl">
                                <Phone className="w-5 h-5 text-gray-500" />
                                <span>{user.phone || "+254 ..."}</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-300 p-3 bg-black/20 rounded-xl">
                                <MapPin className="w-5 h-5 text-gray-500" />
                                <span>{user.location || "Nairobi, Kenya"}</span>
                            </div>
                        </div>

                        <button 
                            onClick={() => {
                                localStorage.removeItem("nene_user_profile");
                                setUser({ name: "", email: "", phone: "", username: "", location: "" });
                            }}
                            className="mt-8 w-full flex items-center justify-center gap-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 py-3 rounded-xl transition font-bold"
                        >
                            <LogOut className="w-5 h-5" /> Reset Profile
                        </button>
                    </div>
                </div>
            </div>

            {/* RIGHT COLUMN: Edit Form */}
            <div className="w-full lg:w-2/3 space-y-8">
                
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                        <div className="text-gray-400 text-sm font-bold mb-1 flex items-center gap-2"><Ticket className="w-4 h-4" /> Tickets Bought</div>
                        <div className="text-3xl font-bold">12</div>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                        <div className="text-gray-400 text-sm font-bold mb-1 flex items-center gap-2"><Calendar className="w-4 h-4" /> Events Hosted</div>
                        <div className="text-3xl font-bold">1</div>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                        <div className="text-gray-400 text-sm font-bold mb-1 flex items-center gap-2"><CreditCard className="w-4 h-4" /> Spent (YTD)</div>
                        <div className="text-3xl font-bold text-green-400">KES 15k</div>
                    </div>
                </div>

                {/* Account Settings Form */}
                <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
                    <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-6">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center"><Settings className="w-6 h-6 text-white" /></div>
                        <div>
                            <h3 className="text-xl font-bold">Account Settings</h3>
                            <p className="text-sm text-gray-400">Update your personal details.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-400 mb-2">Full Name</label>
                            <input 
                                name="name" 
                                value={user.name} 
                                onChange={handleChange} 
                                type="text" 
                                placeholder="e.g. John Kamau" 
                                className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:border-blue-500 outline-none transition" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-400 mb-2">Username</label>
                            <input 
                                name="username" 
                                value={user.username} 
                                onChange={handleChange} 
                                type="text" 
                                placeholder="@john_k" 
                                className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:border-blue-500 outline-none transition" 
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-gray-400 mb-2">Email Address</label>
                            <input 
                                name="email" 
                                value={user.email} 
                                onChange={handleChange} 
                                type="email" 
                                placeholder="john@example.com" 
                                className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:border-blue-500 outline-none transition" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-400 mb-2">Phone</label>
                            <input 
                                name="phone" 
                                value={user.phone} 
                                onChange={handleChange} 
                                type="text" 
                                placeholder="07XX XXX XXX" 
                                className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:border-blue-500 outline-none transition" 
                            />
                        </div>
                         <div>
                            <label className="block text-sm font-bold text-gray-400 mb-2">Location</label>
                            <input 
                                name="location" 
                                value={user.location} 
                                onChange={handleChange} 
                                type="text" 
                                placeholder="City, Country" 
                                className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:border-blue-500 outline-none transition" 
                            />
                        </div>
                    </div>

                    <button 
                        onClick={handleSave} 
                        className={`w-full font-bold px-8 py-4 rounded-xl transition flex items-center justify-center gap-2 ${isSaved ? 'bg-green-600 text-white' : 'bg-white text-black hover:bg-gray-200'}`}
                    >
                        {isSaved ? (
                            <>
                                <CheckCircle2 className="w-5 h-5" /> Saved Successfully!
                            </>
                        ) : (
                            "Save Changes"
                        )}
                    </button>
                </div>

            </div>
        </div>
      </div>
    </main>
  );
}