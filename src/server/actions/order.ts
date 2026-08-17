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
