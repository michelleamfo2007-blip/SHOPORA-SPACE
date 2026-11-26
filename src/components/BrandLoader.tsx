/** Quiet branded loading screen: mark, name, and a thin bar. */
export function BrandLoader({ fullScreen = true }: { fullScreen?: boolean }) {
  return (
    <div
      className={`flex items-center justify-center overflow-hidden bg-[#12100e] text-[#faf8f5] ${
        fullScreen ? "fixed inset-0 z-[100]" : "relative min-h-[60vh] rounded-2xl"
      }`}
      role="status"
      aria-label="Loading"
    >
      <div className="relative flex flex-col items-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#1c1917] ring-1 ring-white/10">
          <span className="relative font-display text-5xl leading-none">
            S<span className="absolute -right-2.5 bottom-1 h-2 w-2 rounded-full bg-[#c8a165]" />
          </span>
        </div>
        <p className="mt-5 font-display text-2xl tracking-[0.08em]">SHOPORA</p>
        <p className="mt-2 text-[11px] uppercase tracking-[0.28em] text-white/40">Your store in your pocket</p>
        <div className="mt-10 h-px w-24 overflow-hidden bg-white/10">
          <div className="h-full w-1/2 animate-[shopora-load_1.1s_ease-in-out_infinite] bg-[#c8a165]" />
        </div>
      </div>
    </div>
  )
}
