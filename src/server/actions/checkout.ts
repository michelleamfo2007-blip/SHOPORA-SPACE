"use server"

import { randomBytes } from "crypto"
import { db } from "@/lib/db"

import { resend } from "@/lib/resend"
import { isSubscriptionLapsed } from "@/lib/subscription"
import { DEFAULT_VARIANT_NAME } from "@/lib/product-variants"
import { NewOrderEmail } from "@/emails/NewOrderEmail"
import { OrderReceivedEmail } from "@/emails/OrderReceivedEmail"
import { inAccraBounds, isAccraArea, quoteShoporaDelivery } from "@/lib/shopora-delivery"
import { pushToStoreMembers } from "@/lib/push"

const variantSelect = {
  id: true,
  price: true,
  name: true,
  stockCount: true,
  productId: true,
  product: { select: { name: true, _count: { select: { options: true } } } },
} as const

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

class OutOfStockError extends Error {
  constructor(public itemName: string) {
    super("OUT_OF_STOCK")
  }
}

function parsePin(latRaw: FormDataEntryValue | null, lngRaw: FormDataEntryValue | null) {
  const lat = Number(latRaw)
  const lng = Number(lngRaw)
  if (!latRaw || !lngRaw || !Number.isFinite(lat) || !Number.isFinite(lng)) return null
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null
  return { lat, lng }
}

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
  const deliveryMethodRaw = String(formData.get("deliveryMethod") || "VENDOR").toUpperCase()
  const deliveryMethod = deliveryMethodRaw === "SHOPORA" ? "SHOPORA" : "VENDOR"

  if (!storeId || !email || !phone || !firstName || !lastName || !exactLocation || !cartDataStr || !reference) {
    return { error: "Please fill in all the required fields." }
  }
  if (!EMAIL_RE.test(email.trim()) || email.length > 120) {
    return { error: "Enter a valid email address so we can send your order updates." }
  }
  const phoneDigits = phone.replace(/\D/g, "")
  if (phoneDigits.length < 9 || phoneDigits.length > 15) {
    return { error: "Enter a valid phone number, e.g. 024 123 4567." }
  }
  if (firstName.trim().length > 60 || lastName.trim().length > 60) {
    return { error: "Your name is too long. Please shorten it." }
  }
  if (exactLocation.trim().length < 3 || exactLocation.length > 300) {
    return { error: "Add your delivery location (area, street or landmark)." }
  }
  const referenceClean = reference.trim()
  if (referenceClean.length < 4 || referenceClean.length > 64) {
    return { error: "Enter the transaction ID or reference from your payment (at least 4 characters)." }
  }
  const pin = parsePin(formData.get("dropoffLat"), formData.get("dropoffLng"))

  const store = await db.store.findUnique({ 
    where: { id: storeId },
    include: { members: { include: { user: true } }, subscription: true }
  })
  if (!store) return { error: "Store not found." }
  if (isSubscriptionLapsed(store.subscription)) return { error: "This store is not taking orders right now." }

  let shippingAmount = 0
  let deliveryDistanceKm: number | null = null
  let deliveryDurationMin: number | null = null
  let shoporaCutAmount: number | null = null
  let deliveryQuotedAt: Date | null = null
  let riderPayout = 0

  if (deliveryMethod === "SHOPORA") {
    if (!store.shoporaDeliveryEnabled || store.pickupLat == null || store.pickupLng == null) {
      return { error: "Shopora Delivery is not available for this store right now." }
    }
    if (!(pin && inAccraBounds(pin)) && !isAccraArea(city, exactLocation)) {
      return { error: "Shopora Delivery is only available for Accra addresses right now." }
    }
    const quoted = await quoteShoporaDelivery({
      pickup: { lat: store.pickupLat, lng: store.pickupLng },
      dropoffAddress: { exactLocation, city, country },
      dropoffPoint: pin,
    })
    if (!quoted.ok) return { error: quoted.error }
    shippingAmount = quoted.quote.fee
    deliveryDistanceKm = quoted.quote.distanceKm
    deliveryDurationMin = quoted.quote.durationMin
    shoporaCutAmount = quoted.quote.shoporaCut
    riderPayout = quoted.quote.riderPayout
    deliveryQuotedAt = new Date()
  }

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

  const lineItems = new Map<
    string,
    { variantId: string; productId: string; simple: boolean; name: string; quantity: number; price: number; stock: number }
  >()
  for (const item of requestedItems) {
    const variant = resolved.get(item.variantId)!
    const existing = lineItems.get(variant.id)
    if (existing) existing.quantity += item.quantity
    else
      lineItems.set(variant.id, {
        variantId: variant.id,
        productId: variant.productId,
        simple: variant.product._count.options === 0,
        name: variant.name && variant.name !== DEFAULT_VARIANT_NAME ? `${variant.product.name} (${variant.name})` : variant.product.name,
        quantity: item.quantity,
        price: variant.price,
        stock: variant.stockCount,
      })
  }
  const cartItems = [...lineItems.values()]

  // Never sell more than the seller has.
  for (const item of cartItems) {
    if (item.stock <= 0) {
      return { error: `${item.name} is sold out. Please remove it from your bag.` }
    }
    if (item.quantity > item.stock) {
      return { error: `Only ${item.stock} of ${item.name} left. Please reduce the quantity in your bag.` }
    }
  }

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
  // Product total is paid to the vendor. Delivery fee (if Shopora) is paid to the rider on arrival.
  const orderNumber = `ORD-${Date.now().toString().slice(-6)}`
  const shippingAddress = `${exactLocation}, ${city}, ${country}`
  const trackingToken = deliveryMethod === "SHOPORA" ? randomBytes(16).toString("hex") : null
  const customerId = customer.id

  let order
  try {
    order = await db.$transaction(async (tx) => {
      // Reserve stock atomically so two shoppers can't both buy the last piece.
      for (const item of cartItems) {
        const reserved = await tx.productVariant.updateMany({
          where: { id: item.variantId, stockCount: { gte: item.quantity } },
          data: { stockCount: { decrement: item.quantity } },
        })
        if (reserved.count === 0) throw new OutOfStockError(item.name)
        if (item.simple) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stockCount: { decrement: item.quantity } },
          })
        }
      }

      return tx.order.create({
    data: {
      storeId,
      customerId,
      orderNumber,
      totalAmount,
      shippingAmount,
      status: "PENDING_VERIFICATION",
      shippingAddress,
      deliveryMethod,
      deliveryDistanceKm,
      deliveryDurationMin,
      shoporaCutAmount,
      deliveryQuotedAt,
      dropoffLat: pin?.lat ?? null,
      dropoffLng: pin?.lng ?? null,
      stockReserved: true,
      trackingToken,
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
          reference: referenceClean
        }
      },
      ...(deliveryMethod === "SHOPORA"
        ? {
            deliveryJob: {
              create: {
                status: "PENDING",
                feeAmount: shippingAmount,
                riderPayout,
                shoporaCut: shoporaCutAmount ?? 0,
                pickupAddress: [store.pickupAddress, store.pickupCity].filter(Boolean).join(", ") || "Accra",
                dropoffAddress: shippingAddress,
                dropoffLat: pin?.lat ?? null,
                dropoffLng: pin?.lng ?? null,
                distanceKm: deliveryDistanceKm,
                durationMin: deliveryDurationMin,
              },
            },
          }
        : {}),
    }
      })
    })
  } catch (err) {
    if (err instanceof OutOfStockError) {
      return { error: `${err.itemName} just sold out or has fewer left than you chose. Please update your bag.` }
    }
    throw err
  }

  // 3. Send Notifications
  try {
    const emailPromises = []
    
    const totalLabel = `${store.currency} ${totalAmount.toFixed(2)}`
    const fromName = store.name.replace(/[<>"\\,;:@]/g, "").trim() || "Shopora"
    const emailItems = cartItems.map(({ name, quantity, price }) => ({ name, quantity, price }))
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
          trackingUrl: trackingToken ? `https://www.shopora.space/track/${trackingToken}` : null,
          shoporaDeliveryFee: deliveryMethod === "SHOPORA" ? shippingAmount : null,
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
          <p><strong>Delivery:</strong> ${escapeHtml(deliveryMethod === "SHOPORA" ? `Shopora · GHS ${shippingAmount.toFixed(2)} (pay rider on arrival)` : "Vendor arranges")}</p>
          <p><strong>Reference:</strong> ${escapeHtml(reference)}</p>
        `
      })
    )

    await Promise.all(emailPromises)
  } catch (err) {
    console.error("Failed to send order notification emails", err)
  }

  await pushToStoreMembers(storeId, {
    title: `New order · ${store.currency} ${totalAmount.toFixed(2)}`,
    body: `${firstName} placed order ${orderNumber}. Check the payment and verify it.`,
    data: { screen: "order", orderId: order.id },
  })

  return { orderId: order.id, orderNumber, trackingToken }
}
