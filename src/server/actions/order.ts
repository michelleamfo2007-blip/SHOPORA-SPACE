"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function verifyOrderPaymentAction(storeId: string, orderId: string) {
  try {
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

    await db.order.update({
      where: { id: orderId, storeId },
      data: { status: status as any }
    })

    revalidatePath(`/${storeId}/orders`)
    revalidatePath(`/${storeId}/orders/${orderId}`)
    return { success: true }
  } catch (error) {
    console.error("Failed to update order status:", error)
    return { error: "Failed to update order status" }
  }
}
