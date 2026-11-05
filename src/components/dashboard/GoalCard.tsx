"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Target } from "lucide-react"
import { toast } from "sonner"
import { setMonthlyGoalAction } from "@/server/actions/dashboard-tools"

type Goal = { goal: number | null; achieved: number; percent: number | null; daysLeft: number; monthLabel: string }

export function GoalCard({ storeId, currency, goal }: { storeId: string; currency: string; goal: Goal }) {
  const router = useRouter()
  const [editing, setEditing] = useState(goal.goal == null)
  const [value, setValue] = useState(goal.goal?.toString() ?? "")
  const [saving, setSaving] = useState(false)
  const fmt = (n: number) => `${currency} ${n.toLocaleString("en-GB", { maximumFractionDigits: 0 })}`

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const result = await setMonthlyGoalAction(storeId, value === "" ? null : Number(value))
    setSaving(false)
    if ("error" in result) return toast.error(result.error)
    setEditing(false)
    router.refresh()
  }

  const remaining = goal.goal ? Math.max(0, goal.goal - goal.achieved) : 0

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-stone-500">
            <Target className="h-3.5 w-3.5" /> {goal.monthLabel} goal
          </p>
          {goal.goal ? (
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-stone-950">
              {fmt(goal.achieved)} <span className="font-normal text-stone-400">of {fmt(goal.goal)}</span>
            </h2>
          ) : (
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-stone-950">Set a sales goal for this month</h2>
          )}
        </div>
        {!editing && (
          <button onClick={() => setEditing(true)} className="text-sm text-stone-500 underline-offset-4 hover:text-stone-900 hover:underline">
            Change
          </button>
        )}
      </div>

      {goal.goal != null && goal.percent != null && (
        <>
          <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-stone-100">
            <div className="h-full rounded-full bg-stone-900 transition-all" style={{ width: `${goal.percent}%` }} />
          </div>
          <p className="mt-2 text-sm text-stone-500">
            {goal.percent >= 100
              ? "Goal reached. Well done!"
              : `${goal.percent}% there · ${fmt(remaining)} to go · ${goal.daysLeft} day${goal.daysLeft === 1 ? "" : "s"} left`}
          </p>
        </>
      )}

      {editing && (
        <form onSubmit={save} className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-sm text-stone-500">{currency}</span>
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            inputMode="decimal"
            placeholder="e.g. 5000"
            className="h-10 w-36 rounded-lg border border-stone-200 px-3 text-sm"
          />
          <button disabled={saving} className="h-10 rounded-full bg-stone-950 px-5 text-sm font-medium text-white disabled:opacity-60">
            {saving ? "Saving…" : "Save goal"}
          </button>
        </form>
      )}
    </section>
  )
}
