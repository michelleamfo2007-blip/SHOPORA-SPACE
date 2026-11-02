import { cookies, headers } from "next/headers"
import { getServerSession } from "next-auth/next"
import { getToken } from "next-auth/jwt"
import { authOptions } from "@/auth"
import { db } from "@/lib/db"
import { isSubscriptionLapsed } from "@/lib/subscription"

export const LAPSED_STORE_MESSAGE =
  "Your subscription has ended. Renew it on the Billing page to make changes."

async function resolveUserId(): Promise<string | null> {
  // Bind request cookies/headers so NextAuth can see the session in Server Actions.
  const jar = await cookies()
  await headers()

  const session = await getServerSession(authOptions)
  if (session?.user?.id) return session.user.id

  // Fallback: read JWT directly (helps when getServerSession misses the cookie in actions).
  const secret = process.env.NEXTAUTH_SECRET || authOptions.secret
  if (!secret) return null

  const cookieName =
    jar.get("__Secure-next-auth.session-token")?.name ||
    jar.get("next-auth.session-token")?.name ||
    "next-auth.session-token"

  const token = await getToken({
    req: {
      cookies: {
        get: (name: string) => jar.get(name)?.value,
        getAll: () => jar.getAll().map((c) => ({ name: c.name, value: c.value })),
      },
      headers: {
        get: (name: string) => {
          if (name.toLowerCase() === "cookie") {
            return jar.getAll().map((c) => `${c.name}=${c.value}`).join("; ")
          }
          return null
        },
      },
    } as any,
    secret,
    cookieName,
    secureCookie: cookieName.startsWith("__Secure-"),
  })

  return (token?.sub as string | undefined) || (token?.id as string | undefined) || null
}

/** Confirms the signed-in user belongs to the store and its subscription hasn't lapsed. */
export async function getStoreAccess(storeId: string) {
  if (!storeId) return { error: "Unauthorized", status: 401 } as const

  const userId = await resolveUserId()
  if (!userId) {
    return { error: "Please sign in again, then verify the payment.", status: 401 } as const
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { platformRole: true },
  })

  const member = await db.storeMember.findUnique({
    where: { storeId_userId: { storeId, userId } },
    include: { store: { select: { subscription: { select: { status: true, currentPeriodEnd: true } } } } },
  })

  // Super admins can act on any store (ops / support).
  if (!member && user?.platformRole !== "SUPER_ADMIN") {
    return {
      error: "You don’t have access to this store. Sign in with the store owner account.",
      status: 403,
    } as const
  }

  if (member) {
    if (isSubscriptionLapsed(member.store.subscription)) {
      return { error: LAPSED_STORE_MESSAGE, status: 403 } as const
    }
    return { member, userId }
  }

  const store = await db.store.findUnique({
    where: { id: storeId },
    select: { subscription: { select: { status: true, currentPeriodEnd: true } } },
  })
  if (!store) return { error: "Store not found", status: 404 } as const
  if (isSubscriptionLapsed(store.subscription)) {
    return { error: LAPSED_STORE_MESSAGE, status: 403 } as const
  }

  // Synthetic OWNER membership so existing role checks keep working for super-admins.
  return {
    member: {
      id: "super-admin",
      storeId,
      userId,
      role: "OWNER" as const,
      createdAt: new Date(),
      store: { subscription: store.subscription },
    },
    userId,
  }
}

export async function requireStoreAccess(storeId: string) {
  const access = await getStoreAccess(storeId)
  if ("error" in access) throw new Error(access.error)
  return access
}
