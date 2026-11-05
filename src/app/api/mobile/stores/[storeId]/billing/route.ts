import { db } from "@/lib/db"
import { requireMobileStoreManager } from "@/lib/mobile-auth"
import { amountDue, submitSubscriptionPayment } from "@/lib/subscription-payment"
import { TRIAL_PACKAGES } from "@/lib/plans"
import { changeStorePlan } from "@/lib/store-plan"
import { featuresForPlan } from "@/lib/plan-features"

/** Billing stays reachable when a subscription has lapsed, so the seller can pay to reactivate. */
export async function GET(req: Request, { params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params
  const access = await requireMobileStoreManager(req, storeId, { allowLapsed: true })
  if ("error" in access) return Response.json({ error: access.error }, { status: access.status })

  const subscription = await db.subscription.findUnique({
    where: { storeId },
    include: { plan: true, payments: { orderBy: { createdAt: "desc" }, take: 1 } },
  })
  if (!subscription?.plan) return Response.json({ subscription: null })

  const latest = subscription.payments[0] ?? null
  const { amount, isEarlyBirdActive } = amountDue(subscription)

  return Response.json({
    subscription: {
      status: subscription.status,
      planName: subscription.plan.name,
      interval: subscription.plan.interval,
      price: amount,
      isEarlyBird: isEarlyBirdActive,
      currentPeriodEnd: subscription.currentPeriodEnd,
      pendingPayment:
        latest && latest.status === "PENDING"
          ? { createdAt: latest.createdAt, reference: latest.reference, amount: latest.amount }
          : null,
    },
    payTo: {
      banks: [
        { bank: "Fidelity Bank", accountNumber: "2100377615010", accountName: "MICHELLE AMFO" },
        { bank: "GCB Bank", accountNumber: "1741250000618", accountName: "MICHELLE AMFO" },
      ],
      momo: { networks: "MTN / Telecel / AT (All Networks)", number: "0549789315", name: "MICHELLE AMFO" },
    },
    plans: TRIAL_PACKAGES,
  })
}

/** Switch plan; the new price applies from the next payment. */
export async function PUT(req: Request, { params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params
  const access = await requireMobileStoreManager(req, storeId, { allowLapsed: true })
  if ("error" in access) return Response.json({ error: access.error }, { status: access.status })

  const body = await req.json().catch(() => ({}))
  const result = await changeStorePlan(storeId, String(body.planName ?? ""))
  if ("error" in result) return Response.json({ error: result.error }, { status: 400 })
  return Response.json({ ...result, features: featuresForPlan(result.plan.name) })
}

export async function POST(req: Request, { params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params
  const access = await requireMobileStoreManager(req, storeId, { allowLapsed: true })
  if ("error" in access) return Response.json({ error: access.error }, { status: access.status })

  const body = await req.json().catch(() => ({}))
  const method = body.method === "MOMO" ? "MOMO" : body.method === "BANK_TRANSFER" ? "BANK_TRANSFER" : ""
  const result = await submitSubscriptionPayment(storeId, {
    method,
    reference: String(body.reference || ""),
    userEmail: access.user.email,
  })
  if ("error" in result) return Response.json({ error: result.error }, { status: 400 })
  return Response.json({ success: true })
}
