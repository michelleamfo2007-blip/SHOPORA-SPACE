import type { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { resend } from "@/lib/resend"
import { formatBillingDate } from "@/lib/subscription"

const DAY = 24 * 60 * 60 * 1000

// Runs once a day, so each subscription falls into each one-day window exactly once.
export async function GET(request: NextRequest) {
  if (!process.env.CRON_SECRET || request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 })
  }

  const now = Date.now()
  const subscriptions = await db.subscription.findMany({
    where: {
      status: { in: ["TRIAL", "ACTIVE"] },
      currentPeriodEnd: { gte: new Date(now - DAY), lt: new Date(now + 3 * DAY) },
    },
    include: {
      store: { include: { members: { where: { role: "OWNER" }, include: { user: true } } } },
    },
  })

  let sent = 0
  for (const subscription of subscriptions) {
    const end = subscription.currentPeriodEnd!.getTime()
    const endingSoon = end >= now + 2 * DAY
    const ended = end < now
    if (!endingSoon && !ended) continue

    const owner = subscription.store.members[0]?.user
    if (!owner?.email) continue

    const storeName = subscription.store.name
    const period = subscription.status === "TRIAL" ? "free trial" : "subscription"
    const date = formatBillingDate(subscription.currentPeriodEnd!)
    const billingUrl = `https://shopora.space/${subscription.storeId}/billing`

    try {
      await resend.emails.send({
        from: "Shopora Billing <billing@shopora.space>",
        to: owner.email,
        subject: ended
          ? `Your ${storeName} ${period} has ended`
          : `Your ${storeName} ${period} ends in 3 days`,
        html: ended
          ? `
            <p>Hi ${owner.name || "there"},</p>
            <p>Your ${period} for <strong>${storeName}</strong> ended on ${date}. Your store is now closed to customers and your dashboard is locked.</p>
            <p>Make a payment to reopen your store straight away:<br><a href="${billingUrl}">${billingUrl}</a></p>
          `
          : `
            <p>Hi ${owner.name || "there"},</p>
            <p>Your ${period} for <strong>${storeName}</strong> ends on ${date}.</p>
            <p>To keep your store open to customers, make your payment before then:<br><a href="${billingUrl}">${billingUrl}</a></p>
          `,
      })
      sent++
    } catch (error) {
      console.error(`Failed to send subscription reminder for ${subscription.storeId}:`, error)
    }
  }

  const { count: markedPastDue } = await db.subscription.updateMany({
    where: { status: { in: ["TRIAL", "ACTIVE"] }, currentPeriodEnd: { lt: new Date(now) } },
    data: { status: "PAST_DUE" },
  })

  return Response.json({ sent, markedPastDue })
}
