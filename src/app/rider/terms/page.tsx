import Link from "next/link"
import { RIDER_TERMS } from "@/lib/rider-terms"

export default function RiderTermsPage() {
  return (
    <div className="min-h-screen bg-[#faf8f5] px-5 py-14 text-stone-900">
      <div className="mx-auto max-w-2xl">
        <p className="text-[11px] uppercase tracking-[0.2em] text-stone-500">Shopora Delivery</p>
        <h1 className="mt-2 font-display text-4xl">{RIDER_TERMS.title}</h1>
        <p className="mt-2 text-sm text-stone-600">
          Last updated {RIDER_TERMS.updatedLabel} · Version {RIDER_TERMS.version}
        </p>

        <div className="mt-6 border border-stone-900 bg-white px-5 py-4">
          <p className="text-sm font-medium text-stone-900">
            Shopora takes {RIDER_TERMS.cutPercent}% of every delivery fee.
          </p>
          <p className="mt-1 text-sm text-stone-600">
            You collect the full delivery fee from the customer on arrival, keep{" "}
            {100 - RIDER_TERMS.cutPercent}%, and settle Shopora’s {RIDER_TERMS.cutPercent}% cut later
            (usually weekly via MoMo).
          </p>
        </div>

        <div className="mt-10 space-y-8">
          {RIDER_TERMS.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="font-display text-xl">{section.heading}</h2>
              <p className="mt-2 text-sm leading-relaxed text-stone-700">{section.body}</p>
            </section>
          ))}
        </div>

        <p className="mt-12 text-sm text-stone-600">
          Questions? Email{" "}
          <a href="mailto:shoporaspace@gmail.com" className="underline">
            shoporaspace@gmail.com
          </a>
        </p>
        <Link href="/rider/signup" className="mt-6 inline-block text-sm underline">
          Back to rider signup
        </Link>
      </div>
    </div>
  )
}
