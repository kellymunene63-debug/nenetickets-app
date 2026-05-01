export default function Loading() {
  return (
    <div className="fixed inset-0 bg-[#050511] flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-6">
        {/* Animated logo */}
        <div className="relative">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-600/40">
            <svg
              className="w-7 h-7 text-white -rotate-45"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
              />
            </svg>
          </div>
          <div className="absolute inset-0 rounded-2xl bg-blue-600/30 animate-ping" />
        </div>

        {/* Spinning ring */}
        <div className="w-10 h-10 border-2 border-white/10 border-t-blue-500 rounded-full animate-spin" />

        <p className="text-gray-500 text-sm font-bold tracking-widest uppercase">Loading</p>
      </div>
    </div>
  );
}
