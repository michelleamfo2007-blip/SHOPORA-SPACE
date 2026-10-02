import { Navbar } from "@/components/marketing/navbar"
import { Footer } from "@/components/marketing/footer"

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-950">
      <Navbar />
      <main className="mx-auto max-w-3xl px-5 pb-20 pt-28">
        <p className="text-sm font-medium text-stone-500">Shopora</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">Contact us</h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-stone-600 md:text-lg">
          Questions about your store, a payment, or getting set up? Write to us and we will reply by email.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl border border-stone-200 bg-white p-6">
            <h2 className="text-sm font-medium text-stone-500">Support</h2>
            <a href="mailto:support@shopora.space" className="mt-2 block text-lg font-semibold">
              support@shopora.space
            </a>
          </div>
          <div className="rounded-3xl border border-stone-200 bg-white p-6">
            <h2 className="text-sm font-medium text-stone-500">Sales</h2>
            <a href="mailto:shoporaspace@gmail.com" className="mt-2 block text-lg font-semibold">
              shoporaspace@gmail.com
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
