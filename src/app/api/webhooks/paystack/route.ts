import { NextResponse } from "next/server"
import crypto from "crypto"
import { db } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const rawBody = await req.text()
    const signature = req.headers.get("x-paystack-signature")
    const secret = process.env.PAYSTACK_SECRET_KEY

    if (!secret) {
      console.error("Missing PAYSTACK_SECRET_KEY")
      return NextResponse.json({ message: "Server error" }, { status: 500 })
    }

    if (!signature) {
      return NextResponse.json({ message: "No signature" }, { status: 401 })
    }

    // Verify signature
    const hash = crypto.createHmac("sha512", secret).update(rawBody).digest("hex")
    if (hash !== signature) {
      return NextResponse.json({ message: "Invalid signature" }, { status: 401 })
    }

    const event = JSON.parse(rawBody)

    // Handle successful charge
    if (event.event === "charge.success") {
      const { reference, metadata } = event.data
      const orderId = metadata?.orderId || reference

      // 1. Update Order Status
      const order = await db.order.update({
        where: { id: orderId },
        data: {
          status: "PROCESSING"
        },
        include: {
          orderItems: true
        }
      })

      // 2. Deduct Inventory (we skipped this during checkout until payment succeeded)
      for (const item of order.orderItems) {
        await db.productVariant.update({
          where: { id: item.variantId },
          data: {
            stockCount: {
              decrement: item.quantity
            }
          }
        })
      }

      console.log(`Order ${orderId} successfully marked as PAID.`)
    }

    return NextResponse.json({ message: "Webhook received" }, { status: 200 })
  } catch (error) {
    console.error("Paystack Webhook Error:", error)
    return NextResponse.json({ message: "Webhook error" }, { status: 400 })
  }
}
