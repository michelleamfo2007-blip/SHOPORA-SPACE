/** Starting points for a seller's own policies. Shown on the storefront until the seller writes their own. */

type PolicyStore = { name: string; contactEmail?: string | null; whatsappNumber?: string | null }

function contactLine(store: PolicyStore) {
  const ways = [store.whatsappNumber && `WhatsApp ${store.whatsappNumber}`, store.contactEmail && `email ${store.contactEmail}`].filter(Boolean)
  return ways.length ? `contact us on ${ways.join(" or ")}` : "contact us using the details on this website"
}

export function defaultPrivacyPolicy(store: PolicyStore) {
  return `${store.name} respects your privacy. This policy explains what we collect when you shop with us and how we use it.

What we collect
When you place an order we collect your name, email address, phone number, delivery address and, if you choose to share it, your delivery map pin. We also keep a record of what you ordered and the payment reference you give us.

How we use it
We use your details only to confirm and deliver your order, check your payment, send you order updates, and help if you have a question. We do not sell your information or use it for unrelated marketing.

Who we share it with
Our online store runs on Shopora (shopora.space), which stores your order securely for us. If your order is delivered by a Shopora rider, the rider receives your name, phone number and delivery details to bring your order to you. Payments are made directly to us by Mobile Money or bank transfer.

How long we keep it
We keep order records for as long as we need them for our business and legal records.

Your choices
You can ask us what information we hold about you, or ask us to correct or delete it. To do this, ${contactLine(store)}.`
}

export function defaultReturnPolicy(store: PolicyStore) {
  return `Returns for ${store.name} are handled by our team. Please ${contactLine(store)} before you send anything back, with your order reference.

Wrong or damaged item?
Message us as soon as your order arrives, with your order reference and a photo of the item, and we'll sort it out.

How refunds are paid
If we agree to a refund, we send it back the way you paid: Mobile Money or bank transfer.`
}
