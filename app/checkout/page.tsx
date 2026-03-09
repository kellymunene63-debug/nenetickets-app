"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Lock, CheckCircle, Loader2, User, AlertCircle, Coins, Sparkles, Trophy, Phone, Info } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

function CheckoutContent() {
  const searchParams = useSearchParams();
  
  // GET DATA
  const eventTitle = searchParams.get('title') || "Event Ticket";
  const ticketType = searchParams.get('type') || "regular";
  const priceString = searchParams.get('price') || "0";
  const quantityString = searchParams.get('quantity') || "1";
  
  // Event Details
  const image = searchParams.get('image') || "";
  const date = searchParams.get('date') || "";
  const time = searchParams.get('time') || "";
  const location = searchParams.get('location') || "";

  // MATH
  const ticketPrice = parseInt(priceString);
  const quantity = parseInt(quantityString);
  const subTotal = ticketPrice * quantity;
  const serviceFee = Math.round(subTotal * 0.03);
  const grossTotal = subTotal + serviceFee;

  // --- LOYALTY SYSTEM STATE ---
  const [user, setUser] = useState<any>(null);
  const [useCoins, setUseCoins] = useState(false);
  const [coinsEarned, setCoinsEarned] = useState(0);

  // Load User & Coin Balance
  useEffect(() => {
    const savedUser = localStorage.getItem("nene_user_profile");
    if (savedUser) {
        setUser(JSON.parse(savedUser));
    }
  }, []);

  // --- NEW: 10:1 CONVERSION LOGIC ---
  // Rate: 10 Coins = 1 KES Discount
  const coinBalance = user?.coins || 0;
  const maxPossibleDiscount = Math.floor(coinBalance / 10); // e.g., 500 coins -> 50 KES
  
  // Cap the discount: Cannot exceed total bill
  const actualDiscount = Math.min(maxPossibleDiscount, grossTotal);
  
  // Determine final values based on toggle
  const appliedDiscount = useCoins ? actualDiscount : 0;
  const coinsToDeduct = appliedDiscount * 10; // e.g., 50 KES discount -> deduct 500 coins
  const finalTotal = grossTotal - appliedDiscount;

  const [status, setStatus] = useState("idle");
  const [timeLeft, setTimeLeft] = useState(30);
  const [generatedTicketId, setGeneratedTicketId] = useState("");
  
  // VALIDATION STATE
  const [holderName, setHolderName] = useState("");
  const [isNameTouched, setIsNameTouched] = useState(false);
  const isNameValid = holderName.trim().length >= 8;

  const [phoneNumber, setPhoneNumber] = useState("");
  const [isPhoneTouched, setIsPhoneTouched] = useState(false);
  const isPhoneValid = phoneNumber.replace(/\D/g,'').length >= 10;

  const handlePayment = () => {
    if (!isNameValid || !isPhoneValid) return;

    setStatus("processing");
    setTimeout(() => setStatus("waiting_for_pin"), 1500);
  };

  useEffect(() => {
    if (status === "waiting_for_pin") {
      const timer = setInterval(() => setTimeLeft((p) => (p > 0 ? p - 1 : 0)), 1000);
      const successTrigger = setTimeout(() => {
        
        // --- 1. GENERATE TICKET ---
        const ticketId = "T-" + Math.floor(1000 + Math.random() * 9000);
        setGeneratedTicketId(ticketId);

        const newTicket = {
            id: ticketId,
            eventTitle,
            ticketType,
            date,
            location,
            image,
            holderName: holderName,
            phoneNumber: phoneNumber,
            status: "valid",
            purchaseDate: new Date().toLocaleDateString()
        };

        const soldTickets = JSON.parse(localStorage.getItem("nene_sold_tickets") || "[]");
        soldTickets.push(newTicket);
        localStorage.setItem("nene_sold_tickets", JSON.stringify(soldTickets));

        // --- 2. UPDATE LOYALTY POINTS (Earn + Burn) ---
        if (user) {
            // Earn: 10 Coins for every 100 KES spent (on final total)
            const earned = Math.floor(finalTotal / 10);
            setCoinsEarned(earned);

            // Calculate new balance: (Current - Used) + Earned
            const currentCoins = user.coins || 0;
            const newBalance = currentCoins - coinsToDeduct + earned;

            const updatedUser = { ...user, coins: newBalance };
            localStorage.setItem("nene_user_profile", JSON.stringify(updatedUser));
            setUser(updatedUser);
        }

        setStatus("success");
      }, 5000);
      return () => { clearInterval(timer); clearTimeout(successTrigger); };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const ticketUrl = `/tickets?title=${encodeURIComponent(eventTitle)}&type=${encodeURIComponent(ticketType)}&image=${encodeURIComponent(image)}&date=${encodeURIComponent(date)}&time=${encodeURIComponent(time)}&location=${encodeURIComponent(location)}&quantity=${quantity}&id=${generatedTicketId}&holder=${encodeURIComponent(holderName)}`;

  if (status === "success") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://media.giphy.com/media/26tOZ42Mg6pbTUPDa/giphy.gif')] opacity-10 bg-cover pointer-events-none"></div>
        
        <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="bg-white/10 backdrop-blur-xl border border-white/10 p-8 rounded-2xl text-center max-w-md w-full relative z-10">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/50"><CheckCircle className="w-10 h-10 text-white" /></div>
          <h2 className="text-3xl font-bold mb-2">Payment Confirmed!</h2>
          <p className="text-gray-300 mb-6">Ticket sent to <span className="text-white font-bold">{phoneNumber}</span>.</p>
          
          <div className="bg-gradient-to-r from-yellow-600 to-yellow-800 p-4 rounded-xl mb-8 border border-yellow-400/30 transform hover:scale-105 transition duration-500">
            <div className="flex items-center justify-center gap-2 mb-1">
                <Trophy className="w-5 h-5 text-yellow-200" />
                <span className="font-bold text-yellow-100 uppercase tracking-widest text-xs">Level Up!</span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">+{coinsEarned} Coins</div>
            <p className="text-yellow-200/80 text-xs">New Balance: {user?.coins} NeneCoins</p>
          </div>

          <Link href={ticketUrl}>
            <button className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-gray-200 transition">
                View Your Ticket
            </button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-between bg-black relative overflow-hidden text-white">
        <div className="relative z-10">
            <Link href="/" className="text-gray-400 hover:text-white flex items-center gap-2 mb-8 text-sm font-bold uppercase">← Cancel</Link>
            <h1 className="text-4xl font-bold mb-2">Order Summary</h1>
            <p className="text-gray-400 mb-8">Review your order for <span className="text-white font-bold">{eventTitle}</span>.</p>
            
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-white/10">
                    <div><h3 className="font-bold text-lg">{ticketType} <span className="text-blue-400">x {quantity}</span></h3><p className="text-sm text-gray-400">@{ticketPrice.toLocaleString()} each</p></div>
                    <span className="font-bold">KES {subTotal.toLocaleString()}</span>
                </div>
                
                {useCoins && (
                    <div className="flex justify-between items-center text-yellow-400 animate-pulse bg-yellow-400/10 p-2 rounded-lg -mx-2">
                        <span className="flex items-center gap-2 text-sm font-bold"><Coins className="w-4 h-4" /> Loyalty Discount</span>
                        <span className="font-bold">- KES {appliedDiscount.toLocaleString()}</span>
                    </div>
                )}

                <div className="flex justify-between items-center pt-4 text-xl font-bold text-blue-400">
                    <span>Total Due</span>
                    <span>KES {finalTotal.toLocaleString()}</span>
                </div>
            </div>
        </div>
      </div>

      <div className="w-full md:w-1/2 bg-white text-black p-8 md:p-12 flex items-center justify-center">
        <div className="max-w-md w-full space-y-6">
            {status === "waiting_for_pin" ? (
                <div className="bg-yellow-50 border-2 border-yellow-400 rounded-2xl p-6 text-center">
                    <h2 className="text-xl font-bold text-yellow-900 mb-2">Check your Phone</h2>
                    <p className="text-sm text-yellow-700 mb-6">Enter PIN to pay KES {finalTotal.toLocaleString()}.</p>
                    <div className="text-2xl font-mono font-bold text-yellow-600">00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}</div>
                </div>
            ) : (
                <>
                    <div><h2 className="text-2xl font-bold mb-2">Checkout</h2><p className="text-gray-500">Complete your purchase details.</p></div>
                    
                    {/* NAME INPUT */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Ticket Holder Name <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <input 
                                type="text" 
                                value={holderName}
                                onChange={(e) => { setHolderName(e.target.value); setIsNameTouched(true); }}
                                placeholder="Full Name (e.g. Kelly Munene)" 
                                className={`w-full bg-gray-100 border rounded-xl px-4 py-3 pl-10 text-lg outline-none transition ${isNameTouched && !isNameValid ? 'border-red-500 bg-red-50' : isNameValid ? 'border-green-500 bg-green-50' : 'border-gray-200 focus:border-blue-500'}`} 
                            />
                            <User className={`w-5 h-5 absolute left-3 top-3.5 ${isNameTouched && !isNameValid ? 'text-red-500' : 'text-gray-400'}`} />
                        </div>
                        {isNameTouched && !isNameValid && <p className="text-xs text-red-500 mt-2 flex items-center gap-1 font-bold"><AlertCircle className="w-3 h-3" /> Name must be at least 8 characters.</p>}
                    </div>

                    {/* LOYALTY SECTION (UPDATED UI) */}
                    {user && (user.coins || 0) > 0 && (
                        <div className="bg-gradient-to-r from-gray-900 to-black text-white p-4 rounded-xl shadow-lg border border-gray-800">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <div className="flex items-center gap-2 text-yellow-400 font-bold mb-1">
                                        <Sparkles className="w-4 h-4" /> Redeem NeneCoins
                                    </div>
                                    <div className="text-xs text-gray-400 flex items-center gap-1">
                                        <Info className="w-3 h-3" /> Rate: 10 Coins = 1 KES
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-lg">{user.coins} Coins</div>
                                    <div className="text-xs text-green-400">Value: KES {maxPossibleDiscount}</div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between bg-white/10 p-3 rounded-lg">
                                <span className="text-sm font-bold text-gray-300">Apply Discount?</span>
                                <button 
                                    onClick={() => setUseCoins(!useCoins)}
                                    className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${useCoins ? 'bg-green-500' : 'bg-gray-600'}`}
                                >
                                    <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${useCoins ? 'translate-x-6' : 'translate-x-0'}`} />
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="border-t border-gray-200 pt-6">
                        <h3 className="font-bold mb-4">Payment Method</h3>
                        <div className="border-2 border-green-500 bg-green-50 rounded-xl p-4 flex items-center justify-between mb-4"><span className="font-bold text-green-900">M-Pesa Express</span><div className="w-4 h-4 rounded-full bg-green-500"></div></div>
                        
                        {/* PHONE INPUT */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">M-Pesa Number <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <input 
                                    type="tel"
                                    value={phoneNumber}
                                    onChange={(e) => { setPhoneNumber(e.target.value); setIsPhoneTouched(true); }}
                                    placeholder="07XX XXX XXX" 
                                    className={`w-full bg-gray-100 border rounded-xl px-4 py-3 pl-10 text-lg font-mono outline-none transition ${isPhoneTouched && !isPhoneValid ? 'border-red-500 bg-red-50' : isPhoneValid ? 'border-green-500 bg-green-50' : 'border-gray-200 focus:border-green-500'}`}
                                />
                                <Phone className={`w-5 h-5 absolute left-3 top-3.5 ${isPhoneTouched && !isPhoneValid ? 'text-red-500' : 'text-gray-400'}`} />
                            </div>
                            {isPhoneTouched && !isPhoneValid && <p className="text-xs text-red-500 mt-2 font-bold">Please enter a valid phone number.</p>}
                        </div>
                    </div>
                    
                    <button 
                        onClick={handlePayment} 
                        disabled={status === "processing" || !isNameValid || !isPhoneValid} 
                        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:text-gray-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-green-600/20"
                    >
                        {status === "processing" ? <Loader2 className="animate-spin" /> : <><Lock className="w-4 h-4" /> Pay KES {finalTotal.toLocaleString()}</>}
                    </button>
                </>
            )}
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return <Suspense fallback={<div>Loading...</div>}><CheckoutContent /></Suspense>;
}