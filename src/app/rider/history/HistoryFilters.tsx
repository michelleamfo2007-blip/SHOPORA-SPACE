"use client"

import { useRouter, useSearchParams } from "next/navigation"

const FILTERS = [
  { value: "ALL", label: "All" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "FAILED", label: "Failed" },
  { value: "CANCELLED", label: "Cancelled" },
] as const

export function HistoryFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const raw = (searchParams.get("status") || "ALL").toUpperCase()
  const active =
    raw === "DELIVERED" || raw === "FAILED" || raw === "CANCELLED" ? raw : "ALL"

  function go(value: string) {
    const href = value === "ALL" ? "/rider/history" : `/rider/history?status=${value}`
    router.push(href)
    router.refresh()
  }

  return (
    <div className="flex flex-wrap gap-2">
      {FILTERS.map((f) => (
        <button
          key={f.value}
          type="button"
          onClick={() => go(f.value)}
          className={`inline-flex h-9 items-center rounded-full px-4 text-xs font-medium ${
            active === f.value ? "bg-stone-900 text-white" : "border border-stone-300 text-stone-700"
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  )
}
