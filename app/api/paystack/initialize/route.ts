"use client";

import Navbar from "../../components/shared/Navbar";
import { Suspense, useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2, Ticket, ArrowLeft, Shield,
  Loader2, MapPin, Calendar, ChevronRight,
  AlertCircle, Tag, X, CreditCard, Smartphone
} from "lucide-react";

// ── Paystack inline types ────────────────────────────────────────────────────
declare global {
  interface Window {
    PaystackPop: {
      setup: (options: {
        key: string;
        email: string;
        amount: number;
        currency: string;
        ref: string;
        metadata?: Record<string, unknown>;
        onClose: () => void;
        callback: (response: { reference: string }) => void;
      }) => { openIframe: () => void };
    };
  }
}

const PROMO_CODES: Record<string, number> = {
  NENE10: 10,
  LAUNCH20: 20,
  STUDENT15: 15,
  KENYA25: 25,
};

function generateTicketId() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

type CheckoutStep = "summary" | "paying" | "confirmed";

function CheckoutContent() {
  const params = useSearchParams();
  const router = useRouter();

  const title    = params.get("title")    ?? "Event Ticket";
  const type     = params.get("type")     ?? "regular";
  const price    = Number(params.get("price")    ?? 0);
  const quantity = Number(params.get("quantity") ?? 1);
  const date     = params.get("date")     ?? "";
  const time     = params.get("time")     ?? "";
  const location = params.get("location") ?? "";
  const image    = params.get("image")    ?? "";

  const total      = price * quantity;
  const serviceFee = Math.round(total * 0.03);

  const [promoInput, setPromoInput]     = useState("");
  const [promoCode, setPromoCode]       = useState("");
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoError, setPromoError]     = useState("");

  const discountAmount = Math.round((total * promoDiscount) / 100);
  const grandTotal     = total + serviceFee - discountAmount;

  const [step, setStep]           = useState<CheckoutStep>("summary");
  const [email, setEmail]         = useState("");
  const [emailError, setEmailError] = useState("");
  const [payError, setPayError]   = useState("");
  const [ticketId]                = useState(() => generateTicketId());
  const [paystackLoaded, setPaystackLoaded] = useState(false);
  const [confirmedRef, setConfirmedRef] = useState("");

  // Load Paystack inline script
  useEffect(() => {
    if (document.getElementById("paystack-inline")) {
      setPaystackLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.id  = "paystack-inline";
    script.src = "https://js.paystack.co/v1/inline.js";
    script.onload = () => setPaystackLoaded(true);
    document.body.appendChild(script);
  }, []);

  const applyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) { setPromoError("Enter a promo code"); return; }
    const discount = PROMO_CODES[code];
    if (!discount) { setPromoError("Invalid promo code"); return; }
    setPromoDiscount(discount);
    setPromoCode(code);
    setPromoError("");
    setPromoInput("");
  };

  const removePromo = () => {
    setPromoCode(""); setPromoDiscount(0); setPromoInput(""); setPromoError("");
  };

  const handlePaymentSuccess = useCallback(async (reference: string) => {
    setStep("paying");

    try {
      // Verify with our backend
      const res  = await fetch(`/api/paystack/verify/${reference}`);
      const data = await res.json() as { paid: boolean };

      if (!data.paid) {
        setPayError("Payment could not be verified. Please contact support if money was deducted.");
        setStep("summary");
        return;
      }

      // Save ticket to localStorage
      const ticket = {
        id: ticketId,
        title, type, price: grandTotal, quantity,
        date, time, location, image,
        purchasedAt: new Date().toISOString(),
        reference,
      };
      const existing = JSON.parse(localStorage.getItem("nene_sold_tickets") ?? "[]");
      existing.push(ticket);
      localStorage.setItem("nene_sold_tickets", JSON.stringify(existing));

      setConfirmedRef(reference);
      setStep("confirmed");
    } catch {
      setPayError("Verification failed. Contact support if money was deducted.");
      setStep("summary");
    }
  }, [ticketId, title, type, grandTotal, quantity, date, time, location, image]);

  const openPaystack = () => {
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Enter a valid email address");
      return;
    }
    setEmailError("");
    setPayError("");

    const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
    if (!publicKey || !paystackLoaded || !window.PaystackPop) {
      setPayError("Payment gateway is still loading. Please try again in a moment.");
      return;
    }

    const handler = window.PaystackPop.setup({
      key: publicKey,
      email,
      amount: grandTotal * 100, // kobo
      currency: "KES",
      ref: `NENE-${ticketId}-${Date.now()}`,
      metadata: {
        title, type, quantity, date, location, promoCode,
      },
      onClose: () => {
        // user closed the popup without paying — do nothing
      },
      callback: (response) => {
        handlePaymentSuccess(response.reference);
      },
    });

    handler.openIframe();
  };

  // ── Confirmed screen ─────────────────────────────────────────────────────
  if (step === "confirmed") {
    return (
      <div className="min-h-screen bg-[#050511] text-white flex flex-col items-center justify-center px-4 py-24">
        <div className="w-full max-w-md text-center">
          <div className="relative bg-white/5 border border-white/10 rounded-3xl overflow-hidden mb-8">
            {image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image} alt={title} className="w-full h-36 object-cover opacity-60" />
            )}
            <div className="absolute top-0 inset-x-0 h-36 bg-gradient-to-b from-transparent to-[#050511]" />

            <div className="relative -mt-8 flex justify-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-xl shadow-green-500/40">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
            </div>

            <div className="px-6 pt-4 pb-6">
              <p className="text-green-400 font-bold text-sm mb-1">Payment Confirmed!</p>
              <h2 className="text-xl font-bold mb-4">{title}</h2>

              <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                <div className="bg-black/30 rounded-xl p-3 text-left">
                  <p className="text-gray-500 text-xs mb-1">Ticket Type</p>
                  <p className="font-bold capitalize">{type}</p>
                </div>
                <div className="bg-black/30 rounded-xl p-3 text-left">
                  <p className="text-gray-500 text-xs mb-1">Quantity</p>
                  <p className="font-bold">{quantity} ticket{quantity > 1 ? "s" : ""}</p>
                </div>
                <div className="bg-black/30 rounded-xl p-3 text-left">
                  <p className="text-gray-500 text-xs mb-1">Date</p>
                  <p className="font-bold">{date}</p>
                </div>
                <div className="bg-black/30 rounded-xl p-3 text-left">
                  <p className="text-gray-500 text-xs mb-1">Amount Paid</p>
                  <p className="font-bold text-green-400">KES {grandTotal.toLocaleString()}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 my-4">
                <div className="flex-1 border-t border-dashed border-white/10" />
                <Ticket className="w-4 h-4 text-gray-600" />
                <div className="flex-1 border-t border-dashed border-white/10" />
              </div>

              <p className="text-xs text-gray-500 mb-1">Ticket Reference</p>
              <p className="text-2xl font-mono font-bold tracking-widest text-white">{ticketId}</p>
              {confirmedRef && (
                <p className="text-xs text-gray-600 mt-1 font-mono">Paystack ref: {confirmedRef}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Link href="/tickets">
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2">
                <Ticket className="w-4 h-4" /> View My Tickets
              </button>
            </Link>
            <Link href="/events">
              <button className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-3.5 rounded-xl transition">
                Browse More Events
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Paying / verifying screen ────────────────────────────────────────────
  if (step === "paying") {
    return (
      <div className="min-h-screen bg-[#050511] text-white flex flex-col items-center justify-center px-4 py-24">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Verifying Payment…</h2>
          <p className="text-gray-400 text-sm">Please wait while we confirm your payment.</p>
        </div>
      </div>
    );
  }

  // ── Summary + pay screen ─────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#050511] text-white pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-xl">

        <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm font-bold mb-8 transition">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <h1 className="text-2xl font-bold mb-8">Checkout</h1>

        {payError && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-4 rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /> {payError}
          </div>
        )}

        <div className="space-y-5">
          {/* Event card */}
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            {image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image} alt={title} className="w-full h-36 object-cover" />
            )}
            <div className="p-5">
              <p className="text-blue-400 text-xs font-bold uppercase tracking-wider mb-1 capitalize">{type} Ticket</p>
              <h2 className="text-xl font-bold mb-3">{title}</h2>
              <div className="flex flex-col gap-1.5 text-sm text-gray-400">
                <span className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-gray-600" /> {date} at {time}</span>
                <span className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-gray-600" /> {location}</span>
              </div>
            </div>
          </div>

          {/* Price breakdown */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">{quantity} × {type} ticket{quantity > 1 ? "s" : ""}</span>
              <span className="font-bold">KES {total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Service fee (3%)</span>
              <span>KES {serviceFee.toLocaleString()}</span>
            </div>
            {promoDiscount > 0 && (
              <div className="flex justify-between text-green-400">
                <span className="flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" /> {promoCode} ({promoDiscount}% off)
                  <button onClick={removePromo} className="text-gray-600 hover:text-red-400 transition">
                    <X className="w-3 h-3" />
                  </button>
                </span>
                <span>– KES {discountAmount.toLocaleString()}</span>
              </div>
            )}
            <div className="border-t border-white/10 pt-3 flex justify-between">
              <span className="font-bold">Total</span>
              <span className="text-xl font-bold text-blue-400">KES {grandTotal.toLocaleString()}</span>
            </div>
          </div>

          {/* Promo code */}
          {!promoCode && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <p className="text-xs font-bold text-gray-400 mb-3 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" /> Have a promo code?
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoInput}
                  onChange={(e) => { setPromoInput(e.target.value.toUpperCase()); setPromoError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && applyPromo()}
                  placeholder="e.g. NENE10"
                  className={`flex-1 bg-black/40 border rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none transition ${
                    promoError ? "border-red-500" : "border-white/10 focus:border-blue-500"
                  }`}
                />
                <button onClick={applyPromo} className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition">
                  Apply
                </button>
              </div>
              {promoError && (
                <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {promoError}
                </p>
              )}
            </div>
          )}

          {/* Email input */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <label className="block text-sm font-bold text-gray-300 mb-2">
              Email for ticket delivery
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
              placeholder="you@example.com"
              className={`w-full bg-black/40 border rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none transition ${
                emailError ? "border-red-500" : "border-white/10 focus:border-blue-500"
              }`}
            />
            {emailError && (
              <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {emailError}
              </p>
            )}
            <p className="text-xs text-gray-600 mt-2">Your ticket confirmation will be sent here.</p>
          </div>

          {/* Pay button */}
          <button
            onClick={openPaystack}
            disabled={!paystackLoaded}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-800 disabled:text-gray-500 text-white font-bold py-4 rounded-xl transition shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 text-lg"
          >
            {!paystackLoaded ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Loading payment…</>
            ) : (
              <><CreditCard className="w-5 h-5" /> Pay KES {grandTotal.toLocaleString()}</>
            )}
          </button>

          {/* Payment methods */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-3 text-xs text-gray-600">
              <Shield className="w-3.5 h-3.5" /> Secured by Paystack · 256-bit SSL
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-600">
              <Smartphone className="w-3.5 h-3.5" />
              <span>M-Pesa · Visa · Mastercard · Bank Transfer</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <ChevronRight className="w-3 h-3 text-gray-700 rotate-180" />
              <span className="text-xs text-gray-600">You&apos;ll choose your payment method in the next step</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <main className="min-h-screen bg-[#050511] text-white">
      <Navbar />
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      }>
        <CheckoutContent />
      </Suspense>
    </main>
  );
}
