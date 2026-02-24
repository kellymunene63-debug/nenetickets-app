"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Ticket, Sparkles, Music, Lock, Phone } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: any) => {
    e.preventDefault();
    setIsLoading(true);

    const name = e.target.name.value;
    const email = e.target.email.value;
    const phone = e.target.phone.value;

    // 1. Create User Session with Phone Number
    const userProfile = {
        name: name,
        email: email,
        phone: phone, // Saved for OTP/Resets
        username: "@" + name.toLowerCase().replace(" ", "_"),
        joined: new Date().toLocaleDateString(),
        location: "Nairobi, Kenya"
    };

    // 2. Save to Storage (Simulate Login)
    setTimeout(() => {
        localStorage.setItem("nene_user_profile", JSON.stringify(userProfile));
        setIsLoading(false);
        router.push("/"); // Redirect to Home
    }, 1500);
  };

  return (
    <main className="min-h-screen bg-black text-white relative overflow-hidden flex items-center justify-center p-4">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=2070')] bg-cover bg-center opacity-40" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md bg-white/10 border border-white/10 backdrop-blur-xl p-8 rounded-3xl shadow-2xl animate-in fade-in zoom-in duration-500">
        
        {/* Logo Animation */}
        <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center text-4xl shadow-lg shadow-blue-600/30">
                🎟️
            </div>
        </div>

        <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome to NeneTickets</h1>
            <p className="text-gray-300">Your passport to the best experiences in Kenya.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
            <div>
                <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Your Name</label>
                <input 
                    name="name" 
                    required 
                    placeholder="e.g. Alex Kamau" 
                    className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 outline-none focus:border-blue-500 transition" 
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Email Address</label>
                    <input 
                        name="email" 
                        type="email" 
                        required 
                        placeholder="name@example.com" 
                        className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 outline-none focus:border-blue-500 transition" 
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Phone Number</label>
                    <div className="relative">
                        <input 
                            name="phone" 
                            type="tel" 
                            required 
                            placeholder="07XX XXX XXX" 
                            className="w-full bg-black/50 border border-white/10 rounded-xl p-4 pl-10 text-white placeholder-gray-500 outline-none focus:border-blue-500 transition" 
                        />
                        <Phone className="w-4 h-4 text-gray-500 absolute left-3 top-4" />
                    </div>
                </div>
            </div>

            <button 
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 group"
            >
                {isLoading ? (
                    "Entering..."
                ) : (
                    <>
                        Enter NeneTickets <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                )}
            </button>
        </form>

        {/* Footer Notes */}
        <div className="mt-8 pt-6 border-t border-white/10 text-center space-y-4">
            <p className="text-xs text-gray-500">
                By continuing, you agree to receive SMS notifications for tickets and resets.
            </p>
            <div className="flex justify-center gap-4 text-gray-400">
                <div className="flex items-center gap-1 text-xs"><Lock className="w-3 h-3" /> Secure</div>
                <div className="flex items-center gap-1 text-xs"><Sparkles className="w-3 h-3" /> Exclusive</div>
                <div className="flex items-center gap-1 text-xs"><Music className="w-3 h-3" /> Live</div>
            </div>
        </div>
      </div>
    </main>
  );
}