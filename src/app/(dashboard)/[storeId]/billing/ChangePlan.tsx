"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Check } from "lucide-react"
import { toast } from "sonner"
import { changePlanAction } from "@/server/actions/dashboard-tools"
import { TRIAL_PACKAGES } from "@/lib/plans"

export function ChangePlan({ storeId, currentPlan, interval }: { storeId: string; currentPlan: string; interval: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState<string | null>(null)

  async function choose(name: string) {
    if (name === currentPlan) return
    if (!confirm(`Switch to ${name}? Your next payment will be at the ${name} price.`)) return
    setBusy(name)
    const result = await changePlanAction(storeId, name)
    setBusy(null)
    if ("error" in result) return toast.error(result.error)
    toast.success(`You're now on ${name}`)
    router.refresh()
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {TRIAL_PACKAGES.map((p) => {
        const current = p.name === currentPlan
        const price = interval === "year" ? p.priceYearly : p.priceMonthly
        return (
          <div
            key={p.name}
            className={`flex flex-col rounded-2xl border p-5 ${current ? "border-stone-950 ring-1 ring-stone-950" : "border-stone-200 bg-white"}`}
          >
            <div className="flex items-baseline justify-between">
              <h3 className="text-lg font-semibold text-stone-950">{p.name}</h3>
              <span className="text-sm text-stone-500">
                GHS {price.toLocaleString()} / {interval}
              </span>
            </div>
            <p className="mt-1 text-sm text-stone-500">{p.description}</p>
            <ul className="mt-4 flex-1 space-y-2">
              {p.features.map((f) => (
                <li key={f} className="flex gap-2 text-sm text-stone-700">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-stone-900" /> {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => choose(p.name)}
              disabled={current || busy !== null}
              className={`mt-5 h-10 rounded-full text-sm font-medium ${
                current ? "bg-stone-100 text-stone-500" : "bg-stone-950 text-white hover:bg-stone-800"
              } disabled:opacity-70`}
            >
              {current ? "Your plan" : busy === p.name ? "Switching…" : `Switch to ${p.name}`}
            </button>
          </div>
        )
      })}
    </div>
  )
}
