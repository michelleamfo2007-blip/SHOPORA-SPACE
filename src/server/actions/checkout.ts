"use server"

import { db } from "@/lib/db"

import { resend } from "@/lib/resend"

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
    throw new Error("Missing required fields")
  }

  const store = await db.store.findUnique({ 
    where: { id: storeId },
    include: { members: { include: { user: true } } }
  })
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
    
    // Notify All Tenant Admins (Store Members)
    store.members.forEach(member => {
      if (member.user && member.user.email) {
        emailPromises.push(
          resend.emails.send({
            from: "Orders <orders@shopora.space>",
            to: member.user.email,
            subject: `New Order Received: ${orderNumber} 🎉`,
            html: `
              <p>Hi ${member.user.name || "Merchant"},</p>
              <p>You have received a new order on your store (<strong>${store.name}</strong>).</p>
              <p><strong>Order Number:</strong> ${orderNumber}</p>
              <p><strong>Customer:</strong> ${firstName} ${lastName}</p>
              <p><strong>Total Amount:</strong> ${store.currency} ${totalAmount.toFixed(2)}</p>
              <p><strong>Payment Reference:</strong> ${reference}</p>
              <p>Log in to your dashboard to verify the payment and fulfill the order.</p>
            `
          })
        )
      }
    })

    // Notify Super Admin
    emailPromises.push(
      resend.emails.send({
        from: "Shopora System <orders@shopora.space>",
        to: "shoporaspace@gmail.com",
        subject: `Platform Sale: ${store.name} 🚀`,
        html: `
          <p>A new order was placed on a tenant's store.</p>
          <p><strong>Store:</strong> ${store.name} (${store.slug})</p>
          <p><strong>Amount:</strong> ${store.currency} ${totalAmount.toFixed(2)}</p>
          <p><strong>Reference:</strong> ${reference}</p>
        `
      })
    )

    await Promise.all(emailPromises)
  } catch (err) {
    console.error("Failed to send order notification emails", err)
  }

  return { orderId: order.id }
}
