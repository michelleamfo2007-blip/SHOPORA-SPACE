/** wa.me needs the full international number: 024 123 4567 → 233241234567. */
export function toWhatsAppNumber(phone: string | null | undefined) {
  const digits = (phone ?? "").replace(/\D/g, "")
  if (!digits) return null
  if (digits.startsWith("233")) return digits
  if (digits.startsWith("0") && digits.length === 10) return `233${digits.slice(1)}`
  if (digits.length === 9) return `233${digits}`
  return digits
}

type ReminderInput = {
  customerName: string
  storeName: string
  orderNumber: string
  currency: string
  totalAmount: number
  payment?: { mobileMoneyNumber?: string | null; accountName?: string | null; bankName?: string | null; accountNumber?: string | null } | null
}

/** Friendly "you haven't paid yet" message with the store's MoMo or bank details. */
export function paymentReminderMessage(input: ReminderInput) {
  const firstName = input.customerName.trim().split(/\s+/)[0] || "there"
  const amount = `${input.currency} ${input.totalAmount.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  const lines = [
    `Hi ${firstName}, this is ${input.storeName}. Thank you for your order ${input.orderNumber}!`,
    `We haven't received your payment of ${amount} yet.`,
  ]
  const p = input.payment
  if (p?.mobileMoneyNumber) {
    lines.push(`You can pay by Mobile Money to ${p.mobileMoneyNumber}${p.accountName ? ` (${p.accountName})` : ""}.`)
  }
  if (p?.bankName && p.accountNumber) {
    lines.push(`Or bank transfer: ${p.bankName}, ${p.accountNumber}${p.accountName ? `, ${p.accountName}` : ""}.`)
  }
  lines.push(`Please reply with your transaction ID once you've paid so we can send your order.`)
  return lines.join("\n")
}

export function whatsappMessageUrl(phone: string | null | undefined, message: string) {
  const number = toWhatsAppNumber(phone)
  if (!number) return null
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`
}

export function isAwaitingPayment(status: string) {
  return status === "PENDING" || status === "PENDING_VERIFICATION"
}

/** Ready-to-send WhatsApp reminder for an unpaid order, or null if paid / no phone number. */
export function orderPaymentReminder(
  order: { status: string; orderNumber: string; totalAmount: number; customer: { name: string; phone: string | null } },
  store: { name: string; currency: string },
  payment: ReminderInput["payment"]
) {
  if (!isAwaitingPayment(order.status) || !order.customer.phone) return null
  const message = paymentReminderMessage({
    customerName: order.customer.name,
    storeName: store.name,
    orderNumber: order.orderNumber,
    currency: store.currency,
    totalAmount: order.totalAmount,
    payment,
  })
  const url = whatsappMessageUrl(order.customer.phone, message)
  return url ? { message, url } : null
}
