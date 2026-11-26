"use server"

import { db } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/auth"
import { revalidatePath } from "next/cache"
import { StoreStatus } from "@prisma/client"

export async function toggleStoreStatusAction(storeId: string, currentStatus: StoreStatus) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const user = await db.user.findUnique({ where: { id: session.user.id } })
  if (user?.platformRole !== "SUPER_ADMIN") {
    throw new Error("Unauthorized: Only Super Admins can perform this action.")
  }

  const newStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE"

  await db.store.update({
    where: { id: storeId },
    data: { status: newStatus }
  })

  revalidatePath("/super-admin/moderation")
  
  return { success: true, newStatus }
}

export async function setStoreBlackFridayAccessAction(storeId: string, grant: boolean) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return { error: "Unauthorized" }

  const user = await db.user.findUnique({ where: { id: session.user.id }, select: { platformRole: true } })
  if (user?.platformRole !== "SUPER_ADMIN") return { error: "Unauthorized" }

  await db.store.update({
    where: { id: storeId },
    data: grant
      ? { blackFridayAccess: true }
      : { blackFridayAccess: false, blackFridayOn: false },
  })

  revalidatePath("/super-admin/sellers")
  revalidatePath("/", "layout")
  return { success: true as const }
}
