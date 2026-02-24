"use client";

import Navbar from "../../../components/shared/Navbar";
// Make sure you created this component in the previous step!
import ReviewSection from "../../../components/ReviewSection"; 
import Link from "next/link";
import { useState, useEffect } from "react";
import { 
  Calendar, MapPin, ArrowLeft, CheckCircle2, Minus, Plus, Share2, 
  Copy, Twitter, MessageCircle, Info, Eye, TrendingUp, AlertTriangle 
} from "lucide-react";

// MOCK DATABASE
const EVENTS_DB: Record<string, any> = {
  "1": {
    title: "Safaricom Jazz Festival 2026",
    image: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=2070",
    date: "Feb 14, 2026",
    time: "6:00 PM",
    location: "Carnivore Grounds",
    basePrice: 2500,     
    baseVipPrice: 8000,  
    description: "Experience the magic of jazz under the Nairobi sky. Featuring world-renowned artists and local legends. Gates open at 4 PM.",
    category: "Music",
    tag: "SELLING FAST"
  },
  "2": {
    title: "Gor Mahia vs AFC Leopards",
    image: "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=1931",
    date: "Feb 21, 2026",
    time: "3:00 PM",
    location: "Kasarani Stadium",
    basePrice: 500,
    baseVipPrice: 2000,
    description: "The biggest derby in Kenya! Watch the Mashemeji Derby live as the giants clash for the title.",
    category: "Sports",
    tag: "HIGH DEMAND"
  },
  "3": {
    title: "Nairobi Tech Week: AI Summit",
    image: "https://images.unsplash.com/photo-1544531586-fde5298cdd40?q=80&w=2070",
    date: "Mar 05, 2026",
    time: "9:00 AM",
    location: "Sarit Centre",
    basePrice: 0,
    baseVipPrice: 1500,
    description: "Join the leading minds in African Tech. Keynotes from Google, Microsoft, and NeneLabs on the future of AI.",
    category: "Business",
    tag: "TRENDING"
  }
};

export default function EventPage({ params }: { params: { id: string } }) {
  const event = EVENTS_DB[params.id];
  const [selectedTicket, setSelectedTicket] = useState<'regular' | 'vip'>('regular');
  const [quantity, setQuantity] = useState(1);
  const [copied, setCopied] = useState(false);

  // --- SURGE PRICING LOGIC ---
  const [viewers, setViewers] = useState(24);
  const [isSurge, setIsSurge] = useState(false);

  // Simulate Live Traffic
  useEffect(() => {
    const interval = setInterval(() => {
      setViewers(prev => {
        const change = Math.floor(Math.random() * 5) - 1; // Fluctuates between -1 and +3
        const newValue = prev + change;
        return newValue > 10 ? newValue : 10;
      });
    }, 3000); 

    return () => clearInterval(interval);
  }, []);

  // Trigger Surge Mode if viewers > 40
  useEffect(() => {
    if (viewers > 40) {
        setIsSurge(true);
    } else {
        setIsSurge(false);
    }
  }, [viewers]);

  if (!event) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Event not found</div>;

  // Dynamic Price Calculation
  const surgeMultiplier = isSurge ? 1.2 : 1; 
  const regularPrice = Math.round(event.basePrice * surgeMultiplier);
  const vipPrice = Math.round(event.baseVipPrice * surgeMultiplier);

  const currentPrice = selectedTicket === 'regular' ? regularPrice : vipPrice;
  const totalPrice = currentPrice * quantity;

  const handleQuantity = (type: 'inc' | 'dec') => {
    if (type === 'dec' && quantity > 1) setQuantity(quantity - 1);
    if (type === 'inc' && quantity < 10) setQuantity(quantity + 1);
  };

  const handleShare = (platform: 'whatsapp' | 'twitter' | 'copy') => {
    const shareUrl = window.location.href;
    const shareText = `Check out ${event.title} on NeneTickets! 🎟️`;
    
    if (platform === 'whatsapp') {
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`, '_blank');
    } else if (platform === 'twitter') {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
    } else {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }
  };

  const checkoutUrl = `/checkout?title=${encodeURIComponent(event.title)}&type=${selectedTicket}&price=${currentPrice}&quantity=${quantity}&date=${encodeURIComponent(event.date)}&time=${encodeURIComponent(event.time)}&location=${encodeURIComponent(event.location)}&image=${encodeURIComponent(event.image)}`;

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      {/* HERO SECTION */}
      <div className="relative h-[60vh] w-full">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
        <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
        <div className="absolute top-24 left-4 z-50">
             <Link href="/" className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full hover:bg-black/70 transition text-sm font-bold">
                <ArrowLeft className="w-4 h-4" /> Back
             </Link>
        </div>
        <div className="absolute bottom-0 left-0 z-20 p-8 container mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">{event.title}</h1>
            <div className="flex flex-col md:flex-row gap-4 md:gap-8 text-gray-300 font-medium">
                <span className="flex items-center gap-2"><Calendar className="w-5 h-5 text-blue-500" /> {event.date} • {event.time}</span>
                <span className="flex items-center gap-2"><MapPin className="w-5 h-5 text-pink-500" /> {event.location}</span>
            </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* LEFT COLUMN: Content */}
        <div className="lg:col-span-2 space-y-10">
            
            {/* Description */}
            <section>
                <h2 className="text-2xl font-bold mb-4">About the Event</h2>
                <p className="text-gray-400 text-lg leading-relaxed">{event.description}</p>
            </section>
            
            {/* Live Viewers Alert */}
            <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-400 animate-pulse">
                <Eye className="w-5 h-5" />
                <span className="font-bold">{viewers} people are viewing this event right now.</span>
            </div>

            {/* Interactive Venue Map */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 overflow-hidden">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-bold flex items-center gap-2"><MapPin className="w-5 h-5 text-blue-500" /> Interactive Venue Map</h3>
                    <div className="text-xs text-gray-500 flex gap-4 font-bold uppercase">
                        <span className="flex items-center gap-2"><div className="w-3 h-3 bg-pink-500 rounded-full shadow-[0_0_10px_#ec4899]"></div> VIP</span>
                        <span className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 rounded-full shadow-[0_0_10px_#3b82f6]"></div> Regular</span>
                    </div>
                </div>

                <div className="relative w-full max-w-lg mx-auto perspective-1000">
                    {/* Stage */}
                    <div className="w-3/4 mx-auto h-16 bg-gray-800 rounded-t-3xl border-t-4 border-purple-500 flex items-center justify-center mb-10 shadow-[0_0_40px_rgba(168,85,247,0.15)]">
                        <span className="text-xs font-bold uppercase tracking-[0.3em] text-purple-400">Main Stage</span>
                    </div>

                    {/* VIP Zone */}
                    <div 
                        onClick={() => setSelectedTicket('vip')}
                        className={`w-2/3 mx-auto h-24 mb-4 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-300 transform hover:scale-105 border-2 group relative overflow-hidden ${
                            selectedTicket === 'vip' 
                            ? 'bg-pink-500/20 border-pink-500 shadow-[0_0_25px_rgba(236,72,153,0.4)]' 
                            : 'bg-white/5 border-white/10 hover:border-pink-500/50'
                        }`}
                    >
                         <div className="text-center z-10">
                            <span className={`block font-bold text-lg ${selectedTicket === 'vip' ? 'text-pink-400' : 'text-gray-400'}`}>Golden Circle (VIP)</span>
                            <span className="text-xs text-gray-500 font-medium">Front Row Experience</span>
                         </div>
                    </div>

                    {/* Regular Zone */}
                    <div 
                        onClick={() => setSelectedTicket('regular')}
                        className={`w-full h-32 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-300 transform hover:scale-105 border-2 group relative overflow-hidden ${
                            selectedTicket === 'regular' 
                            ? 'bg-blue-500/20 border-blue-500 shadow-[0_0_25px_rgba(59,130,246,0.4)]' 
                            : 'bg-white/5 border-white/10 hover:border-blue-500/50'
                        }`}
                    >
                         <div className="text-center z-10">
                            <span className={`block font-bold text-lg ${selectedTicket === 'regular' ? 'text-blue-400' : 'text-gray-400'}`}>General Admission</span>
                            <span className="text-xs text-gray-500 font-medium">Standing / Seating Area</span>
                         </div>
                    </div>
                </div>
                <p className="text-center text-xs text-gray-500 mt-8 flex items-center justify-center gap-2">
                    <Info className="w-4 h-4" /> Tap on a zone above to select your ticket type.
                </p>
            </div>

            {/* REVIEWS SECTION */}
            <ReviewSection />
        </div>

        {/* RIGHT COLUMN: Sticky Sidebar */}
        <div className="space-y-6 sticky top-24 h-fit">
            
            {/* Ticket Selector Card */}
            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-md shadow-xl">
                
                {/* Surge Alert */}
                {isSurge && (
                    <div className="mb-6 bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-xl flex items-start gap-3 animate-in zoom-in duration-300">
                        <div className="bg-yellow-500 p-1.5 rounded-lg text-black mt-0.5"><TrendingUp className="w-4 h-4" /></div>
                        <div>
                            <h4 className="text-yellow-500 font-bold text-sm">High Demand!</h4>
                            <p className="text-yellow-200/70 text-xs mt-1 leading-tight">Prices increased by 20% due to limited availability.</p>
                        </div>
                    </div>
                )}

                <h3 className="text-xl font-bold mb-6">Select Ticket</h3>
                
                {/* Regular Option */}
                <div 
                    onClick={() => setSelectedTicket('regular')} 
                    className={`mb-4 p-4 rounded-xl border cursor-pointer transition-all relative ${
                        selectedTicket === 'regular' 
                        ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.15)]' 
                        : 'border-white/10 hover:border-white/30 hover:bg-white/5'
                    }`}
                >
                    <div className="flex justify-between items-center mb-1">
                        <span className="font-bold">Regular Admission</span>
                        <div className="text-right">
                            {isSurge && <span className="block text-xs text-gray-500 line-through decoration-red-500/50">KES {event.basePrice}</span>}
                            <span className={`${isSurge ? 'text-yellow-400' : 'text-blue-400'} font-bold`}>KES {regularPrice.toLocaleString()}</span>
                        </div>
                    </div>
                    {selectedTicket === 'regular' && <CheckCircle2 className="absolute top-4 right-4 text-blue-500 w-5 h-5" />}
                </div>

                {/* VIP Option */}
                <div 
                    onClick={() => setSelectedTicket('vip')} 
                    className={`mb-8 p-4 rounded-xl border cursor-pointer transition-all relative ${
                        selectedTicket === 'vip' 
                        ? 'border-pink-500 bg-pink-500/10 shadow-[0_0_15px_rgba(236,72,153,0.15)]' 
                        : 'border-white/10 hover:border-white/30 hover:bg-white/5'
                    }`}
                >
                    <div className="absolute -top-3 left-4 bg-gradient-to-r from-pink-600 to-purple-600 text-[10px] uppercase tracking-wider px-2 py-1 rounded text-white font-bold shadow-lg shadow-pink-500/20">
                        {event.tag}
                    </div>
                    <div className="flex justify-between items-center mb-1 mt-2">
                        <span className="font-bold text-lg">VIP Experience</span>
                        <div className="text-right">
                            {isSurge && <span className="block text-xs text-gray-500 line-through decoration-red-500/50">KES {event.baseVipPrice}</span>}
                            <span className={`${isSurge ? 'text-yellow-400' : 'text-pink-400'} font-bold text-xl`}>KES {vipPrice.toLocaleString()}</span>
                        </div>
                    </div>
                    {selectedTicket === 'vip' && <CheckCircle2 className="absolute top-4 right-4 text-pink-500 w-5 h-5" />}
                </div>

                {/* Quantity */}
                <div className="flex items-center justify-between mb-6 bg-black/40 p-4 rounded-xl border border-white/10">
                    <span className="text-gray-400 font-bold text-sm">Quantity</span>
                    <div className="flex items-center gap-4">
                        <button onClick={() => handleQuantity('dec')} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition active:scale-95"><Minus className="w-4 h-4" /></button>
                        <span className="font-bold text-xl w-6 text-center">{quantity}</span>
                        <button onClick={() => handleQuantity('inc')} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition active:scale-95"><Plus className="w-4 h-4" /></button>
                    </div>
                </div>

                {/* Checkout Button */}
                <Link href={checkoutUrl}>
                    <button className={`w-full text-white font-bold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 transform active:scale-95 ${
                        isSurge 
                        ? 'bg-yellow-600 hover:bg-yellow-700 shadow-yellow-600/20' 
                        : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
                    }`}>
                        {isSurge && <AlertTriangle className="w-5 h-5" />}
                        Proceed to Checkout (KES {totalPrice.toLocaleString()})
                    </button>
                </Link>
            </div>

            {/* Share Card */}
            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                <h3 className="text-sm font-bold text-gray-400 mb-4 flex items-center gap-2"><Share2 className="w-4 h-4" /> Share this Event</h3>
                <div className="flex gap-2">
                    <button onClick={() => handleShare('whatsapp')} className="flex-1 bg-green-600/10 hover:bg-green-600/20 text-green-500 py-3 rounded-xl flex items-center justify-center transition border border-green-600/20 hover:border-green-600/40">
                        <MessageCircle className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleShare('twitter')} className="flex-1 bg-blue-400/10 hover:bg-blue-400/20 text-blue-400 py-3 rounded-xl flex items-center justify-center transition border border-blue-400/20 hover:border-blue-400/40">
                        <Twitter className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleShare('copy')} className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl flex items-center justify-center transition border border-white/10 hover:border-white/30 relative">
                        {copied ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                    </button>
                </div>
            </div>
        </div>
      </div>
    </main>
  );
}