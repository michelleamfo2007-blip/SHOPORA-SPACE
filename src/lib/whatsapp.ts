import { toWhatsAppNumber } from "@/lib/payment-reminder"

/**
 * Sends WhatsApp messages through Meta's WhatsApp Business Platform (Cloud API).
 * Nothing is sent until these are set in the environment (Vercel → Settings → Environment Variables):
 *   WHATSAPP_ACCESS_TOKEN      permanent system-user token from Meta Business
 *   WHATSAPP_PHONE_NUMBER_ID   the Shopora sender number's ID
 *   WHATSAPP_ORDER_TEMPLATE    approved template name (default "new_order_alert")
 *   WHATSAPP_TEMPLATE_LANG     template language code (default "en")
 */
const API_VERSION = process.env.WHATSAPP_API_VERSION || "v21.0"

export function isWhatsAppConfigured() {
  return !!(process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID)
}

async function sendTemplate(to: string, template: string, params: string[]) {
  const res = await fetch(`https://graph.facebook.com/${API_VERSION}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "template",
      template: {
        name: template,
        language: { code: process.env.WHATSAPP_TEMPLATE_LANG || "en" },
        components: [{ type: "body", parameters: params.map((text) => ({ type: "text", text: text.slice(0, 200) })) }],
      },
    }),
  })
  if (!res.ok) throw new Error(`WhatsApp API ${res.status}: ${await res.text().catch(() => "")}`)
}

/**
 * "New order" alert to the seller. The approved template body must have 4 variables, e.g.:
 * "New order {{1}} for {{2}}: {{3}} from {{4}}. Open Shopora to check the payment and confirm it."
 */
export async function sendOrderAlertOnWhatsApp(input: {
  sellerPhone: string | null | undefined
  orderNumber: string
  storeName: string
  amount: string
  customerName: string
}) {
  if (!isWhatsAppConfigured()) return { skipped: "not-configured" as const }
  const to = toWhatsAppNumber(input.sellerPhone)
  if (!to) return { skipped: "no-number" as const }
  try {
    await sendTemplate(to, process.env.WHATSAPP_ORDER_TEMPLATE || "new_order_alert", [
      input.orderNumber,
      input.storeName,
      input.amount,
      input.customerName,
    ])
    return { sent: true as const }
  } catch (err) {
    console.error("WhatsApp order alert failed", err)
    return { error: "send-failed" as const }
  }
}
