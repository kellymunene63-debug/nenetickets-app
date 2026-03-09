"use client";

import { useSearchParams } from "next/navigation";
import Navbar from "../../components/shared/Navbar";
import { Suspense, useState, useEffect, useRef } from "react";
import { Download, Share2, Calendar, MapPin, Clock, CheckCircle2, QrCode, AlertCircle, Loader2 } from "lucide-react";
import html2canvas from "html2canvas";

function TicketContent() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const ticketRef = useRef<HTMLDivElement>(null); // 1. Target the element

  // GET TICKET DATA
  const ticketData = {
    id: searchParams.get('id') || "T-0000",
    title: searchParams.get('title') || "Event Name",
    holder: searchParams.get('holder') || "Guest",
    type: searchParams.get('type') || "Regular",
    date: searchParams.get('date') || "Date TBD",
    time: searchParams.get('time') || "Time TBD",
    location: searchParams.get('location') || "Venue TBD",
    quantity: searchParams.get('quantity') || "1",
    image: searchParams.get('image') || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070",
  };

  const qrData = JSON.stringify({
    id: ticketData.id,
    name: ticketData.holder,
    event: ticketData.title,
    valid: true
  });
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;

  useEffect(() => {
    setTimeout(() => setLoading(false), 1500);
  }, []);

  // 2. DOWNLOAD FUNCTION
  const handleDownload = async () => {
    if (!ticketRef.current) return;
    
    setIsDownloading(true);
    
    try {
        // Wait a tiny bit to ensure external images are ready
        const canvas = await html2canvas(ticketRef.current, {
            useCORS: true, // Vital for capturing images from URL
            scale: 2,      // High resolution (Retina)
            backgroundColor: null, // Transparent corners support
        }as any); 

        const image = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = image;
        link.download = `NeneTicket-${ticketData.id}.png`;
        link.click();
    } catch (err) {
        console.error("Download failed:", err);
        alert("Could not save ticket. Please try taking a screenshot manually.");
    } finally {
        setIsDownloading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white pb-20">
      <Navbar />

      <div className="container mx-auto px-4 pt-24 flex flex-col items-center">
        
        <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Your Digital Ticket</h1>
            <p className="text-gray-400">Present this QR code at the entrance.</p>
        </div>

        {loading ? (
            <div className="bg-white/5 border border-white/10 p-12 rounded-3xl flex flex-col items-center animate-pulse">
                <div className="w-16 h-16 bg-white/10 rounded-full mb-4"></div>
                <div className="h-4 w-48 bg-white/10 rounded mb-2"></div>
                <div className="h-4 w-32 bg-white/10 rounded"></div>
            </div>
        ) : (
            // 3. ATTACH REF TO THE TICKET CARD
            <div ref={ticketRef} className="relative w-full max-w-md bg-white text-black rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(255,255,255,0.1)]">
                
                {/* IMAGE HEADER */}
                <div className="h-48 relative">
                    {/* crossOrigin is vital for html2canvas */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                        src={ticketData.image} 
                        alt="Event" 
                        crossOrigin="anonymous" 
                        className="w-full h-full object-cover" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6">
                        <div>
                            <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded uppercase tracking-wider mb-2 inline-block">
                                {ticketData.type} Ticket
                            </span>
                            <h2 className="text-white text-2xl font-bold leading-tight">{ticketData.title}</h2>
                        </div>
                    </div>
                </div>

                {/* TICKET BODY */}
                <div className="p-6 relative">
                    <div className="absolute -left-3 top-0 w-6 h-6 bg-black rounded-full"></div>
                    <div className="absolute -right-3 top-0 w-6 h-6 bg-black rounded-full"></div>
                    
                    <div className="flex justify-between items-start mb-6 border-b border-dashed border-gray-300 pb-6">
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-bold mb-1">Date</p>
                            <p className="font-bold flex items-center gap-1"><Calendar className="w-4 h-4 text-blue-600" /> {ticketData.date}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-500 uppercase font-bold mb-1">Time</p>
                            <p className="font-bold flex items-center gap-1 justify-end"><Clock className="w-4 h-4 text-blue-600" /> {ticketData.time}</p>
                        </div>
                    </div>

                    <div className="mb-6">
                        <p className="text-xs text-gray-500 uppercase font-bold mb-1">Venue</p>
                        <p className="font-bold flex items-center gap-1"><MapPin className="w-4 h-4 text-blue-600" /> {ticketData.location}</p>
                    </div>

                    <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl mb-6">
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-bold">Ticket Holder</p>
                            <p className="font-bold text-lg">{ticketData.holder}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-500 uppercase font-bold">Admit</p>
                            <p className="font-bold text-lg">{ticketData.quantity} Person(s)</p>
                        </div>
                    </div>

                    {/* QR CODE SECTION */}
                    <div className="flex flex-col items-center justify-center pt-2">
                        <div className="bg-white p-2 border-2 border-gray-900 rounded-xl mb-3">
                            <img src={qrUrl} alt="Ticket QR" className="w-40 h-40" crossOrigin="anonymous" />
                        </div>
                        <p className="text-xs text-gray-400 font-mono tracking-widest">{ticketData.id}</p>
                        <div className="flex items-center gap-1 text-green-600 text-xs font-bold mt-2 animate-pulse">
                            <CheckCircle2 className="w-3 h-3" /> Valid Ticket
                        </div>
                    </div>
                </div>

                {/* 4. ACTIONS FOOTER (Hidden in screenshot ideally, but okay to keep if desired) */}
                <div data-html2canvas-ignore className="bg-gray-100 p-4 flex gap-3">
                    <button 
                        onClick={handleDownload}
                        disabled={isDownloading}
                        className="flex-1 bg-black text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-800 transition disabled:bg-gray-500"
                    >
                        {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        {isDownloading ? "Saving..." : "Save Ticket"}
                    </button>
                    <button className="flex-1 bg-white border border-gray-300 text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 transition">
                        <Share2 className="w-4 h-4" /> Share
                    </button>
                </div>
            </div>
        )}
        
        <div className="mt-8 max-w-md text-center bg-blue-900/20 border border-blue-500/30 p-4 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-200 text-left">
                <strong>Do not share this QR code</strong> on social media. It functions as your entry pass and can only be scanned once.
            </p>
        </div>

      </div>
    </main>
  );
}

export default function TicketPage() {
  return <Suspense fallback={<div>Loading...</div>}><TicketContent /></Suspense>;
}