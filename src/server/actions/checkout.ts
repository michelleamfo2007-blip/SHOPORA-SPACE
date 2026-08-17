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
  const reference = formData.get("paymentReference") as string
  const cartDataStr = formData.get("cartData") as string

  if (!storeId || !email || !firstName || !lastName || !cartDataStr || !reference) {
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
        name: `${firstName} ${lastName}`,
        phone: formData.get("phone") as string || undefined
      }
    })
  }

  // 2. Create Order with PENDING_VERIFICATION status
  const order = await db.order.create({
    data: {
      storeId,
      customerId: customer.id,
      orderNumber: `ORD-${Date.now().toString().slice(-6)}`,
      totalAmount,
      status: "PENDING_VERIFICATION", 
      shippingAddress: `${address}, ${city}, ${country}`,
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

  return { orderId: order.id }
}
