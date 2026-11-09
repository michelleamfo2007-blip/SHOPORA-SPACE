"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Check } from "lucide-react"
import { toast } from "sonner"
import { checkStoreSlugAction, createAnotherStoreAction } from "@/server/actions/new-store"

type Pkg = { name: string; priceMonthly: number; priceYearly: number; description: string; features: readonly string[] }

const toSlug = (raw: string) =>
  raw
    .toLowerCase()
    .replace(/[^a-z0-9-\s]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+/, "")

export function NewStoreForm({ packages, currencies }: { packages: readonly Pkg[]; currencies: string[] }) {
  const router = useRouter()
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [slugEdited, setSlugEdited] = useState(false)
  const [check, setCheck] = useState<{ slug: string; available: boolean; reason: string | null } | null>(null)
  const [currency, setCurrency] = useState("GHS")
  const [interval, setBillingInterval] = useState<"month" | "year">("month")
  const [planName, setPlanName] = useState("Starter")
  const [saving, setSaving] = useState(false)

  const address = slugEdited ? slug : toSlug(name).replace(/-+$/, "")

  useEffect(() => {
    if (!address) return
    let cancelled = false
    const timer = setTimeout(async () => {
      const res = await checkStoreSlugAction(address)
      if (!cancelled) setCheck({ ...res, slug: address })
    }, 400)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [address])

  const checked = check?.slug === address ? check : null

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (checked && !checked.available) return toast.error(checked.reason ?? "That web address is taken.")
    setSaving(true)
    const result = await createAnotherStoreAction({ name, slug: address, planName, interval, currency })
    if ("error" in result) {
      setSaving(false)
      return toast.error(result.error)
    }
    router.push(`/${result.storeId}`)
  }

  const input = "h-11 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm focus:border-stone-400 focus:outline-none"

  return (
    <form onSubmit={submit} className="space-y-6 rounded-2xl border border-stone-200 bg-white p-6">
      <div className="grid gap-2">
        <label className="text-sm font-medium text-stone-700">Store name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} required minLength={2} placeholder="e.g. Ama's Closet" className={input} />
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium text-stone-700">Web address</label>
        <div className="flex items-center rounded-lg border border-stone-200 pl-3 focus-within:border-stone-400">
          <input
            value={address}
            onChange={(e) => {
              setSlugEdited(true)
              setSlug(toSlug(e.target.value))
            }}
            placeholder="amascloset"
            className="h-11 min-w-0 flex-1 bg-transparent text-sm focus:outline-none"
          />
          <span className="pr-3 text-sm text-stone-500">.shopora.space</span>
        </div>
        {address && (
          <p className={`text-xs ${checked ? (checked.available ? "text-emerald-700" : "text-red-600") : "text-stone-500"}`}>
            {checked ? (checked.available ? `${address}.shopora.space is yours` : checked.reason) : "Checking…"}
          </p>
        )}
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium text-stone-700">Currency</label>
        <div className="flex flex-wrap gap-2">
          {currencies.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCurrency(c)}
              className={`rounded-full border px-4 py-1.5 text-sm ${currency === c ? "border-stone-950 bg-stone-950 text-white" : "border-stone-200 text-stone-700"}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-stone-700">Plan for this store</label>
          <div className="flex rounded-full border border-stone-200 p-0.5">
            {(["month", "year"] as const).map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => setBillingInterval(i)}
                className={`rounded-full px-3 py-1 text-xs ${interval === i ? "bg-stone-950 text-white" : "text-stone-600"}`}
              >
                {i === "month" ? "Monthly" : "Yearly"}
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {packages.map((p) => {
            const selected = p.name === planName
            return (
              <button
                key={p.name}
                type="button"
                onClick={() => setPlanName(p.name)}
                className={`rounded-xl border p-4 text-left ${selected ? "border-stone-950 ring-1 ring-stone-950" : "border-stone-200"}`}
              >
                <span className="flex items-center justify-between">
                  <span className="font-semibold text-stone-950">{p.name}</span>
                  {selected && <Check className="h-4 w-4" />}
                </span>
                <span className="mt-1 block text-sm text-stone-500">
                  GHS {(interval === "year" ? p.priceYearly : p.priceMonthly).toLocaleString()}/{interval}
                </span>
              </button>
            )
          })}
        </div>
        <p className="text-xs text-stone-500">Free for the first month, then pay by MoMo or bank transfer under Billing.</p>
      </div>

      <button
        disabled={saving || name.trim().length < 2 || !address}
        className="h-12 w-full rounded-full bg-stone-950 text-sm font-semibold text-white hover:bg-stone-800 disabled:opacity-50"
      >
        {saving ? "Creating…" : "Create store"}
      </button>
    </form>
  )
}
