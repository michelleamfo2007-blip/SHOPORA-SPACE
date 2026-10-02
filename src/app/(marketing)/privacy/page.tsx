import { Navbar } from "@/components/marketing/navbar"
import { Footer } from "@/components/marketing/footer"

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-950">
      <Navbar />
      <main className="mx-auto max-w-3xl px-5 pb-20 pt-28">
        <h1 className="text-4xl font-semibold tracking-tight">Privacy Policy</h1>
        <div className="mt-8 space-y-8 text-stone-600">
          <p>Last updated: {new Date().toLocaleDateString()}</p>

          <section>
            <h2 className="text-xl font-semibold text-stone-950">1. Information we collect</h2>
            <p className="mt-3 leading-relaxed">
              We collect information you provide directly to us, such as when you create or modify your account,
              request on-demand services, contact customer support, or otherwise communicate with us.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-950">2. Use of information</h2>
            <p className="mt-3 leading-relaxed">
              We may use the information we collect about you to provide, maintain, and improve our services,
              such as to facilitate payments, send receipts, and provide products and services you request.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-950">3. Sharing of information</h2>
            <p className="mt-3 leading-relaxed">
              We do not share personal information with companies, organizations, and individuals outside of Shopora
              unless one of the following circumstances applies: with your consent, for legal reasons, or with domain administrators.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-950">4. Cookies</h2>
            <p className="mt-3 leading-relaxed">
              We use cookies and similar tracking technologies to track the activity on our service and hold certain information.
              You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}
