"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { getStoreAccess, getStoreManagerAccess } from "@/lib/store-access"
import { createManualOrder, type ManualOrderInput } from "@/lib/manual-order"
import { applyBulkUpdates, type BulkUpdate } from "@/lib/bulk-products"
import { inviteTeamMember, removeTeamEntry } from "@/lib/team"
import { updateCustomerNotes } from "@/lib/customer-notes"
import { setMonthlyGoal } from "@/lib/sales-goal"
import { changeStorePlan, featureGate } from "@/lib/store-plan"

export async function recordManualOrderAction(storeId: string, input: ManualOrderInput) {
  const access = await getStoreAccess(storeId)
  if ("error" in access) return { error: access.error }
  const locked = await featureGate(storeId, "manualOrders")
  if (locked) return { error: locked }
  const result = await createManualOrder(storeId, input)
  if ("error" in result) return { error: result.error }
  revalidatePath(`/${storeId}/orders`)
  revalidatePath(`/${storeId}`)
  return { success: true as const, orderId: result.order.id }
}

export async function bulkUpdateProductsAction(storeId: string, updates: BulkUpdate[]) {
  const access = await getStoreAccess(storeId)
  if ("error" in access) return { error: access.error }
  const locked = await featureGate(storeId, "bulkEdit")
  if (locked) return { error: locked }
  const result = await applyBulkUpdates(storeId, updates)
  if ("error" in result) return { error: result.error }
  revalidatePath("/", "layout")
  return result
}

export async function inviteTeamMemberAction(storeId: string, email: string, role: string) {
  const access = await getStoreManagerAccess(storeId)
  if ("error" in access) return { error: access.error }
  const locked = await featureGate(storeId, "team")
  if (locked) return { error: locked }
  const user = await db.user.findUnique({ where: { id: access.userId }, select: { name: true } })
  const result = await inviteTeamMember(storeId, { id: access.userId, role: access.member.role, name: user?.name }, { email, role })
  if ("error" in result) return { error: result.error }
  revalidatePath(`/${storeId}/team`)
  return result
}

export async function removeTeamEntryAction(storeId: string, target: { memberId?: string; inviteId?: string }) {
  const access = await getStoreManagerAccess(storeId)
  if ("error" in access) return { error: access.error }
  const result = await removeTeamEntry(storeId, { id: access.userId, role: access.member.role }, target)
  if ("error" in result) return { error: result.error }
  revalidatePath(`/${storeId}/team`)
  return result
}

export async function saveCustomerNotesAction(storeId: string, customerId: string, notes: string, tags: string[]) {
  const access = await getStoreAccess(storeId)
  if ("error" in access) return { error: access.error }
  const locked = await featureGate(storeId, "customerNotes")
  if (locked) return { error: locked }
  const result = await updateCustomerNotes(storeId, customerId, { notes, tags })
  if ("error" in result) return { error: result.error }
  revalidatePath(`/${storeId}/customers`)
  return result
}

export async function setMonthlyGoalAction(storeId: string, goal: number | null) {
  const access = await getStoreManagerAccess(storeId)
  if ("error" in access) return { error: access.error }
  const locked = await featureGate(storeId, "monthlyGoal")
  if (locked) return { error: locked }
  const result = await setMonthlyGoal(storeId, goal)
  if ("error" in result) return { error: result.error }
  revalidatePath(`/${storeId}`)
  return result
}

export async function changePlanAction(storeId: string, planName: string) {
  const access = await getStoreManagerAccess(storeId)
  if ("error" in access) return { error: access.error }
  const result = await changeStorePlan(storeId, planName)
  if ("error" in result) return { error: result.error }
  revalidatePath("/", "layout")
  return result
}
