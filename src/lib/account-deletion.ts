import { db } from "@/lib/db"
import { resend } from "@/lib/resend"

const ADMIN_EMAIL = "shoporaspace@gmail.com"
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!)
}

type DeletionRequest = {
  accountType: "seller" | "rider" | "customer"
  email: string
  name?: string | null
  reason?: string | null
  /** Set when the request comes from a logged-in app session, so the account is already verified. */
  verifiedAccountId?: string | null
  source: "app" | "website"
}

/**
 * Records an account deletion request (required by Google Play and the App Store). Shopora's
 * team completes it within 30 days, so a store's orders are never wiped by accident.
 */
export async function requestAccountDeletion(input: DeletionRequest) {
  const email = input.email.trim().toLowerCase()
  if (!EMAIL_RE.test(email)) return { error: "Enter the email address on your account." }
  const reason = input.reason?.trim().slice(0, 500) || null

  let stores: string[] = []
  if (input.accountType === "seller") {
    const user = await db.user.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
      select: { storeMembers: { select: { role: true, store: { select: { name: true, slug: true } } } } },
    })
    stores = user?.storeMembers.map((m) => `${m.store.name} (${m.store.slug}) – ${m.role}`) ?? []
  }

  const rows = [
    ["Account type", input.accountType],
    ["Email", email],
    ["Name", input.name || "—"],
    ["Verified in app", input.verifiedAccountId ? `Yes (id ${input.verifiedAccountId})` : "No – confirm with the user by email first"],
    ["Requested from", input.source],
    ["Stores", stores.length ? stores.join("<br>") : "—"],
    ["Reason", reason || "—"],
  ]

  try {
    await resend.emails.send({
      from: "Shopora System <hello@shopora.space>",
      to: ADMIN_EMAIL,
      replyTo: email,
      subject: `Account deletion request · ${email}`,
      html: `
        <p>Someone asked for their Shopora account to be deleted. Complete it within 30 days.</p>
        <table cellpadding="6" style="border-collapse:collapse">${rows
          .map(([k, v]) => `<tr><td><strong>${escapeHtml(k)}</strong></td><td>${k === "Stores" ? v : escapeHtml(v)}</td></tr>`)
          .join("")}</table>
      `,
    })
    await resend.emails.send({
      from: "Shopora <hello@shopora.space>",
      to: email,
      subject: "We received your account deletion request",
      html: `
        <p>Hi${input.name ? ` ${escapeHtml(input.name.split(" ")[0])}` : ""},</p>
        <p>We received a request to delete your Shopora ${escapeHtml(input.accountType)} account for ${escapeHtml(email)}.</p>
        <p>We'll delete it and your personal information within 30 days, and email you when it's done. If you didn't ask for this, just reply to this email and we'll cancel it.</p>
        <p>— The Shopora team</p>
      `,
    })
  } catch (err) {
    console.error("Failed to send account deletion emails", err)
    return { error: "Could not send your request. Email shoporaspace@gmail.com and we'll help." }
  }

  return { success: true as const }
}
