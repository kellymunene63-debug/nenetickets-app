"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import EventCard from "../home/EventCard";
import Link from "next/link";
import { Filter, Search, SlidersHorizontal, X, ChevronDown, Calendar, MapPin, Zap } from "lucide-react";
import type { Event } from "../../libs/events";

const CATEGORIES = ["All", "Music", "Sports", "Business", "Arts", "Tech", "Nightlife", "Adventure"];

type SortKey = "date-asc" | "date-desc" | "price-asc" | "price-desc";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "date-asc", label: "Date: Soonest First" },
  { value: "date-desc", label: "Date: Latest First" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
];

function parsePrice(priceStr: string): number {
  if (!priceStr || priceStr.toLowerCase() === "free") return 0;
  const num = parseInt(priceStr.replace(/[^0-9]/g, ""), 10);
  return isNaN(num) ? 0 : num;
}

function parseDate(dateStr: string): number {
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? 0 : d.getTime();
}

export default function EventsClient({ defaultEvents }: { defaultEvents: Event[] }) {
  const searchParams = useSearchParams();

  const initialSearch = searchParams.get("search") || "";
  const initialCategory = searchParams.get("category") || "All";

  const [allEvents, setAllEvents] = useState(defaultEvents);
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [sortKey, setSortKey] = useState<SortKey>("date-asc");
  const [showFilters, setShowFilters] = useState(false);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [sortOpen, setSortOpen] = useState(false);

  // Events (including user-created ones) are now fetched server-side in
  // app/events/page.tsx and passed in as defaultEvents — no client fetch needed.

  const maxPossiblePrice = useMemo(() => {
    const prices = allEvents.map((e) => parsePrice(e.price));
    return Math.max(...prices, 10000);
  }, [allEvents]);

  const filteredAndSorted = useMemo(() => {
    let result = allEvents.filter((event) => {
      const matchesCategory = activeCategory === "All" || event.category === activeCategory;
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        !query ||
        event.title.toLowerCase().includes(query) ||
        event.location.toLowerCase().includes(query) ||
        event.category.toLowerCase().includes(query);
      const price = parsePrice(event.price);
      const matchesPrice = price <= maxPrice;
      return matchesCategory && matchesSearch && matchesPrice;
    });

    result = [...result].sort((a, b) => {
      switch (sortKey) {
        case "date-asc":  return parseDate(a.date) - parseDate(b.date);
        case "date-desc": return parseDate(b.date) - parseDate(a.date);
        case "price-asc": return parsePrice(a.price) - parsePrice(b.price);
        case "price-desc": return parsePrice(b.price) - parsePrice(a.price);
        default: return 0;
      }
    });

    return result;
  }, [allEvents, activeCategory, searchQuery, sortKey, maxPrice]);

  const hasActiveFilters = activeCategory !== "All" || searchQuery || maxPrice < maxPossiblePrice;
  const activeSortLabel = SORT_OPTIONS.find((o) => o.value === sortKey)?.label ?? "Sort";

  const clearAll = () => {
    setActiveCategory("All");
    setSearchQuery("");
    setMaxPrice(maxPossiblePrice);
  };

  // Featured = first event with highest aiTag priority (selling fast / high demand)
  const featuredEvent = useMemo(() => {
    const priority = ["Selling Fast", "High Demand", "Trending", "Must Attend"];
    for (const keyword of priority) {
      const match = allEvents.find((e) => e.aiTag.includes(keyword));
      if (match) return match;
    }
    return allEvents[0] ?? null;
  }, [allEvents]);

  return (
    <div className="container mx-auto px-4 pt-32 pb-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-8 text-sm text-gray-500 font-bold uppercase tracking-wider">
        <Link href="/" className="hover:text-white transition">Home</Link>
        <span>/</span>
        <span className="text-white">All Events</span>
      </div>

      {/* Featured event banner */}
      {featuredEvent && !searchQuery && activeCategory === "All" && (
        <Link href={`/event/${featuredEvent.id}`}>
          <div className="relative rounded-3xl overflow-hidden mb-12 group cursor-pointer h-64 md:h-80">
            {/* Image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={featuredEvent.image}
              alt={featuredEvent.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />

            {/* Content */}
            <div className="absolute inset-0 flex flex-col justify-end p-7 md:p-10">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-blue-600 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <Zap className="w-3 h-3" /> Featured Event
                </span>
                <span className="bg-white/10 backdrop-blur-sm border border-white/10 text-white text-xs font-bold px-3 py-1 rounded-full">
                  {featuredEvent.aiTag}
                </span>
              </div>
              <h2 className="text-2xl md:text-4xl font-bold text-white mb-3 max-w-xl leading-tight group-hover:text-blue-400 transition-colors">
                {featuredEvent.title}
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-blue-400" /> {featuredEvent.date}</span>
                <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-pink-400" /> {featuredEvent.location}</span>
                <span className="bg-white/10 px-3 py-1 rounded-full font-bold">{featuredEvent.price}</span>
              </div>
            </div>
          </div>
        </Link>
      )}

      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3">Discover Events</h1>
          <p className="text-gray-400 max-w-xl">
            {filteredAndSorted.length} event{filteredAndSorted.length !== 1 ? "s" : ""} found in Kenya
          </p>
        </div>

        {/* Search */}
        <div className="w-full xl:w-96 relative group">
          <input
            type="text"
            placeholder="Search events, artists or venues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-11 pr-10 text-white placeholder-gray-500 outline-none focus:border-blue-500 focus:bg-black transition"
          />
          <Search className="w-4 h-4 text-gray-500 absolute left-4 top-4 group-focus-within:text-blue-400 transition" />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-4 top-4 text-gray-500 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Category pills + Sort + Filter toggle */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-bold border transition ${
                activeCategory === cat
                  ? "bg-white text-black border-white"
                  : "bg-transparent text-gray-400 border-white/10 hover:border-white/30 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}

          <div className="ml-auto flex items-center gap-2">
            {/* Sort dropdown */}
            <div className="relative">
              <button
                onClick={() => setSortOpen(!sortOpen)}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border border-white/10 text-gray-400 hover:text-white hover:border-white/30 transition bg-transparent"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                {activeSortLabel}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${sortOpen ? "rotate-180" : ""}`} />
              </button>
              {sortOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-[#0a0a1a] border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => { setSortKey(opt.value); setSortOpen(false); }}
                      className={`w-full text-left px-4 py-3 text-sm font-bold transition ${
                        sortKey === opt.value
                          ? "bg-blue-600/20 text-blue-400"
                          : "text-gray-400 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border transition ${
                showFilters || maxPrice < maxPossiblePrice
                  ? "bg-blue-600 text-white border-blue-600"
                  : "border-white/10 text-gray-400 hover:text-white hover:border-white/30"
              }`}
            >
              <Filter className="w-3.5 h-3.5" /> Filters
              {maxPrice < maxPossiblePrice && (
                <span className="bg-white text-blue-600 text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">1</span>
              )}
            </button>
          </div>
        </div>

        {/* Expanded filter panel */}
        {showFilters && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm">Price Range</h3>
              <span className="text-blue-400 text-sm font-bold">
                Free – KES {maxPrice.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={maxPossiblePrice}
              step={500}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-blue-500"
            />
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>Free</span>
              <span>KES {maxPossiblePrice.toLocaleString()}</span>
            </div>
          </div>
        )}
      </div>

      {/* Active filters bar */}
      {hasActiveFilters && (
        <div className="flex items-center gap-3 mb-6 text-sm border-b border-white/5 pb-5">
          <Filter className="w-4 h-4 text-blue-400 flex-shrink-0" />
          <span className="text-gray-400">
            <span className="text-white font-bold">{filteredAndSorted.length}</span> result{filteredAndSorted.length !== 1 ? "s" : ""}
            {activeCategory !== "All" && <span> in <strong className="text-white">{activeCategory}</strong></span>}
            {searchQuery && <span> matching <strong className="text-white">&quot;{searchQuery}&quot;</strong></span>}
            {maxPrice < maxPossiblePrice && <span> under <strong className="text-white">KES {maxPrice.toLocaleString()}</strong></span>}
          </span>
          <button
            onClick={clearAll}
            className="ml-auto text-blue-400 hover:text-white text-xs font-bold underline decoration-dashed transition"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Grid */}
      <section className="pb-20">
        {filteredAndSorted.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredAndSorted.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="py-24 text-center border border-white/10 rounded-3xl bg-white/5 flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4 text-3xl">🔍</div>
            <h3 className="text-xl font-bold mb-2">No events found</h3>
            <p className="text-gray-400 mb-6 max-w-md">
              Try adjusting your search or filters.
            </p>
            <button
              onClick={clearAll}
              className="bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition"
            >
              Clear Filters
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
