/** Local (non-AI) product description builder from name + optional details. */

export function buildProductDescription(input: {
  name: string
  price?: string
  currency?: string
  storeName?: string
  optionsHint?: string
  notes?: string
}): string {
  const name = input.name.trim()
  if (!name) return ""

  const notes = input.notes?.trim()
  const options = input.optionsHint?.trim()
  const priceNum = input.price ? Number(input.price) : NaN
  const hasPrice = Number.isFinite(priceNum) && priceNum > 0
  const currency = input.currency || "GHS"
  const store = input.storeName?.trim()

  const lines: string[] = []

  lines.push(
    `Meet ${name}${store ? ` from ${store}` : ""} — a solid pick for everyday wear and gifting in Accra.`
  )

  if (notes) {
    lines.push(notes.endsWith(".") ? notes : `${notes}.`)
  } else {
    lines.push(
      `Soft on details, strong on look: ${name} is made for customers who want something neat, useful, and ready to ship.`
    )
  }

  if (options) {
    lines.push(`Available options: ${options}.`)
  }

  if (hasPrice) {
    lines.push(`Listed at ${currency} ${priceNum.toFixed(2)}. Message the seller if you need size help or same-day Accra delivery.`)
  } else {
    lines.push(`Order now and chat the seller for fit, colour, or delivery questions.`)
  }

  return lines.join("\n\n")
}
