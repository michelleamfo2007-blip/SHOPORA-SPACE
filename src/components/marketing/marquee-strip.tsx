const items = [
  "MTN MoMo",
  "Telecel Cash",
  "AT Money",
  "Bank transfer",
  "0% commission",
  "Delivery across Accra",
  "iOS & Android app",
  "Your own domain",
]

export function MarqueeStrip() {
  return (
    <section aria-label="What Shopora includes" className="overflow-hidden border-y border-stone-900/10 py-6">
      <div className="flex w-max animate-marquee motion-reduce:animate-none">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0 items-center" aria-hidden={copy === 1}>
            {items.map((text) => (
              <span key={text} className="flex items-center whitespace-nowrap font-display text-2xl italic text-stone-700 md:text-3xl">
                <span className="px-7 md:px-10">{text}</span>
                <span className="text-sm not-italic text-[#b08a5f]">✦</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </section>
  )
}
