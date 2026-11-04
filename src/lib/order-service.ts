import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { Resend } from "resend"
import { OrderStatusEmail, type OrderStatusKind } from "@/emails/OrderStatusEmail"
import { DEFAULT_VARIANT_NAME } from "@/lib/product-variants"
import { notifyRidersOfOpenJob } from "@/lib/notify-riders"
import { releaseOrderStock, reserveOrderStock } from "@/lib/order-stock"

/**
 * Order mutations shared by the website dashboard (server actions) and the mobile app (API routes).
 * Callers must check store access first.
 */

const resend = new Resend(process.env.RESEND_API_KEY)

export const ORDER_STATUSES = [
  "PENDING",
  "PENDING_VERIFICATION",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
] as const

export type OrderStatusValue = (typeof ORDER_STATUSES)[number]

export function isOrderStatus(value: string): value is OrderStatusValue {
  return (ORDER_STATUSES as readonly string[]).includes(value)
}

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
    const trackingUrl =
      order.deliveryMethod === "SHOPORA" && order.trackingToken
        ? `https://www.shopora.space/track/${order.trackingToken}`
        : null

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
        trackingUrl,
      }),
    })
  } catch (error) {
    console.error(`Failed to send order ${kind.toLowerCase()} email:`, error)
  }
}

export async function verifyOrderPayment(storeId: string, orderId: string) {
  try {
    const order = await db.order.findUnique({ where: { id: orderId, storeId } })
    if (!order) return { error: "Order not found" }

    await db.order.update({
      where: { id: orderId, storeId },
      data: { status: "PROCESSING" },
    })

    await db.payment.updateMany({
      where: { orderId },
      data: { status: "COMPLETED" },
    })

    if (order.status !== "PROCESSING") {
      await sendOrderStatusEmail(orderId, storeId, "ACCEPTED")
    }

    // Shopora Delivery jobs become available for riders once payment is confirmed.
    if (order.deliveryMethod === "SHOPORA") {
      try {
        await notifyRidersOfOpenJob(orderId)
      } catch (err) {
        console.error("Failed to email riders about open job:", err)
      }
    }

    revalidatePath(`/${storeId}/orders`)
    revalidatePath("/rider")
    revalidatePath("/super-admin/deliveries")
    return { success: true as const }
  } catch (error) {
    console.error("Failed to verify payment:", error)
    return { error: "Failed to verify payment" }
  }
}

export async function updateOrderStatus(storeId: string, orderId: string, status: string) {
  try {
    if (!isOrderStatus(status)) {
      return { error: "Invalid status" }
    }

    const order = await db.order.findUnique({
      where: { id: orderId, storeId },
      include: { deliveryJob: { select: { id: true, status: true } } },
    })
    if (!order) return { error: "Order not found" }

    // Shopora Delivery owns ship/deliver status via the rider app.
    if (
      order.deliveryMethod === "SHOPORA" &&
      order.deliveryJob &&
      (status === "SHIPPED" || status === "DELIVERED") &&
      !["DELIVERED", "CANCELLED"].includes(order.deliveryJob.status)
    ) {
      return {
        error:
          "This order uses Shopora Delivery. Wait for a rider to pick up and complete delivery (OTP). Don’t mark it shipped/delivered from the store dashboard.",
      }
    }

    const closed = ["CANCELLED", "REFUNDED"]
    const wasClosed = closed.includes(order.status)
    const willClose = closed.includes(status)
    try {
      await db.$transaction(async (tx) => {
        if (willClose && !wasClosed) await releaseOrderStock(tx, orderId)
        if (wasClosed && !willClose) await reserveOrderStock(tx, orderId)
        await tx.order.update({
          where: { id: orderId, storeId },
          data: { status },
        })
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : ""
      if (message.startsWith("OUT_OF_STOCK:")) {
        return { error: `Not enough ${message.slice("OUT_OF_STOCK:".length)} in stock to reopen this order.` }
      }
      throw err
    }

    if (status === "PROCESSING" && order.status !== "PROCESSING") {
      await sendOrderStatusEmail(orderId, storeId, "ACCEPTED")
      if (order.deliveryMethod === "SHOPORA" && order.deliveryJob?.status === "PENDING") {
        try {
          await notifyRidersOfOpenJob(orderId)
        } catch (err) {
          console.error("Failed to email riders about open job:", err)
        }
      }
    }

    if (
      (status === "SHIPPED" || status === "DELIVERED" || status === "REFUNDED") &&
      order.status !== status
    ) {
      await sendOrderStatusEmail(orderId, storeId, status)
    }

    revalidatePath(`/${storeId}/orders`)
    revalidatePath(`/${storeId}/orders/${orderId}`)
    revalidatePath("/rider")
    revalidatePath("/super-admin/deliveries")
    return { success: true as const }
  } catch (error) {
    console.error("Failed to update order status:", error)
    return { error: "Failed to update order status" }
  }
}
