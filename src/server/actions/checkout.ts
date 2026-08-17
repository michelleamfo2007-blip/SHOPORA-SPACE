"use server"

import { db } from "@/lib/db"

export async function processCheckoutAction(formData: FormData) {
  const storeId = formData.get("storeId") as string
  const email = formData.get("email") as string
  const firstName = formData.get("firstName") as string
  const lastName = formData.get("lastName") as string
  const address = formData.get("address") as string
  const city = formData.get("city") as string
  const country = formData.get("country") as string
  const cartDataStr = formData.get("cartData") as string

  if (!storeId || !email || !firstName || !lastName || !cartDataStr) {
    throw new Error("Missing required fields")
  }

  const store = await db.store.findUnique({ where: { id: storeId } })
  if (!store) throw new Error("Store not found")

  const cartItems = JSON.parse(cartDataStr) as Array<{
    variantId: string
    quantity: number
    price: number
  }>

  if (cartItems.length === 0) {
    throw new Error("Cart is empty")
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
        firstName,
        lastName,
        phone: formData.get("phone") as string || undefined
      }
    })
  }

  // 2. Create Order and OrderItems
  const order = await db.order.create({
    data: {
      storeId,
      customerId: customer.id,
      totalAmount,
      status: "PENDING", 
      paymentStatus: "UNPAID",
      shippingAddress: `${address}, ${city}, ${country}`,
      items: {
        create: cartItems.map(item => ({
          variantId: item.variantId,
          quantity: item.quantity,
          price: item.price
        }))
      }
    }
  })

  // 3. Initialize Paystack Transaction
  // Paystack expects amount in the lowest denomination (e.g. kobo/pesewas), so multiply by 100
  const amountInKobo = Math.round(totalAmount * 100)
  
  // Use a fallback key for development if not provided, but strongly recommend setting it in .env
  const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || "sk_test_placeholder"
  
  // Note: We use the store's custom domain or subdomain for the callback URL
  // If NEXT_PUBLIC_ROOT_DOMAIN is not set, we default to localhost:3000 for local dev
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http"
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000"
  const callbackUrl = `${protocol}://${store.slug}.${rootDomain}/checkout/success?orderId=${order.id}`

  const response = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email,
      amount: amountInKobo,
      currency: store.currency, // e.g. GHS, NGN
      reference: order.id, // Use our order ID as the reference
      callback_url: callbackUrl,
      metadata: {
        storeId,
        orderId: order.id
      }
    })
  })

  const paystackData = await response.json()

  if (!paystackData.status) {
    console.error("Paystack Initialization Error:", paystackData)
    throw new Error(paystackData.message || "Failed to initialize payment")
  }

  // 4. Return the authorization URL so the client can redirect
  return { 
    orderId: order.id,
    authorizationUrl: paystackData.data.authorization_url
  }
}
