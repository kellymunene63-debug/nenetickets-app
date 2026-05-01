import { Suspense } from "react";
import type { Metadata } from "next";
import Navbar from "../../components/shared/Navbar";
import EventsClient from "../../components/events/EventsClient";
import { DEFAULT_EVENTS } from "../../libs/events";

export const metadata: Metadata = {
  title: "Browse Events",
  description: "Discover and book tickets for the best concerts, sports matches, and conferences in Kenya.",
};

function EventsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[1,2,3,4,5,6].map(i => (
        <div key={i} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden animate-pulse">
          <div className="h-48 bg-white/10" />
          <div className="p-5 space-y-3">
            <div className="h-3 bg-white/10 rounded w-1/4" />
            <div className="h-5 bg-white/10 rounded w-3/4" />
            <div className="h-3 bg-white/10 rounded w-1/2" />
            <div className="h-3 bg-white/10 rounded w-1/3" />
            <div className="h-10 bg-white/10 rounded-lg mt-4" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AllEventsPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      <Suspense fallback={
        <div className="container mx-auto px-4 pt-32 pb-20">
          <div className="h-8 bg-white/10 rounded w-48 mb-10 animate-pulse" />
          <EventsSkeleton />
        </div>
      }>
        <EventsClient defaultEvents={DEFAULT_EVENTS} />
      </Suspense>
    </main>
  );
}
