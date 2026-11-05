import { CheckCircle2 } from "lucide-react"
import { LAUNCH_CHECKLIST, SELLER_GUIDE } from "@/lib/seller-guide"

export default function GuidePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-10">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-stone-950">Seller guide</h1>
        <p className="mt-1 text-stone-500">Everything you need to set up, sell and grow on Shopora.</p>
      </div>

      {SELLER_GUIDE.map((section) => (
        <section key={section.title} className="rounded-2xl border border-stone-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-stone-950">{section.title}</h2>
          {section.items && (
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-stone-700">
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
          {section.body && <p className="mt-3 text-sm leading-relaxed text-stone-700">{section.body}</p>}
          {section.tip && (
            <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <strong>Tip:</strong> {section.tip}
            </p>
          )}
        </section>
      ))}

      <section className="rounded-2xl border border-stone-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-stone-950">Before you launch</h2>
        <ul className="mt-3 space-y-2">
          {LAUNCH_CHECKLIST.map((item) => (
            <li key={item} className="flex items-center gap-2 text-sm text-stone-700">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-stone-900" />
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl bg-stone-950 p-8 text-center text-white">
        <p className="text-xl font-semibold">Need help?</p>
        <p className="mt-2 text-sm text-stone-300">
          Open a ticket under Support, or email shoporaspace@gmail.com. We&apos;re here to help you sell.
        </p>
      </section>
    </div>
  )
}
