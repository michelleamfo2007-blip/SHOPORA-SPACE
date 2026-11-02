import { db } from "@/lib/db"
import { resend } from "@/lib/resend"
import { DeliveryStatusEmail, type DeliveryStatusKind } from "@/emails/DeliveryStatusEmail"
import { RiderJobUpdateEmail, type RiderJobUpdateKind } from "@/emails/RiderJobUpdateEmail"

function trackUrl(token: string | null | undefined) {
  return token ? `https://www.shopora.space/track/${token}` : null
}

function vendorEmails(store: {
  contactEmail: string | null
  members: { user: { email: string | null } | null }[]
}) {
  return [
    ...new Set(
      [store.contactEmail, ...store.members.map((m) => m.user?.email)].filter((e): e is string => !!e)
    ),
  ]
}

async function loadJob(jobId: string) {
  return db.deliveryJob.findUnique({
    where: { id: jobId },
    include: {
      rider: { select: { id: true, name: true, email: true } },
      order: {
        include: {
          customer: true,
          store: {
            select: {
              name: true,
              contactEmail: true,
              members: { include: { user: { select: { email: true } } } },
            },
          },
        },
      },
    },
  })
}

async function sendCustomer(kind: DeliveryStatusKind, job: NonNullable<Awaited<ReturnType<typeof loadJob>>>, note?: string) {
  const email = job.order.customer.email
  if (!email) return
  await resend.emails.send({
    from: `${job.order.store.name.replace(/[<>"\\,;:@]/g, "").trim() || "Shopora"} <orders@shopora.space>`,
    to: email,
    subject:
      kind === "RIDER_ACCEPTED"
        ? `Rider accepted · ${job.order.orderNumber}`
        : kind === "PICKED_UP"
          ? `On the way · ${job.order.orderNumber}`
          : kind === "DELIVERED"
            ? `Delivered · ${job.order.orderNumber}`
            : `Delivery update · ${job.order.orderNumber}`,
    react: DeliveryStatusEmail({
      kind,
      recipientName: job.order.customer.name.trim().split(/\s+/)[0] || "there",
      storeName: job.order.store.name,
      orderNumber: job.order.orderNumber,
      riderName: job.rider?.name,
      trackingUrl: trackUrl(job.order.trackingToken),
      note,
    }),
  })
}

async function sendVendors(kind: DeliveryStatusKind, job: NonNullable<Awaited<ReturnType<typeof loadJob>>>, note?: string) {
  const emails = vendorEmails(job.order.store)
  if (emails.length === 0) return
  await Promise.all(
    emails.map((to) =>
      resend.emails.send({
        from: "Shopora Delivery <orders@shopora.space>",
        to,
        subject: `Delivery · ${job.order.orderNumber}`,
        react: DeliveryStatusEmail({
          kind,
          recipientName: "there",
          storeName: job.order.store.name,
          orderNumber: job.order.orderNumber,
          riderName: job.rider?.name,
          trackingUrl: trackUrl(job.order.trackingToken),
          note,
        }),
      })
    )
  )
}

async function sendRider(kind: RiderJobUpdateKind, job: NonNullable<Awaited<ReturnType<typeof loadJob>>>, note?: string) {
  if (!job.rider?.email) return
  await resend.emails.send({
    from: "Shopora Delivery <orders@shopora.space>",
    to: job.rider.email,
    subject: `Delivery update · ${job.order.orderNumber}`,
    react: RiderJobUpdateEmail({
      riderName: job.rider.name.split(/\s+/)[0] || "there",
      kind,
      orderNumber: job.order.orderNumber,
      storeName: job.order.store.name,
      note,
      dashboardUrl: "https://www.shopora.space/rider",
    }),
  })
}

export async function notifyDeliveryAccepted(jobId: string) {
  const job = await loadJob(jobId)
  if (!job) return
  try {
    await Promise.all([
      sendCustomer("RIDER_ACCEPTED", job),
      sendVendors("VENDOR_ASSIGNED", job),
      sendRider("ASSIGNED", job),
    ])
  } catch (err) {
    console.error("notifyDeliveryAccepted", err)
  }
}

export async function notifyDeliveryPickedUp(jobId: string) {
  const job = await loadJob(jobId)
  if (!job) return
  try {
    await Promise.all([sendCustomer("PICKED_UP", job), sendVendors("VENDOR_PICKED_UP", job)])
  } catch (err) {
    console.error("notifyDeliveryPickedUp", err)
  }
}

export async function notifyDeliveryCompleted(jobId: string) {
  const job = await loadJob(jobId)
  if (!job) return
  try {
    await Promise.all([sendCustomer("DELIVERED", job), sendVendors("VENDOR_DELIVERED", job)])
  } catch (err) {
    console.error("notifyDeliveryCompleted", err)
  }
}

export async function notifyDeliveryFailed(jobId: string, note?: string) {
  const job = await loadJob(jobId)
  if (!job) return
  try {
    await Promise.all([sendCustomer("FAILED", job, note), sendVendors("VENDOR_FAILED", job, note)])
  } catch (err) {
    console.error("notifyDeliveryFailed", err)
  }
}

export async function notifyRiderPickupWarning(jobId: string) {
  const job = await loadJob(jobId)
  if (!job) return
  try {
    await sendRider("PICKUP_WARN", job, "Please pick up soon or this job will be reopened.")
  } catch (err) {
    console.error("notifyRiderPickupWarning", err)
  }
}

export async function notifyRiderJobCancelled(jobId: string) {
  const job = await loadJob(jobId)
  if (!job) return
  try {
    await sendRider("CANCELLED", job)
  } catch (err) {
    console.error("notifyRiderJobCancelled", err)
  }
}
