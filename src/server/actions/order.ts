"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { Resend } from "resend"
import { OrderAcceptedEmail } from "@/emails/OrderAcceptedEmail"

const resend = new Resend(process.env.RESEND_API_KEY)

async function sendOrderAcceptedEmail(orderId: string, storeId: string) {
  try {
    const order = await db.order.findUnique({
      where: { id: orderId, storeId },
      include: {
        customer: true,
        store: true
      }
    })

    if (!order || !order.customer.email) return

    await resend.emails.send({
      from: `Orders <orders@shopora.space>`,
      to: order.customer.email,
      subject: `Your order from ${order.store.name} has been accepted!`,
      react: OrderAcceptedEmail({
        customerName: order.customer.name,
        orderNumber: order.orderNumber,
        totalAmount: `${order.store.currency} ${order.totalAmount.toFixed(2)}`,
        storeName: order.store.name
      }) as React.ReactElement
    })
  } catch (error) {
    console.error("Failed to send order accepted email:", error)
    // We don't want to fail the status update if email fails
  }
}

export async function verifyOrderPaymentAction(storeId: string, orderId: string) {
  try {
    const order = await db.order.findUnique({ where: { id: orderId, storeId } })
    if (!order) return { error: "Order not found" }

    // 1. Update the order status to PROCESSING
    await db.order.update({
      where: { id: orderId, storeId },
      data: { status: "PROCESSING" }
    })

    // 2. Update the related payment status to COMPLETED
    await db.payment.updateMany({
      where: { orderId },
      data: { status: "COMPLETED" }
    })

    if (order.status !== "PROCESSING") {
      await sendOrderAcceptedEmail(orderId, storeId)
    }

    revalidatePath(`/${storeId}/orders`)
    return { success: true }
  } catch (error) {
    console.error("Failed to verify payment:", error)
    return { error: "Failed to verify payment" }
  }
}

export async function updateOrderStatusAction(storeId: string, orderId: string, status: string) {
  try {
    const validStatuses = ["PENDING", "PENDING_VERIFICATION", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"]
    if (!validStatuses.includes(status)) {
      return { error: "Invalid status" }
    }

    const order = await db.order.findUnique({ where: { id: orderId, storeId } })
    if (!order) return { error: "Order not found" }

    await db.order.update({
      where: { id: orderId, storeId },
      data: { status: status as any }
    })

    // If changing to PROCESSING, trigger email
    if (status === "PROCESSING" && order.status !== "PROCESSING") {
      await sendOrderAcceptedEmail(orderId, storeId)
    }

    revalidatePath(`/${storeId}/orders`)
    revalidatePath(`/${storeId}/orders/${orderId}`)
    return { success: true }
  } catch (error) {
    console.error("Failed to update order status:", error)
    return { error: "Failed to update order status" }
  }
}
