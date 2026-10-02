import { Navbar } from "@/components/marketing/navbar"
import { Footer } from "@/components/marketing/footer"

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-950">
      <Navbar />
      <main className="mx-auto max-w-3xl px-5 pb-20 pt-28">
        <h1 className="text-4xl font-semibold tracking-tight">Terms of Service</h1>
        <div className="mt-8 space-y-8 text-stone-600">
          <p>Last updated: {new Date().toLocaleDateString()}</p>

          <section>
            <h2 className="text-xl font-semibold text-stone-950">1. Acceptance of terms</h2>
            <p className="mt-3 leading-relaxed">
              By accessing or using the Shopora platform, you agree to be bound by these terms.
              If you disagree with any part of the terms, you may not access the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-950">2. Description of service</h2>
            <p className="mt-3 leading-relaxed">
              Shopora provides an e-commerce platform that enables merchants to build storefronts
              and sell products or services online.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-950">3. User accounts</h2>
            <p className="mt-3 leading-relaxed">
              When you create an account with us, you must provide information that is accurate, complete,
              and current at all times. Failure to do so constitutes a breach of the terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-950">4. Merchant responsibilities</h2>
            <p className="mt-3 leading-relaxed">
              You are responsible for all activity that occurs under your account. You must not transmit any worms
              or viruses or any code of a destructive nature. You are responsible for the goods and services you sell.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}
