"use client"

import { useRouter } from "next/navigation"
import { setRiderStatusAction } from "@/server/actions/rider"

export function RiderStatusButton({
  riderId,
  status,
  label,
}: {
  riderId: string
  status: "ACTIVE" | "SUSPENDED"
  label: string
}) {
  const router = useRouter()
  return (
    <button
      type="button"
      className="text-xs text-slate-500 underline"
      onClick={async () => {
        await setRiderStatusAction(riderId, status)
        router.refresh()
      }}
    >
      {label}
    </button>
  )
}
