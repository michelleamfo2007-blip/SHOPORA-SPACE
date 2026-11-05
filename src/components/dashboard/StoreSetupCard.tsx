import Link from "next/link"
import { ArrowRight, Check } from "lucide-react"
import type { StoreSetup, StoreSetupStepKey } from "@/lib/store-setup"

function stepHref(storeId: string, key: StoreSetupStepKey) {
  if (key === "products") return `/${storeId}/products/new`
  if (key === "payments") return `/${storeId}/settings/payments`
  return `/${storeId}/settings`
}

export function StoreSetupCard({ storeId, setup }: { storeId: string; setup: StoreSetup }) {
  if (setup.percent >= 100) return null
  const todo = setup.steps.filter((s) => !s.done)
  const done = setup.steps.filter((s) => s.done)

  return (
    <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
      <div className="flex flex-col gap-4 border-b border-stone-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-stone-500">Store setup</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-stone-950">
            Your store is {setup.percent}% ready
          </h2>
          <p className="mt-1 text-sm text-stone-500">Finish these so your storefront looks complete to customers.</p>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-stone-100 sm:w-48">
          <div className="h-full rounded-full bg-stone-900 transition-all" style={{ width: `${setup.percent}%` }} />
        </div>
      </div>
      <ul className="divide-y divide-stone-100">
        {todo.map((step) => (
          <li key={step.key}>
            <Link
              href={stepHref(storeId, step.key)}
              className="group flex items-center gap-4 px-6 py-3.5 transition-colors hover:bg-stone-50"
            >
              <span className="h-5 w-5 shrink-0 rounded-full border-2 border-stone-300" />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-stone-900">{step.label}</span>
                <span className="block text-xs text-stone-500">{step.hint}</span>
              </span>
              <ArrowRight className="h-4 w-4 text-stone-400 transition-transform group-hover:translate-x-0.5 group-hover:text-stone-900" />
            </Link>
          </li>
        ))}
        {done.map((step) => (
          <li key={step.key} className="flex items-center gap-4 px-6 py-3 text-sm text-stone-400">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-stone-900 text-white">
              <Check className="h-3 w-3" strokeWidth={3} />
            </span>
            <span className="line-through decoration-stone-300">{step.label}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
