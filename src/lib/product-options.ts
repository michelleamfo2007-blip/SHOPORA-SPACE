/** Validates sizes/colours sent from the mobile app (same shape the web product form uses). */

export type OptionInput = { name: string; values: string[] }
export type VariantRow = { name: string; price: number; stockCount: number }

const MAX_OPTIONS = 3
const MAX_VALUES = 20
const MAX_COMBINATIONS = 100

export function parseOptions(raw: unknown): { options: OptionInput[] } | { error: string } {
  if (!Array.isArray(raw)) return { options: [] }
  const options: OptionInput[] = []
  for (const o of raw as { name?: unknown; values?: unknown }[]) {
    const name = String(o?.name ?? "").trim().slice(0, 40)
    const values = Array.isArray(o?.values)
      ? [...new Set((o.values as unknown[]).map((v) => String(v).trim().slice(0, 40)).filter(Boolean))]
      : []
    if (!name && values.length === 0) continue
    if (!name) return { error: "Give each option a name, e.g. Size or Colour." }
    if (values.length === 0) return { error: `Add at least one choice for ${name}.` }
    if (values.some((v) => v.includes(" / "))) return { error: "Option choices can’t contain “ / ”." }
    if (values.length > MAX_VALUES) return { error: `${name} can have up to ${MAX_VALUES} choices.` }
    options.push({ name, values })
  }
  if (options.length > MAX_OPTIONS) return { error: `Up to ${MAX_OPTIONS} options per product.` }
  const combos = options.reduce((n, o) => n * o.values.length, options.length ? 1 : 0)
  if (combos > MAX_COMBINATIONS) return { error: `That makes ${combos} combinations. Keep it under ${MAX_COMBINATIONS}.` }
  return { options }
}

/** Every combination name, e.g. "M / Black", in the same order the web form generates them. */
export function combinationNames(options: OptionInput[]) {
  return options
    .reduce<string[][]>((acc, o) => (acc.length === 0 ? o.values.map((v) => [v]) : acc.flatMap((c) => o.values.map((v) => [...c, v]))), [])
    .map((combo) => combo.join(" / "))
}

/** Matches the app's per-combination price/stock to the generated names, filling gaps with the base price. */
export function variantRows(options: OptionInput[], raw: unknown, basePrice: number): VariantRow[] {
  const incoming = new Map<string, { price?: unknown; stockCount?: unknown }>()
  if (Array.isArray(raw)) {
    for (const v of raw as { name?: unknown; price?: unknown; stockCount?: unknown }[]) {
      if (typeof v?.name === "string") incoming.set(v.name, v)
    }
  }
  return combinationNames(options).map((name) => {
    const v = incoming.get(name)
    const price = Number(v?.price)
    return {
      name,
      price: Number.isFinite(price) && price > 0 ? price : basePrice,
      stockCount: Math.max(0, Math.floor(Number(v?.stockCount) || 0)),
    }
  })
}

export function optionCreateData(options: OptionInput[]) {
  return options.map((opt, index) => ({
    name: opt.name,
    position: index + 1,
    values: { create: opt.values.map((value) => ({ value })) },
  }))
}
