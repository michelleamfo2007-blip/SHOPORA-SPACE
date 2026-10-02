import { getServerSession } from "next-auth/next"
import { authOptions } from "@/auth"
import { db } from "@/lib/db"
import { isSubscriptionLapsed } from "@/lib/subscription"

export const LAPSED_STORE_MESSAGE = "Your subscription has ended. Renew it on the Billing page to make changes."

/** Confirms the signed-in user belongs to the store and its subscription hasn't lapsed. */
export async function getStoreAccess(storeId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || !storeId) return { error: "Unauthorized", status: 401 } as const

  const member = await db.storeMember.findUnique({
    where: { storeId_userId: { storeId, userId: session.user.id } },
    include: { store: { select: { subscription: { select: { status: true, currentPeriodEnd: true } } } } },
  })
  if (!member) return { error: "Unauthorized", status: 403 } as const
  if (isSubscriptionLapsed(member.store.subscription)) return { error: LAPSED_STORE_MESSAGE, status: 403 } as const

  return { member, userId: session.user.id }
}

export async function requireStoreAccess(storeId: string) {
  const access = await getStoreAccess(storeId)
  if ("error" in access) throw new Error(access.error)
  return access
}
