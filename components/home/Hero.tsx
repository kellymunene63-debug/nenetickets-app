"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Sparkles } from "lucide-react";

const PLACEHOLDERS = [
  "Find me a jazz concert in Nairobi...",
  "I need VIP tickets for a match...",
  "Date night spots in Westlands...",
];

export default function Hero() {
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDERS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-[85vh] w-full overflow-hidden bg-nene-dark flex flex-col items-center justify-center text-white">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-black/50 z-10" />
        <video autoPlay loop muted playsInline className="h-full w-full object-cover" poster="https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=2070&auto=format&fit=crop">
          <source src="https://videos.pexels.com/video-files/2022395/2022395-hd_1920_1080_30fps.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      <div className="relative z-20 w-full max-w-4xl px-4 flex flex-col items-center text-center space-y-8">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4">
            Don&apos;t just go. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-600">
              Experience it.
            </span>
          </h1>
          <p className="text-lg text-gray-200 max-w-2xl mx-auto">
            The AI-powered gateway to Kenya&apos;s most exclusive events, rallies, and games.
          </p>
        </motion.div>

        <motion.div className="w-full max-w-lg relative group" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-pink-600 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
            <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-2 flex items-center">
                <Search className="text-gray-300 w-6 h-6 ml-3" />
                <input type="text" className="w-full bg-transparent text-white text-lg px-4 py-3 outline-none placeholder-gray-300" placeholder={PLACEHOLDERS[placeholderIndex]} />
                <button className="bg-white text-black font-bold py-3 px-8 rounded-xl hover:bg-gray-200 transition">Find</button>
            </div>
        </motion.div>
      </div>
    </div>
  );
}