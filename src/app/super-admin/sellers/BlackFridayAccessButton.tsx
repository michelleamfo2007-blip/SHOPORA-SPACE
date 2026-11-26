"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { setStoreBlackFridayAccessAction } from "@/server/actions/super-admin"

export function BlackFridayAccessButton({ storeId, granted }: { storeId: string; granted: boolean }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  async function run() {
    setBusy(true)
    const result = await setStoreBlackFridayAccessAction(storeId, !granted)
    setBusy(false)
    if ("error" in result) return toast.error(result.error)
    toast.success(granted ? "Black Friday access removed." : "This store can now run a Black Friday sale.")
    router.refresh()
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={busy}
      onClick={run}
      className={granted ? "font-semibold" : "font-semibold border-stone-900 text-stone-900"}
    >
      {busy ? "…" : granted ? "Revoke Black Friday" : "Grant Black Friday"}
    </Button>
  )
}
