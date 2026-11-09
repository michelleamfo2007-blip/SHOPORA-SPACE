"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { Check, ChevronsUpDown, Plus } from "lucide-react"

type StoreOption = { id: string; name: string; logoUrl: string | null; role: string }

/** Lets a seller with several stores jump between them without logging out. */
export function StoreSwitcher({ currentId, stores }: { currentId: string; stores: StoreOption[] }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const current = stores.find((s) => s.id === currentId) ?? stores[0]

  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", close)
    return () => document.removeEventListener("mousedown", close)
  }, [open])

  return (
    <div ref={ref} className="relative min-w-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full min-w-0 items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-stone-100"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <StoreMark store={current} />
        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-stone-950">{current?.name}</span>
        <ChevronsUpDown className="h-4 w-4 shrink-0 text-stone-400" />
      </button>

      {open && (
        <div className="absolute left-0 z-50 mt-1 w-64 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-lg">
          <p className="px-3 pb-1 pt-2.5 text-[11px] font-medium uppercase tracking-wider text-stone-400">Your stores</p>
          <ul className="max-h-72 overflow-y-auto py-1">
            {stores.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/${s.id}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-stone-50"
                >
                  <StoreMark store={s} />
                  <span className="min-w-0 flex-1 truncate text-stone-900">{s.name}</span>
                  {s.role !== "OWNER" && <span className="text-[10px] uppercase text-stone-400">{s.role.toLowerCase()}</span>}
                  {s.id === currentId && <Check className="h-4 w-4 text-stone-900" />}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/new-store"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 border-t border-stone-100 px-3 py-2.5 text-sm font-medium text-stone-900 hover:bg-stone-50"
          >
            <Plus className="h-4 w-4" /> Create another store
          </Link>
        </div>
      )}
    </div>
  )
}

function StoreMark({ store }: { store?: StoreOption }) {
  if (store?.logoUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={store.logoUrl} alt="" className="h-6 w-6 shrink-0 rounded-md object-cover" />
  }
  return (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-stone-900 text-[11px] font-semibold text-white">
      {store?.name.slice(0, 1).toUpperCase() ?? "S"}
    </span>
  )
}
