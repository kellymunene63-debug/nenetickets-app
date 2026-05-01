"use client";

import Navbar from "../../components/shared/Navbar";
import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Phone, CheckCircle2, Ticket, ArrowLeft, Shield,
  Loader2, MapPin, Calendar, ChevronRight, AlertCircle
} from "lucide-react";

function generateTicketId() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

type CheckoutStep = "summary" | "phone" | "waiting" | "confirmed";

function CheckoutContent() {
  const params = useSearchParams();
  const router = useRouter();

  const title = params.get("title") ?? "Event Ticket";
  const type = params.get("type") ?? "regular";
  const price = Number(params.get("price") ?? 0);
  const quantity = Number(params.get("quantity") ?? 1);
  const date = params.get("date") ?? "";
  const time = params.get("time") ?? "";
  const location = params.get("location") ?? "";
  const image = params.get("image") ?? "";

  const total = price * quantity;
  const serviceFee = Math.round(total * 0.03);
  const grandTotal = total + serviceFee;

  const [step, setStep] = useState<CheckoutStep>("summary");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [ticketId] = useState(() => generateTicketId());
  const [progress, setProgress] = useState(0);

  // Simulate STK push loading
  useEffect(() => {
    if (step !== "waiting") return;
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          // Save to localStorage
          try {
            const existing = JSON.parse(localStorage.getItem("nene_sold_tickets") ?? "[]");
            existing.push({
              id: ticketId,
              title,
              type,
              price: grandTotal,
              quantity,
              date,
              time,
              location,
              image,
              purchasedAt: new Date().toISOString(),
              phone,
            });
            localStorage.setItem("nene_sold_tickets", JSON.stringify(existing));
          } catch {}
          setTimeout(() => setStep("confirmed"), 300);
          return 100;
        }
        return p + 4;
      });
    }, 120);
    return () => clearInterval(interval);
  }, [step, ticketId, title, type, grandTotal, quantity, date, time, location, image, phone]);

  const validatePhone = (val: string) => {
    const cleaned = val.replace(/\s/g, "");
    if (!cleaned) return "Phone number is required";
    if (!/^(07|01|\+2547|\+2541|2547|2541)\d{7,8}$/.test(cleaned)) {
      return "Enter a valid Kenyan phone number (e.g. 0712345678)";
    }
    return "";
  };

  const handlePay = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const err = validatePhone(phone);
    if (err) { setPhoneError(err); return; }
    setPhoneError("");
    setStep("waiting");
  };

  if (step === "confirmed") {
    return (
      <div className="min-h-screen bg-[#050511] text-white flex flex-col items-center justify-center px-4 py-24">
        <div className="w-full max-w-md text-center">
          {/* Ticket card */}
          <div className="relative bg-white/5 border border-white/10 rounded-3xl overflow-hidden mb-8">
            {image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image} alt={title} className="w-full h-36 object-cover opacity-60" />
            )}
            <div className="absolute top-0 inset-x-0 h-36 bg-gradient-to-b from-transparent to-[#050511]" />

            {/* Success icon */}
            <div className="relative -mt-8 flex justify-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-xl shadow-green-500/40">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
            </div>

            <div className="px-6 pt-4 pb-6">
              <p className="text-green-400 font-bold text-sm mb-1">Payment Confirmed!</p>
              <h2 className="text-xl font-bold mb-4">{title}</h2>

              <div className="grid grid-cols-2 gap-3 text-sm mb-6">
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

              {/* Dashed divider */}
              <div className="flex items-center gap-2 my-4">
                <div className="flex-1 border-t border-dashed border-white/10" />
                <Ticket className="w-4 h-4 text-gray-600" />
                <div className="flex-1 border-t border-dashed border-white/10" />
              </div>

              {/* Ticket ID */}
              <p className="text-xs text-gray-500 mb-1">Ticket Reference</p>
              <p className="text-2xl font-mono font-bold tracking-widest text-white">{ticketId}</p>
              <p className="text-xs text-gray-600 mt-1">Show this at the venue gate</p>
            </div>
          </div>

          <p className="text-gray-400 text-sm mb-6">
            A confirmation has been sent to your M-Pesa and email. Keep your ticket reference safe.
          </p>

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

  if (step === "waiting") {
    return (
      <div className="min-h-screen bg-[#050511] text-white flex flex-col items-center justify-center px-4 py-24">
        <div className="w-full max-w-sm text-center">
          <div className="w-20 h-20 rounded-full border-4 border-blue-500/20 flex items-center justify-center mx-auto mb-6 relative">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin" style={{ animationDuration: "0.8s" }} />
          </div>
          <h2 className="text-xl font-bold mb-2">Check Your Phone</h2>
          <p className="text-gray-400 mb-2">
            An M-Pesa prompt has been sent to <span className="text-white font-bold">{phone}</span>.
          </p>
          <p className="text-gray-500 text-sm mb-8">Enter your M-Pesa PIN to complete the payment.</p>

          {/* Progress bar */}
          <div className="w-full bg-white/10 rounded-full h-1.5 mb-2">
            <div
              className="bg-blue-500 h-1.5 rounded-full transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-600">Waiting for confirmation…</p>

          <div className="mt-8 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 text-left">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-yellow-400 font-bold text-sm">Don&apos;t close this page</p>
                <p className="text-yellow-200/60 text-xs mt-1">
                  Keep this tab open until you receive the M-Pesa confirmation SMS.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050511] text-white pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Back */}
        <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm font-bold mb-8 transition">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <h1 className="text-2xl font-bold mb-8">
          {step === "summary" ? "Order Summary" : "Enter M-Pesa Number"}
        </h1>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {["summary", "phone"].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step === s ? "bg-blue-600 text-white" : i < ["summary", "phone"].indexOf(step) ? "bg-green-500 text-white" : "bg-white/10 text-gray-500"
              }`}>
                {i < ["summary", "phone"].indexOf(step) ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
              </div>
              <span className={`text-xs font-bold capitalize hidden sm:block ${step === s ? "text-white" : "text-gray-500"}`}>
                {s === "summary" ? "Review" : "Payment"}
              </span>
              {i < 1 && <ChevronRight className="w-4 h-4 text-gray-600" />}
            </div>
          ))}
        </div>

        {step === "summary" && (
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
                  <span className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-gray-600" /> {date} at {time}
                  </span>
                  <span className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-gray-600" /> {location}
                  </span>
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
              <div className="border-t border-white/10 pt-3 flex justify-between">
                <span className="font-bold">Total</span>
                <span className="text-xl font-bold text-blue-400">KES {grandTotal.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={() => setStep("phone")}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
            >
              Continue to Payment <ChevronRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
              <Shield className="w-3.5 h-3.5" /> Secured by M-Pesa · 256-bit encryption
            </div>
          </div>
        )}

        {step === "phone" && (
          <div className="space-y-5">
            {/* Order recap */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center justify-between text-sm">
              <div>
                <p className="text-gray-400">{quantity} × {type} · {title}</p>
                <p className="font-bold text-white text-lg mt-0.5">KES {grandTotal.toLocaleString()}</p>
              </div>
              <button onClick={() => setStep("summary")} className="text-blue-400 hover:underline text-xs font-bold">
                Edit
              </button>
            </div>

            <form onSubmit={handlePay} className="space-y-5">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-green-600/20 rounded-xl flex items-center justify-center">
                    <Phone className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-bold">M-Pesa STK Push</h3>
                    <p className="text-xs text-gray-500">We&apos;ll send a prompt to your phone</p>
                  </div>
                </div>

                <label className="block text-sm font-bold text-gray-300 mb-2">
                  M-Pesa Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); setPhoneError(""); }}
                  placeholder="0712 345 678"
                  className={`w-full bg-black/40 border rounded-xl px-4 py-3.5 text-white placeholder:text-gray-600 focus:outline-none transition text-lg tracking-wide ${
                    phoneError ? "border-red-500 focus:border-red-500" : "border-white/10 focus:border-blue-500"
                  }`}
                />
                {phoneError && (
                  <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {phoneError}
                  </p>
                )}
                <p className="text-xs text-gray-600 mt-3">
                  After clicking Pay, an M-Pesa prompt will appear on your phone. Enter your PIN to complete payment.
                </p>
              </div>

              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl transition shadow-lg shadow-green-600/20 flex items-center justify-center gap-2 text-lg"
              >
                <Phone className="w-5 h-5" /> Pay KES {grandTotal.toLocaleString()}
              </button>
            </form>

            <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
              <Shield className="w-3.5 h-3.5" /> Your PIN is never shared with us
            </div>
          </div>
        )}
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
