import { db } from "@/lib/db"
import { resend } from "@/lib/resend"
import type { StoreRole } from "@/lib/store-roles"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!)
}

export async function listTeam(storeId: string) {
  const [members, invites] = await Promise.all([
    db.storeMember.findMany({
      where: { storeId },
      orderBy: { createdAt: "asc" },
      select: { id: true, role: true, createdAt: true, user: { select: { id: true, name: true, email: true } } },
    }),
    db.storeInvite.findMany({
      where: { storeId },
      orderBy: { createdAt: "asc" },
      select: { id: true, email: true, role: true, createdAt: true },
    }),
  ])
  return { members, invites }
}

/**
 * Adds a teammate by email. Existing Shopora users join straight away; everyone else gets an
 * invite that's claimed when they sign up or log in with that email.
 */
export async function inviteTeamMember(
  storeId: string,
  inviter: { id: string; role: StoreRole; name?: string | null },
  input: { email: string; role: string }
) {
  const email = input.email.trim().toLowerCase()
  if (!EMAIL_RE.test(email)) return { error: "Enter a valid email address." }
  const role: StoreRole = input.role === "ADMIN" ? "ADMIN" : "STAFF"
  if (role === "ADMIN" && inviter.role !== "OWNER") return { error: "Only the owner can add admins." }

  const store = await db.store.findUnique({ where: { id: storeId }, select: { name: true } })
  if (!store) return { error: "Store not found." }

  const user = await db.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
    select: { id: true },
  })

  let joined = false
  if (user) {
    const existing = await db.storeMember.findUnique({
      where: { storeId_userId: { storeId, userId: user.id } },
      select: { id: true },
    })
    if (existing) return { error: "This person is already on your team." }
    await db.storeMember.create({ data: { storeId, userId: user.id, role } })
    joined = true
  } else {
    await db.storeInvite.upsert({
      where: { storeId_email: { storeId, email } },
      update: { role, invitedById: inviter.id },
      create: { storeId, email, role, invitedById: inviter.id },
    })
  }

  try {
    const storeName = escapeHtml(store.name)
    await resend.emails.send({
      from: "Shopora <hello@shopora.space>",
      to: email,
      subject: `You've been added to ${store.name} on Shopora`,
      html: `
        <p>Hi,</p>
        <p>${escapeHtml(inviter.name || "The store owner")} added you to <strong>${storeName}</strong> on Shopora as ${role === "ADMIN" ? "an admin" : "staff"}.</p>
        <p>${
          joined
            ? `Log in with this email at <a href="https://www.shopora.space/login">shopora.space</a> or in the Shopora app to start.`
            : `Create your account with this email at <a href="https://www.shopora.space/signup">shopora.space/signup</a> or in the Shopora app, and the store will be waiting for you.`
        }</p>
      `,
    })
  } catch (err) {
    console.error("Failed to send team invite email", err)
  }

  return { success: true as const, joined }
}

/** Removes a teammate or a pending invite. The owner can't be removed, and only the owner can remove admins. */
export async function removeTeamEntry(
  storeId: string,
  actor: { id: string; role: StoreRole },
  target: { memberId?: string; inviteId?: string }
) {
  if (target.inviteId) {
    await db.storeInvite.deleteMany({ where: { id: target.inviteId, storeId } })
    return { success: true as const }
  }
  if (!target.memberId) return { error: "Nothing to remove." }

  const member = await db.storeMember.findFirst({ where: { id: target.memberId, storeId }, select: { userId: true, role: true } })
  if (!member) return { error: "Team member not found." }
  if (member.role === "OWNER") return { error: "The store owner can't be removed." }
  if (member.role === "ADMIN" && actor.role !== "OWNER") return { error: "Only the owner can remove admins." }
  if (member.userId === actor.id) return { error: "You can't remove yourself." }

  await db.storeMember.delete({ where: { id: target.memberId } })
  return { success: true as const }
}

/** Turns any invites for this email into store memberships. Safe to call on every login. */
export async function claimStoreInvites(userId: string, email: string | null | undefined) {
  if (!email) return
  try {
    const invites = await db.storeInvite.findMany({
      where: { email: { equals: email.trim(), mode: "insensitive" } },
      select: { id: true, storeId: true, role: true },
    })
    for (const invite of invites) {
      await db.storeMember.upsert({
        where: { storeId_userId: { storeId: invite.storeId, userId } },
        update: {},
        create: { storeId: invite.storeId, userId, role: invite.role },
      })
      await db.storeInvite.delete({ where: { id: invite.id } })
    }
  } catch (err) {
    console.error("Failed to claim store invites", err)
  }
}
