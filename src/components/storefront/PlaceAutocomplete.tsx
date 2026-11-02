"use client"

import { useEffect, useId, useRef, useState } from "react"
import { searchDeliveryPlacesAction } from "@/server/actions/shopora-delivery"
import type { PlaceSuggestion } from "@/lib/shopora-delivery"

export function PlaceAutocomplete({
  id,
  name,
  value,
  required,
  placeholder,
  className,
  onChange,
  onPlaceSelect,
}: {
  id: string
  name: string
  value: string
  required?: boolean
  placeholder?: string
  className?: string
  onChange: (value: string) => void
  onPlaceSelect?: (place: PlaceSuggestion) => void
}) {
  const listId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([])
  const [highlight, setHighlight] = useState(0)

  useEffect(() => {
    const q = value.trim()
    if (q.length < 2) {
      setSuggestions([])
      setOpen(false)
      return
    }

    let cancelled = false
    const handle = setTimeout(async () => {
      setLoading(true)
      const result = await searchDeliveryPlacesAction(q)
      if (cancelled) return
      setSuggestions(result.suggestions)
      setHighlight(0)
      setOpen(result.suggestions.length > 0)
      setLoading(false)
    }, 280)

    return () => {
      cancelled = true
      clearTimeout(handle)
    }
  }, [value])

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onDocClick)
    return () => document.removeEventListener("mousedown", onDocClick)
  }, [])

  function pick(place: PlaceSuggestion) {
    onChange(place.exactLocation)
    onPlaceSelect?.(place)
    setSuggestions([])
    setOpen(false)
  }

  return (
    <div ref={rootRef} className="relative">
      <input
        id={id}
        name={name}
        required={required}
        autoComplete="off"
        placeholder={placeholder}
        className={className}
        value={value}
        aria-autocomplete="list"
        aria-controls={listId}
        aria-expanded={open}
        role="combobox"
        onChange={(e) => {
          onChange(e.target.value)
          setOpen(true)
        }}
        onFocus={() => {
          if (suggestions.length > 0) setOpen(true)
        }}
        onKeyDown={(e) => {
          if (!open || suggestions.length === 0) return
          if (e.key === "ArrowDown") {
            e.preventDefault()
            setHighlight((h) => (h + 1) % suggestions.length)
          } else if (e.key === "ArrowUp") {
            e.preventDefault()
            setHighlight((h) => (h - 1 + suggestions.length) % suggestions.length)
          } else if (e.key === "Enter" && suggestions[highlight]) {
            e.preventDefault()
            pick(suggestions[highlight])
          } else if (e.key === "Escape") {
            setOpen(false)
          }
        }}
      />
      {loading && (
        <p className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-stone-400">Searching…</p>
      )}
      {open && suggestions.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-30 mt-1 max-h-64 w-full overflow-auto border border-stone-300 bg-white shadow-lg"
        >
          {suggestions.map((place, i) => (
            <li key={place.id} role="option" aria-selected={i === highlight}>
              <button
                type="button"
                className={`block w-full px-4 py-3 text-left text-sm ${
                  i === highlight ? "bg-stone-100 text-stone-900" : "text-stone-700 hover:bg-stone-50"
                }`}
                onMouseEnter={() => setHighlight(i)}
                onClick={() => pick(place)}
              >
                <span className="block font-medium">{place.exactLocation}</span>
                <span className="mt-0.5 block text-xs text-stone-500">{place.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
