"use server"

import { db } from "@/lib/db"

import { resend } from "@/lib/resend"
import { isSubscriptionLapsed } from "@/lib/subscription"
import { DEFAULT_VARIANT_NAME } from "@/lib/product-variants"
import { NewOrderEmail } from "@/emails/NewOrderEmail"
import { OrderReceivedEmail } from "@/emails/OrderReceivedEmail"

const variantSelect = { id: true, price: true, name: true, product: { select: { name: true } } } as const

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!)
}

export async function processCheckoutAction(formData: FormData) {
  const storeId = formData.get("storeId") as string
  const email = formData.get("email") as string
  const phone = formData.get("phone") as string
  const firstName = formData.get("firstName") as string
  const lastName = formData.get("lastName") as string
  const exactLocation = formData.get("exactLocation") as string
  const city = formData.get("city") as string
  const country = formData.get("country") as string
  const reference = formData.get("paymentReference") as string
  const cartDataStr = formData.get("cartData") as string

  if (!storeId || !email || !phone || !firstName || !lastName || !exactLocation || !cartDataStr || !reference) {
    return { error: "Please fill in all the required fields." }
  }

  const store = await db.store.findUnique({ 
    where: { id: storeId },
    include: { members: { include: { user: true } }, subscription: true }
  })
  if (!store) return { error: "Store not found." }
  if (isSubscriptionLapsed(store.subscription)) return { error: "This store is not taking orders right now." }

  let requestedItems: Array<{ variantId: string; quantity: number }>
  try {
    requestedItems = (JSON.parse(cartDataStr) as Array<{ variantId: string; quantity: number }>).map((item) => ({
      variantId: String(item.variantId),
      quantity: Math.floor(Number(item.quantity)),
    }))
  } catch {
    return { error: "Your cart could not be read. Please refresh the page and try again." }
  }

  if (requestedItems.length === 0) return { error: "Your cart is empty." }
  if (requestedItems.some((item) => !Number.isFinite(item.quantity) || item.quantity < 1 || item.quantity > 1000)) {
    return { error: "One of the quantities in your cart is not valid." }
  }

  // Prices always come from the database, never from the browser.
  const requestedIds = [...new Set(requestedItems.map((item) => item.variantId))]
  const variants = await db.productVariant.findMany({
    where: { id: { in: requestedIds }, product: { storeId } },
    select: variantSelect,
  })
  const resolved = new Map(variants.map((v) => [v.id, v]))

  // Older carts stored the product id for products that had no variant yet.
  const unresolvedIds = requestedIds.filter((id) => !resolved.has(id))
  if (unresolvedIds.length > 0) {
    const products = await db.product.findMany({
      where: { id: { in: unresolvedIds }, storeId },
      select: { id: true, variants: { select: variantSelect, take: 1 } },
    })
    for (const product of products) {
      if (product.variants[0]) resolved.set(product.id, product.variants[0])
    }
  }

  if (requestedIds.some((id) => !resolved.has(id))) {
    return { error: "Some items in your cart are no longer available. Please remove them and try again." }
  }

  const lineItems = new Map<string, { variantId: string; name: string; quantity: number; price: number }>()
  for (const item of requestedItems) {
    const variant = resolved.get(item.variantId)!
    const existing = lineItems.get(variant.id)
    if (existing) existing.quantity += item.quantity
    else
      lineItems.set(variant.id, {
        variantId: variant.id,
        name: variant.name && variant.name !== DEFAULT_VARIANT_NAME ? `${variant.product.name} (${variant.name})` : variant.product.name,
        quantity: item.quantity,
        price: variant.price,
      })
  }
  const cartItems = [...lineItems.values()]

  const totalAmount = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0)

  // 1. Find or Create Customer
  let customer = await db.customer.findFirst({
    where: { storeId, email }
  })

  if (!customer) {
    customer = await db.customer.create({
      data: {
        storeId,
        email,
        name: `${firstName} ${lastName}`,
        phone: phone
      }
    })
  }

  // 2. Create Order with PENDING_VERIFICATION status
  const orderNumber = `ORD-${Date.now().toString().slice(-6)}`
  const order = await db.order.create({
    data: {
      storeId,
      customerId: customer.id,
      orderNumber,
      totalAmount,
      status: "PENDING_VERIFICATION", 
      shippingAddress: `${exactLocation}, ${city}, ${country}`,
      orderItems: {
        create: cartItems.map(item => ({
          variantId: item.variantId,
          quantity: item.quantity,
          price: item.price
        }))
      },
      payments: {
        create: {
          provider: "MANUAL_TRANSFER",
          status: "PENDING_VERIFICATION",
          amount: totalAmount,
          reference: reference
        }
      }
    }
  })

  // 3. Send Notifications
  try {
    const emailPromises = []
    
    const totalLabel = `${store.currency} ${totalAmount.toFixed(2)}`
    const fromName = store.name.replace(/[<>"\\,;:@]/g, "").trim() || "Shopora"
    const emailItems = cartItems.map(({ name, quantity, price }) => ({ name, quantity, price }))
    const shippingAddress = order.shippingAddress ?? `${exactLocation}, ${city}, ${country}`
    const storeReplyTo = store.contactEmail || store.members.find((m) => m.user?.email)?.user?.email

    emailPromises.push(
      resend.emails.send({
        from: `${fromName} <orders@shopora.space>`,
        to: email,
        ...(storeReplyTo ? { replyTo: storeReplyTo } : {}),
        subject: `We've received your order ${orderNumber}`,
        react: OrderReceivedEmail({
          customerFirstName: firstName,
          storeName: store.name,
          orderNumber,
          currency: store.currency,
          totalAmount,
          items: emailItems,
          shippingAddress,
          paymentReference: reference,
          storeUrl: `https://www.shopora.space/storefront/${store.slug}`,
          storeWhatsapp: store.whatsappNumber,
          storeEmail: store.contactEmail,
        }),
      })
    )

    store.members.forEach(member => {
      if (member.user && member.user.email) {
        emailPromises.push(
          resend.emails.send({
            from: `${fromName} via Shopora <orders@shopora.space>`,
            to: member.user.email,
            replyTo: email,
            subject: `New order ${orderNumber} · ${totalLabel}`,
            react: NewOrderEmail({
              merchantName: member.user.name?.split(" ")[0] || "there",
              storeName: store.name,
              orderNumber,
              orderUrl: `https://www.shopora.space/${store.id}/orders/${order.id}`,
              currency: store.currency,
              totalAmount,
              items: emailItems,
              customer: { name: `${firstName} ${lastName}`, phone, email },
              shippingAddress,
              paymentReference: reference,
            }),
          })
        )
      }
    })

    emailPromises.push(
      resend.emails.send({
        from: "Shopora System <orders@shopora.space>",
        to: "shoporaspace@gmail.com",
        subject: `Platform Sale: ${store.name}`,
        html: `
          <p>A new order was placed on a tenant's store.</p>
          <p><strong>Store:</strong> ${escapeHtml(store.name)} (${escapeHtml(store.slug)})</p>
          <p><strong>Amount:</strong> ${escapeHtml(totalLabel)}</p>
          <p><strong>Reference:</strong> ${escapeHtml(reference)}</p>
        `
      })
    )

    await Promise.all(emailPromises)
  } catch (err) {
    console.error("Failed to send order notification emails", err)
  }

  return { orderId: order.id, orderNumber }
}
