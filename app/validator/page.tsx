"use client";

import { useState } from "react";
import Link from "next/link";
import { ScanLine, CheckCircle2, XCircle, AlertTriangle, Search, ArrowLeft } from "lucide-react";

export default function ValidatorPage() {
  const [ticketId, setTicketId] = useState("");
  const [result, setResult] = useState<any>(null);
  const [status, setStatus] = useState<'idle' | 'valid' | 'invalid' | 'used'>('idle');

  const handleScan = (e: any) => {
    e.preventDefault();
    
    // 1. Get DB
    const soldTickets = JSON.parse(localStorage.getItem("nene_sold_tickets") || "[]");
    
    // 2. Find Ticket
    const ticket = soldTickets.find((t: any) => t.id === ticketId);

    if (!ticket) {
        setStatus('invalid');
        setResult(null);
    } else if (ticket.status === 'used') {
        setStatus('used');
        setResult(ticket);
    } else {
        setStatus('valid');
        setResult(ticket);
    }
  };

  const handleCheckIn = () => {
    if (!result) return;

    // Update DB to mark as used
    const soldTickets = JSON.parse(localStorage.getItem("nene_sold_tickets") || "[]");
    const updatedTickets = soldTickets.map((t: any) => {
        if (t.id === result.id) {
            return { ...t, status: 'used', checkInTime: new Date().toLocaleTimeString() };
        }
        return t;
    });
    
    localStorage.setItem("nene_sold_tickets", JSON.stringify(updatedTickets));
    setStatus('used');
    setResult({ ...result, status: 'used', checkInTime: new Date().toLocaleTimeString() });
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white p-4 flex flex-col items-center justify-center">
      
      {/* Header */}
      <div className="w-full max-w-md mb-8 flex items-center justify-between">
        <Link href="/" className="text-gray-400 hover:text-white flex items-center gap-2"><ArrowLeft className="w-5 h-5"/> Exit</Link>
        <div className="flex items-center gap-2 font-bold text-xl"><ScanLine className="w-6 h-6 text-blue-500" /> NeneScanner</div>
      </div>

      {/* Scanner Form */}
      <div className="w-full max-w-md bg-gray-800 border border-gray-700 p-6 rounded-2xl shadow-xl mb-6">
        <form onSubmit={handleScan} className="relative">
            <input 
                value={ticketId}
                onChange={(e) => setTicketId(e.target.value)}
                placeholder="Enter Ticket ID (e.g. T-4521)" 
                className="w-full bg-gray-900 border border-gray-600 rounded-xl py-4 pl-4 pr-12 text-lg font-mono text-white outline-none focus:border-blue-500 transition uppercase placeholder:normal-case"
            />
            <button type="submit" className="absolute right-2 top-2 bg-blue-600 p-2 rounded-lg hover:bg-blue-500 transition">
                <Search className="w-6 h-6" />
            </button>
        </form>
      </div>

      {/* RESULT CARD */}
      {status === 'idle' && (
        <div className="text-gray-500 text-center text-sm">Ready to scan tickets...</div>
      )}

      {status === 'invalid' && (
        <div className="w-full max-w-md bg-red-900/20 border border-red-500/50 p-6 rounded-2xl text-center animate-in zoom-in duration-300">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-500 mb-2">Invalid Ticket</h2>
            <p className="text-gray-400">ID <strong>{ticketId}</strong> not found in database.</p>
        </div>
      )}

      {(status === 'valid' || status === 'used') && result && (
        <div className={`w-full max-w-md border p-6 rounded-2xl text-center animate-in zoom-in duration-300 ${status === 'valid' ? 'bg-green-900/20 border-green-500/50' : 'bg-yellow-900/20 border-yellow-500/50'}`}>
            
            {status === 'valid' ? (
                <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            ) : (
                <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            )}

            <h2 className={`text-3xl font-bold mb-1 ${status === 'valid' ? 'text-green-500' : 'text-yellow-500'}`}>
                {status === 'valid' ? 'Valid Ticket' : 'Already Used'}
            </h2>
            
            <p className="text-gray-400 mb-6 text-sm uppercase font-bold tracking-widest">
                {status === 'valid' ? 'Access Granted' : `Checked in at ${result.checkInTime || 'Previously'}`}
            </p>

            <div className="bg-gray-900/50 rounded-xl p-4 text-left space-y-3 mb-6">
                <div>
                    <span className="text-xs text-gray-500 uppercase block">Event</span>
                    <span className="font-bold text-lg">{result.eventTitle}</span>
                </div>
                <div className="flex justify-between">
                    <div>
                        <span className="text-xs text-gray-500 uppercase block">Type</span>
                        <span className="font-bold text-white">{result.ticketType}</span>
                    </div>
                    <div className="text-right">
                        <span className="text-xs text-gray-500 uppercase block">Holder</span>
                        <span className="font-bold text-white">{result.holderName}</span>
                    </div>
                </div>
            </div>

            {/* ACTION BUTTON */}
            {status === 'valid' && (
                <button 
                    onClick={handleCheckIn}
                    className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-900/50 transition transform active:scale-95"
                >
                    CHECK IN ATTENDEE
                </button>
            )}
            
             {status === 'used' && (
                <button 
                    onClick={() => {setTicketId(""); setStatus("idle");}}
                    className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-xl transition"
                >
                    Scan Next Ticket
                </button>
            )}
        </div>
      )}

    </main>
  );
}