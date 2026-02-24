"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot } from "lucide-react";

export default function NeneBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: "Hi! I'm NeneBot 🤖. Ask me about events, tickets, or just say hello!" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e: any) => {
    e.preventDefault();
    if (!input.trim()) return;

    // 1. Add User Message
    const userText = input;
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setInput("");
    setIsTyping(true);

    // 2. Simulate AI Thinking (Delay)
    setTimeout(() => {
      const botResponse = getSmartResponse(userText);
      setMessages(prev => [...prev, { role: 'bot', text: botResponse }]);
      setIsTyping(false);
    }, 800);
  };

  // --- THE BRAIN: INTELLIGENT RESPONSE LOGIC ---
  const getSmartResponse = (text: string) => {
    const lower = text.toLowerCase();

    // 1. GREETINGS & CHIT-CHAT
    if (lower.match(/^(hi|hello|hey|greetings|morning|afternoon|evening)/)) {
        const greetings = ["Hello there! 👋", "Hi! Ready to find a ticket?", "Greetings! How can I help you today?"];
        return greetings[Math.floor(Math.random() * greetings.length)];
    }
    if (lower.includes("how are you")) {
        return "I'm just a bot, but I'm feeling bug-free today! ⚡ How about you?";
    }
    if (lower.includes("who are you") || lower.includes("your name")) {
        return "I'm NeneBot, your virtual concierge for NeneTickets. I help you find events and solve issues.";
    }
    if (lower.includes("thank")) {
        return "You're very welcome! Let me know if you need anything else. 🌟";
    }

    // 2. GENERAL KNOWLEDGE / UTILITY
    if (lower.includes("time")) {
        return `It is currently ${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} in your local time.`;
    }
    if (lower.includes("joke")) {
        const jokes = [
            "Why did the web developer walk out of the bar? He didn't like the layout.",
            "Why do programmers prefer dark mode? Because light attracts bugs!",
            "I would tell you a UDP joke, but you might not get it."
        ];
        return jokes[Math.floor(Math.random() * jokes.length)];
    }

    // 3. SPECIFIC APP HELP (Expanded)
    if (lower.match(/(refund|money back|return)/)) {
        return "Refunds are processed within 24 hours for cancelled events. For other issues, please visit our Support page.";
    }
    if (lower.match(/(password|login|cant sign in)/)) {
        return "Trouble logging in? You can reset your password on the Login page using your phone number.";
    }
    if (lower.match(/(mpesa|pay|payment)/)) {
        return "We accept M-Pesa Express. If your payment failed, please go to 'Support' and share your transaction code.";
    }
    if (lower.match(/(location|where is|venue)/)) {
        return "You can see the venue location on each specific Event Page. We even have a map there!";
    }

    // 4. CATEGORY NAVIGATION
    if (lower.includes("music") || lower.includes("concert")) {
        return "We have some amazing concerts coming up, like the Jazz Festival! 🎷 Check the 'Music' tab.";
    } 
    if (lower.includes("sport") || lower.includes("football")) {
        return "The Mashemeji Derby is the hottest match right now! ⚽ Check the 'Sports' tab.";
    }

    // 5. DEFAULT FALLBACK
    return "I'm still learning! 🧠 I can help with Events, Payments, or Refunds. You can also try asking 'Tell me a joke'!";
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
      
      {/* CHAT WINDOW */}
      {isOpen && (
        <div className="mb-4 w-80 md:w-96 bg-gray-900 border border-white/20 rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5 duration-300 flex flex-col h-[500px]">
          
          {/* Header */}
          <div className="bg-blue-600 p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
                <div className="bg-white/20 p-1.5 rounded-lg"><Bot className="w-5 h-5 text-white" /></div>
                <div>
                    <h3 className="font-bold text-white text-sm">NeneBot AI</h3>
                    <p className="text-blue-100 text-xs flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span> Online</p>
                </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white"><X className="w-5 h-5" /></button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-black/50">
            {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-xl p-3 text-sm leading-relaxed ${
                        msg.role === 'user' 
                        ? 'bg-blue-600 text-white rounded-br-none' 
                        : 'bg-gray-800 text-gray-200 border border-white/10 rounded-bl-none'
                    }`}>
                        {msg.text}
                    </div>
                </div>
            ))}
            {isTyping && (
                <div className="flex justify-start">
                    <div className="bg-gray-800 rounded-xl p-3 rounded-bl-none flex gap-1">
                        <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100"></span>
                        <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"></span>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="p-3 bg-gray-900 border-t border-white/10 flex gap-2">
            <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask NeneBot..." 
                className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-blue-500 transition"
            />
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-xl transition">
                <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* FLOATING BUTTON */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-lg shadow-blue-600/30 flex items-center justify-center transition-all duration-300 hover:scale-110 ${
            isOpen ? 'bg-gray-800 text-white rotate-90' : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
        }`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </button>
    </div>
  );
}