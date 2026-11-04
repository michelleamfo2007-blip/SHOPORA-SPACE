"use server"

import { getStoreAccess } from "@/lib/store-access"
import { updateOrderStatus, verifyOrderPayment } from "@/lib/order-service"

export async function verifyOrderPaymentAction(storeId: string, orderId: string) {
  const access = await getStoreAccess(storeId)
  if ("error" in access) return { error: access.error }
  return verifyOrderPayment(storeId, orderId)
}

export async function updateOrderStatusAction(storeId: string, orderId: string, status: string) {
  const access = await getStoreAccess(storeId)
  if ("error" in access) return { error: access.error }
  return updateOrderStatus(storeId, orderId, status)
}
