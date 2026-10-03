"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { Resend } from "resend"
import { OrderStatusEmail, type OrderStatusKind } from "@/emails/OrderStatusEmail"
import { getStoreAccess } from "@/lib/store-access"
import { DEFAULT_VARIANT_NAME } from "@/lib/product-variants"

const resend = new Resend(process.env.RESEND_API_KEY)

async function sendOrderStatusEmail(orderId: string, storeId: string, kind: OrderStatusKind) {
  try {
    const order = await db.order.findUnique({
      where: { id: orderId, storeId },
      include: {
        customer: true,
        store: { include: { members: { include: { user: { select: { email: true } } } } } },
        orderItems: { include: { variant: { select: { name: true, product: { select: { name: true } } } } } },
      },
    })

    if (!order || !order.customer.email) return

    const { store } = order
    const fromName = store.name.replace(/[<>"\\,;:@]/g, "").trim() || "Shopora"
    const storeReplyTo = store.contactEmail || store.members.find((m) => m.user?.email)?.user?.email

    const subjects: Record<OrderStatusKind, string> = {
      ACCEPTED: `Your order ${order.orderNumber} is confirmed`,
      SHIPPED: `Your order ${order.orderNumber} is on the way`,
      DELIVERED: `Your order ${order.orderNumber} has arrived`,
      REFUNDED: `Your order ${order.orderNumber} has been refunded`,
    }

    await resend.emails.send({
      from: `${fromName} <orders@shopora.space>`,
      to: order.customer.email,
      ...(storeReplyTo ? { replyTo: storeReplyTo } : {}),
      subject: subjects[kind],
      react: OrderStatusEmail({
        kind,
        customerFirstName: order.customer.name.trim().split(/\s+/)[0] || "there",
        storeName: store.name,
        orderNumber: order.orderNumber,
        currency: store.currency,
        totalAmount: order.totalAmount,
        items: order.orderItems.map(({ variant, quantity, price }) => ({
          name:
            variant.name && variant.name !== DEFAULT_VARIANT_NAME
              ? `${variant.product.name} (${variant.name})`
              : variant.product.name,
          quantity,
          price,
        })),
        shippingAddress: order.shippingAddress,
        storeUrl: `https://www.shopora.space/storefront/${store.slug}`,
        storeWhatsapp: store.whatsappNumber,
        storeEmail: store.contactEmail,
      }),
    })
  } catch (error) {
    console.error(`Failed to send order ${kind.toLowerCase()} email:`, error)
  }
}

export async function verifyOrderPaymentAction(storeId: string, orderId: string) {
  const access = await getStoreAccess(storeId)
  if ("error" in access) return { error: access.error }

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
      await sendOrderStatusEmail(orderId, storeId, "ACCEPTED")
    }

    revalidatePath(`/${storeId}/orders`)
    return { success: true }
  } catch (error) {
    console.error("Failed to verify payment:", error)
    return { error: "Failed to verify payment" }
  }
}

export async function updateOrderStatusAction(storeId: string, orderId: string, status: string) {
  const access = await getStoreAccess(storeId)
  if ("error" in access) return { error: access.error }

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

    if (status === "PROCESSING" && order.status !== "PROCESSING") {
      await sendOrderStatusEmail(orderId, storeId, "ACCEPTED")
    }

    if (
      (status === "SHIPPED" || status === "DELIVERED" || status === "REFUNDED") &&
      order.status !== status
    ) {
      await sendOrderStatusEmail(orderId, storeId, status)
    }

    revalidatePath(`/${storeId}/orders`)
    revalidatePath(`/${storeId}/orders/${orderId}`)
    return { success: true }
  } catch (error) {
    console.error("Failed to update order status:", error)
    return { error: "Failed to update order status" }
  }
}
