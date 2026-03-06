const EmptyChatContainer = () => {
  return (
    <div className="flex-1 md:bg-[#1c1d25] md:flex flex-col justify-center items-center hidden transition-all duration-1000 relative overflow-hidden">

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-violet-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-indigo-900/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-purple-900/5 rounded-full blur-[80px]" />
      </div>

      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(rgba(139,92,246,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.8) 1px, transparent 1px)",
          backgroundSize: "40px 40px"
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-8 px-10 text-center max-w-lg">

        <div className="relative">
          <div className="absolute -inset-4 rounded-[32px] bg-gradient-to-br from-violet-500/15 to-indigo-500/15 blur-2xl animate-pulse" />

          <div
            className="relative w-24 h-24 rounded-[24px] flex items-center justify-center shadow-2xl"
            style={{ background: "linear-gradient(145deg, #3b1fa3 0%, #1e1b4b 100%)" }}
          >
            <div className="absolute inset-0 rounded-[24px] bg-gradient-to-b from-white/20 to-transparent" />
            <div className="absolute inset-0 rounded-[24px] border border-white/10" />

    
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="6" y="8" width="36" height="26" rx="8" fill="white" fillOpacity="0.1"/>
              <rect x="6" y="8" width="36" height="26" rx="8" stroke="white" strokeOpacity="0.3" strokeWidth="1.5"/>
              <path d="M15 28V18L22 27V18" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 27V18L29 28V18" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.6"/>
              <path d="M14 34L10 42L20 36" fill="white" fillOpacity="0.15"/>
              <path d="M14 34L10 42L20 36" stroke="white" strokeOpacity="0.25" strokeWidth="1.5" strokeLinejoin="round"/>
              <circle cx="36" cy="13" r="5" fill="#7c3aed"/>
              <circle cx="36" cy="13" r="3" fill="#a78bfa"/>
            </svg>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="h-px w-10 bg-gradient-to-r from-transparent to-violet-500/40" />
            <span className="text-violet-400/50 text-[11px] uppercase tracking-[0.25em] font-semibold">
              Welcome to
            </span>
            <div className="h-px w-10 bg-gradient-to-l from-transparent to-violet-500/40" />
          </div>

          <h1 className="text-5xl lg:text-6xl font-bold tracking-[-1px] leading-none">
            <span className="text-white">Nex</span>
            <span style={{ background: "linear-gradient(135deg, #a78bfa, #6366f1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Chat
            </span>
          </h1>

          <p className="text-white/25 text-sm leading-relaxed max-w-[260px] mt-1">
            Select a conversation from the sidebar or start a new one to begin
          </p>
        </div>

        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />

        {/* Feature pills */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {[
            { icon: "🔒", label: "End-to-end encrypted" },
            { icon: "⚡", label: "Real-time" },
            { icon: "📎", label: "File sharing" },
            { icon: "🌐", label: "Cross-platform" },
          ].map(({ icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-1.5 text-[11px] text-white/35 bg-white/[0.04] border border-white/[0.07] px-3 py-1.5 rounded-full hover:bg-white/[0.07] hover:text-white/50 transition-all duration-200 cursor-default"
            >
              <span className="text-xs">{icon}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}

export default EmptyChatContainer