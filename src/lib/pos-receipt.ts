/** Shared by the web till and the API (client-safe: no database). */

export const TILL_PAYMENT_METHODS = [
  { value: "CASH", label: "Cash" },
  { value: "MOMO", label: "Mobile Money" },
  { value: "CARD", label: "Card" },
  { value: "BANK", label: "Bank transfer" },
] as const

export type TillPaymentMethod = (typeof TILL_PAYMENT_METHODS)[number]["value"]

export const TILL_PAYMENT_LABELS: Record<string, string> = Object.fromEntries(TILL_PAYMENT_METHODS.map((m) => [m.value, m.label]))

export type Receipt = {
  storeName: string
  storeUrl: string
  orderNumber: string
  createdAt: string
  currency: string
  lines: { name: string; quantity: number; price: number }[]
  total: number
  paymentMethod: string
  amountTendered: number | null
  change: number | null
}

function money(currency: string, n: number) {
  return `${currency} ${n.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/** Plain-text receipt for WhatsApp or SMS. */
export function receiptText(r: Receipt) {
  const date = new Date(r.createdAt).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
  return [
    `*${r.storeName}*`,
    `Receipt ${r.orderNumber} · ${date}`,
    "",
    ...r.lines.map((l) => `${l.quantity} × ${l.name}  ${money(r.currency, l.price * l.quantity)}`),
    "",
    `*Total: ${money(r.currency, r.total)}*`,
    `Paid by ${TILL_PAYMENT_LABELS[r.paymentMethod] ?? r.paymentMethod}`,
    ...(r.amountTendered != null ? [`Received: ${money(r.currency, r.amountTendered)}`] : []),
    ...(r.change != null && r.change > 0 ? [`Change: ${money(r.currency, r.change)}`] : []),
    "",
    `Thank you for shopping with us! Shop online any time: ${r.storeUrl}`,
  ].join("\n")
}
