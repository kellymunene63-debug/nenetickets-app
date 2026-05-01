"use client";

import { motion } from "framer-motion";
import { MapPin, Calendar, Tag, Clock } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

interface EventProps {
  id: string;
  title: string;
  image: string;
  date: string;
  location: string;
  price: string;
  category: string;
  aiTag?: string;
}

function getCountdown(dateStr: string): { label: string; urgent: boolean } | null {
  try {
    const eventDate = new Date(dateStr);
    if (isNaN(eventDate.getTime())) return null;

    const now = new Date();
    const diffMs = eventDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return null; // past event
    if (diffDays === 0) return { label: "Today!", urgent: true };
    if (diffDays === 1) return { label: "Tomorrow", urgent: true };
    if (diffDays <= 7) return { label: `${diffDays} days left`, urgent: true };
    if (diffDays <= 30) return { label: `${diffDays} days away`, urgent: false };

    const months = Math.round(diffDays / 30);
    return { label: `${months} month${months > 1 ? "s" : ""} away`, urgent: false };
  } catch {
    return null;
  }
}

export default function EventCard({ event }: { event: EventProps }) {
  const countdown = useMemo(() => getCountdown(event.date), [event.date]);

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.2 }}
      className="group relative bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-blue-500/20 hover:border-white/20 transition-all duration-300"
    >
      {/* Image */}
      <div className="h-48 w-full relative overflow-hidden">
        {event.aiTag && (
          <div className="absolute top-3 right-3 z-10 bg-pink-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
            <Tag className="w-3 h-3" /> {event.aiTag}
          </div>
        )}

        {/* Countdown badge */}
        {countdown && (
          <div className={`absolute top-3 left-3 z-10 flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full shadow-lg ${
            countdown.urgent
              ? "bg-orange-500/90 text-white"
              : "bg-black/70 text-gray-300 border border-white/10"
          }`}>
            <Clock className="w-3 h-3" />
            {countdown.label}
          </div>
        )}

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover transform group-hover:scale-105 transition duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050511] via-transparent to-transparent opacity-80" />
      </div>

      {/* Details */}
      <div className="p-5">
        <span className="text-blue-400 text-xs font-bold uppercase tracking-wider mb-2 block">
          {event.category}
        </span>

        <h3 className="text-lg font-bold text-white mb-3 leading-snug group-hover:text-blue-400 transition-colors line-clamp-2">
          {event.title}
        </h3>

        <div className="space-y-1.5 mb-4">
          <div className="flex items-center text-gray-400 text-sm">
            <Calendar className="w-3.5 h-3.5 mr-2 text-gray-500 flex-shrink-0" />
            {event.date}
          </div>
          <div className="flex items-center text-gray-400 text-sm">
            <MapPin className="w-3.5 h-3.5 mr-2 text-gray-500 flex-shrink-0" />
            {event.location}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <div>
            <span className="text-gray-500 text-xs block">From</span>
            <span className="text-white font-bold text-lg">{event.price}</span>
          </div>
          <Link href={`/event/${event.id}`}>
            <button className="bg-white/10 hover:bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-bold transition-all duration-300 border border-white/10 hover:border-blue-600">
              Get Tickets
            </button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
