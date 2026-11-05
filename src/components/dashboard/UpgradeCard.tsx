import Link from "next/link"
import { Lock } from "lucide-react"
import { PLAN_FEATURES, type PlanFeature } from "@/lib/plan-features"

/** Shown in place of a tool the store's plan doesn't include. */
export function UpgradeCard({ storeId, feature, compact = false }: { storeId: string; feature: PlanFeature; compact?: boolean }) {
  const { label, plan } = PLAN_FEATURES[feature]
  return (
    <div className={`rounded-2xl border border-stone-200 bg-white ${compact ? "p-4" : "p-8 text-center"}`}>
      <div className={`flex ${compact ? "items-center gap-3" : "flex-col items-center gap-3"}`}>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-stone-100">
          <Lock className="h-4 w-4 text-stone-600" />
        </span>
        <div className={compact ? "flex-1" : ""}>
          <p className="font-semibold text-stone-950">{label}</p>
          <p className="text-sm text-stone-500">Included in the {plan} plan{plan === "Professional" ? " and Business" : ""}.</p>
        </div>
        <Link
          href={`/${storeId}/billing`}
          className="inline-flex h-10 items-center rounded-full bg-stone-950 px-5 text-sm font-medium text-white hover:bg-stone-800"
        >
          Upgrade to {plan}
        </Link>
      </div>
    </div>
  )
}
