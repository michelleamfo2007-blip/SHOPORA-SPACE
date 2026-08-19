"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Dashboard caught error:", error)
  }, [error])

  return (
    <div className="flex h-full flex-col items-center justify-center p-8 space-y-4 text-center">
      <h2 className="text-2xl font-bold text-red-600">Something went wrong!</h2>
      <div className="p-4 bg-red-50 text-red-800 rounded-md max-w-lg overflow-auto text-left">
        <p className="font-mono text-sm">{error.message || "Unknown error occurred"}</p>
        {error.digest && <p className="text-xs text-red-500 mt-2">Digest: {error.digest}</p>}
      </div>
      <Button onClick={() => reset()}>Try again</Button>
    </div>
  )
}
