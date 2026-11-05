/** Branded loading screen: the Shopora mark on ink, with slow gold rings and a moving bar. */
export function BrandLoader({ fullScreen = true }: { fullScreen?: boolean }) {
  return (
    <div
      className={`flex items-center justify-center overflow-hidden bg-[#1c1917] text-[#faf8f5] ${
        fullScreen ? "fixed inset-0 z-[100]" : "relative min-h-[60vh] rounded-2xl"
      }`}
      role="status"
      aria-label="Loading"
    >
      <div className="pointer-events-none absolute h-80 w-80 rounded-full bg-[#c8a165] opacity-[0.08] blur-2xl" />
      <div className="pointer-events-none absolute h-[26rem] w-[26rem] animate-[spin_18s_linear_infinite] rounded-full border border-[#c8a165]/25">
        <span className="absolute -top-1.5 left-1/2 h-3 w-3 rounded-full bg-[#c8a165]" />
      </div>
      <div className="pointer-events-none absolute h-72 w-72 animate-[spin_24s_linear_infinite_reverse] rounded-full border border-white/10">
        <span className="absolute -bottom-1.5 right-1/3 h-3 w-3 rounded-full bg-[#d97706]" />
      </div>
      <div className="pointer-events-none absolute -right-24 -top-28 h-64 w-64 rounded-full border border-[#c8a165]/15" />
      <div className="pointer-events-none absolute -bottom-40 -left-36 h-80 w-80 rounded-full border border-white/[0.07]" />

      <div className="relative flex flex-col items-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-[1.6rem] bg-[#12100e] shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)] ring-1 ring-white/10">
          <span className="relative font-display text-6xl leading-none">
            S<span className="absolute -right-3 bottom-1.5 h-2.5 w-2.5 rounded-full bg-[#d97706]" />
          </span>
        </div>
        <p className="mt-6 font-display text-3xl tracking-wide">Shopora</p>
        <p className="mt-1 font-display text-sm italic text-[#c8a165]">Your shop, beautifully run.</p>
        <div className="mt-10 h-0.5 w-28 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-1/2 animate-[shopora-load_1.1s_ease-in-out_infinite] rounded-full bg-[#c8a165]" />
        </div>
      </div>
    </div>
  )
}
