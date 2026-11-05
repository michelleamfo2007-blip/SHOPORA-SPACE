import { Navbar } from "@/components/marketing/navbar"
import { Footer } from "@/components/marketing/footer"

/** Shopora's own legal pages (terms, privacy) in the landing page style. */
export function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f6f2ea] text-[#12100e] lining-nums">
      <Navbar />
      <main className="mx-auto max-w-3xl px-5 pb-24 pt-32 md:pt-40">
        <p className="text-[11px] uppercase tracking-[0.32em] text-stone-500">Legal</p>
        <h1 className="mt-5 font-display text-5xl leading-[0.95] tracking-[-0.02em] md:text-7xl">{title}</h1>
        <p className="mt-5 text-sm text-stone-500">Last updated: {new Date().toLocaleDateString()}</p>
        <div className="mt-12 divide-y divide-stone-900/10 border-y border-stone-900/10">{children}</div>
      </main>
      <Footer />
    </div>
  )
}
