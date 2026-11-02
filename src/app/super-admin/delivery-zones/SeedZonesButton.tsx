"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { seedDefaultDeliveryZonesAction } from "@/server/actions/delivery-zones"
import { toast } from "sonner"

export function SeedZonesButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  return (
    <button
      type="button"
      disabled={loading}
      className="h-10 rounded-xl bg-slate-900 px-5 text-sm font-bold text-white disabled:opacity-60"
      onClick={async () => {
        setLoading(true)
        const result = await seedDefaultDeliveryZonesAction()
        setLoading(false)
        if (result.error) toast.error(result.error)
        else {
          toast.success(`Added ${result.count} Accra zones`)
          router.refresh()
        }
      }}
    >
      {loading ? "Seeding…" : "Seed Accra default zones"}
    </button>
  )
}
