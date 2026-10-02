import { db } from "@/lib/db"

const PRODUCT_LIMITS: Record<string, number | null> = {
  Starter: 25,
  Professional: 50,
  Business: null,
}

export async function getProductLimitMessage(storeId: string) {
  const subscription = await db.subscription.findUnique({
    where: { storeId },
    include: { plan: true },
  })

  const planName = subscription?.plan.name ?? "Starter"
  const limit = PRODUCT_LIMITS[planName]
  if (limit == null) return null

  const count = await db.product.count({ where: { storeId } })
  if (count < limit) return null

  return `Your ${planName} plan includes up to ${limit} products. Upgrade your plan to add more.`
}
