"use client";

import { useState } from "react";
import Navbar from "../../components/shared/Navbar";
import { MessageSquare, CheckCircle2, HelpCircle, ChevronDown, ChevronUp, Mail, Phone, Send, CreditCard } from "lucide-react";
import Link from "next/link";

// MOCK FAQs
const FAQS = [
  { question: "I paid but didn't receive my ticket.", answer: "This usually happens due to network delays. Please wait 5 minutes. If it still doesn't appear, submit a ticket below with your M-Pesa transaction code." },
  { question: "Can I get a refund?", answer: "Refunds are processed within 24 hours for cancelled events. For personal cancellations, please check the specific event's policy." },
  { question: "How do I host an event?", answer: "Click 'Host an Event' in the menu, create an account, and you can start publishing events immediately." },
];

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketRef, setTicketRef] = useState("");
  
  // NEW: Track the selected issue type
  const [issueType, setIssueType] = useState("Payment Issue (M-Pesa)");

  const handleSubmit = (e: any) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API Call
    setTimeout(() => {
        const refId = "CS-" + Math.floor(1000 + Math.random() * 9000);
        setTicketRef(refId);
        setIsSubmitting(false);
    }, 1500);
  };

  return (
    <main className="min-h-screen bg-black text-white selection:bg-blue-600 selection:text-white">
      <Navbar />

      <div className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto">
            
            {/* Header */}
            <div className="text-center mb-16">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6 shadow-lg shadow-blue-600/30">
                    <HelpCircle className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-4xl font-bold mb-4">How can we help?</h1>
                <p className="text-gray-400">Search our help center or raise a support ticket.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                
                {/* LEFT: Contact Form */}
                <div>
                    {!ticketRef ? (
                        <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-sm">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-blue-400" /> Raise a Ticket
                            </h2>
                            
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-400 mb-2">Issue Type</label>
                                    <select 
                                        value={issueType}
                                        onChange={(e) => setIssueType(e.target.value)}
                                        className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-blue-500 transition appearance-none cursor-pointer"
                                    >
                                        <option value="Payment Issue (M-Pesa)">Payment Issue (M-Pesa)</option>
                                        <option value="Ticket Not Received">Ticket Not Received</option>
                                        <option value="Account Login / Reset">Account Login / Reset</option>
                                        <option value="Refund Request">Refund Request</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                {/* CONDITIONAL FIELD: Only shows for Payment Issues */}
                                {issueType === "Payment Issue (M-Pesa)" && (
                                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                        <label className="block text-sm font-bold text-green-400 mb-2 flex items-center gap-2">
                                            <CreditCard className="w-4 h-4" /> M-Pesa Transaction Code <span className="text-red-500">*</span>
                                        </label>
                                        <input 
                                            required 
                                            type="text" 
                                            placeholder="e.g. QFH345..." 
                                            className="w-full bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-white placeholder-green-500/50 outline-none focus:border-green-500 transition font-mono uppercase" 
                                        />
                                        <p className="text-xs text-gray-500 mt-2">Required for tracking your payment.</p>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-bold text-gray-400 mb-2">Email Address</label>
                                    <input required type="email" placeholder="name@example.com" className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-blue-500 transition" />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-400 mb-2">Description</label>
                                    <textarea required rows={4} placeholder="Describe your issue..." className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-blue-500 transition resize-none" />
                                </div>

                                <button 
                                    disabled={isSubmitting}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? "Sending..." : <><Send className="w-4 h-4" /> Submit Ticket</>}
                                </button>
                            </form>
                        </div>
                    ) : (
                        // SUCCESS STATE
                        <div className="bg-green-500/10 border border-green-500/20 p-8 rounded-3xl text-center h-full flex flex-col items-center justify-center">
                            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6">
                                <CheckCircle2 className="w-10 h-10 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Ticket Received!</h2>
                            <p className="text-gray-300 mb-6">Your Case Number is <span className="text-white font-bold">{ticketRef}</span>. We will email you within 2 hours.</p>
                            <button onClick={() => setTicketRef("")} className="bg-white text-black font-bold py-3 px-6 rounded-xl hover:bg-gray-200 transition">
                                Raise Another Issue
                            </button>
                        </div>
                    )}
                </div>

                {/* RIGHT: FAQs & Contact Info */}
                <div className="space-y-8">
                    {/* FAQ Accordion */}
                    <div>
                        <h2 className="text-xl font-bold mb-6">Frequently Asked</h2>
                        <div className="space-y-4">
                            {FAQS.map((faq, i) => (
                                <div key={i} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                                    <button 
                                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                        className="w-full flex justify-between items-center p-4 text-left font-bold hover:bg-white/5 transition"
                                    >
                                        {faq.question}
                                        {openFaq === i ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                                    </button>
                                    {openFaq === i && (
                                        <div className="p-4 pt-0 text-gray-400 text-sm leading-relaxed border-t border-white/5 mt-2">
                                            {faq.answer}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Contact Cards */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex flex-col items-center text-center hover:border-blue-500/50 transition cursor-pointer group">
                            <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center mb-3 group-hover:bg-blue-500 group-hover:text-white transition text-blue-400">
                                <Mail className="w-5 h-5" />
                            </div>
                            <span className="font-bold text-sm">Email Us</span>
                            <span className="text-xs text-gray-500">support@nenetickets.co.ke</span>
                        </div>
                        <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex flex-col items-center text-center hover:border-green-500/50 transition cursor-pointer group">
                            <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center mb-3 group-hover:bg-green-500 group-hover:text-white transition text-green-400">
                                <Phone className="w-5 h-5" />
                            </div>
                            <span className="font-bold text-sm">Call Us</span>
                            <span className="text-xs text-gray-500">+254 700 000 000</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </main>
  );
}