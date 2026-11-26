export function blackFridayIsLive(store: { blackFridayAccess?: boolean; blackFridayOn?: boolean }) {
  return Boolean(store.blackFridayAccess && store.blackFridayOn)
}

type Priced = {
  price?: number | null
  compareAtPrice?: number | null
  blackFridayPrice?: number | null
}

/** Swap in the Black Friday price for display and checkout. Regular `price` in the database is left alone. */
export function withSalePrice<T extends Priced>(item: T, live: boolean): T {
  if (!live) return item
  const regular = item.price ?? 0
  const sale = item.blackFridayPrice
  if (sale == null || !Number.isFinite(sale) || sale <= 0 || sale >= regular) return item
  return { ...item, price: sale, compareAtPrice: regular }
}

export function withSaleOnProduct<T extends Priced & { variants?: Priced[] }>(product: T, live: boolean): T {
  const priced = withSalePrice(product, live)
  if (!product.variants) return priced
  return { ...priced, variants: product.variants.map((v) => withSalePrice(v, live)) }
}

export function parseSalePrice(value: unknown): { ok: true; value: number | null } | { ok: false } {
  if (value === undefined || value === null || value === "") return { ok: true, value: null }
  const n = Number(value)
  if (!Number.isFinite(n) || n < 0 || n > 10_000_000) return { ok: false }
  if (n === 0) return { ok: true, value: null }
  return { ok: true, value: Math.round(n * 100) / 100 }
}
