"use client";

import { motion } from "framer-motion";
import { MapPin, Calendar, Tag } from "lucide-react";
import Link from "next/link";

// This defines what data a card needs to work
interface EventProps {
  id: string;
  title: string;
  image: string;
  date: string;
  location: string;
  price: string;
  category: string;
  aiTag?: string; // Optional "Visionary" tag (e.g., "Selling Fast")
}

export default function EventCard({ event }: { event: EventProps }) {
  return (
    <motion.div
      whileHover={{ y: -10 }} // Lifts up when hovered
      className="group relative bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300"
    >
      {/* 1. Event Image */}
      <div className="h-48 w-full relative overflow-hidden">
        {/* The 'AI Tag' Badge */}
        {event.aiTag && (
          <div className="absolute top-3 right-3 z-10 bg-pink-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
            <Tag className="w-3 h-3" /> {event.aiTag}
          </div>
        )}
        
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover transform group-hover:scale-110 transition duration-700"
        />
        
        {/* Dark Gradient Overlay at bottom of image */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050511] via-transparent to-transparent opacity-80" />
      </div>

      {/* 2. Event Details */}
      <div className="p-5">
        {/* Category Label */}
        <span className="text-blue-400 text-xs font-bold uppercase tracking-wider mb-2 block">
          {event.category}
        </span>

        <h3 className="text-xl font-bold text-white mb-2 leading-tight group-hover:text-blue-400 transition-colors">
          {event.title}
        </h3>

        {/* Date & Location Rows */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-gray-400 text-sm">
            <Calendar className="w-4 h-4 mr-2 text-gray-500" />
            {event.date}
          </div>
          <div className="flex items-center text-gray-400 text-sm">
            <MapPin className="w-4 h-4 mr-2 text-gray-500" />
            {event.location}
          </div>
        </div>

        {/* Price & Button Row */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
          <div>
            <span className="text-gray-400 text-xs block">Starting from</span>
            <span className="text-white font-bold text-lg">{event.price}</span>
          </div>
          
          <Link href={`/event/${event.id}`} className="block">
    <button className="w-full bg-white/10 hover:bg-white text-white hover:text-black px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300">
        Get Tickets
    </button>
</Link>
        </div>
      </div>
    </motion.div>
  );
}