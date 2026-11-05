import { db } from "@/lib/db"
import { resend } from "@/lib/resend"
import { DEFAULT_BRAND_COLOR } from "@/lib/store-brand"
import { TRIAL_PACKAGES, isTrialPackage, type PlanInterval } from "@/lib/plans"
import { featuresForPlan, normalizePlan } from "@/lib/plan-features"

const RESERVED_SLUGS = ["www", "api", "app", "admin", "super-admin", "mail", "ftp", "blog", "shop", "store", "checkout"]
const EARLY_BIRD_LIMIT = 15
export const STORE_CURRENCIES = ["GHS", "USD", "EUR", "GBP"]

/** Lowercase letters, numbers and single hyphens, e.g. "Ama's Closet" → "amas-closet". */
export function sanitizeStoreSlug(raw: string) {
  return raw
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-\s]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
}

/** Returns the cleaned slug, or an error if it can't be used as a store address. */
export async function checkStoreSlug(raw: string, ignoreStoreId?: string) {
  const slug = sanitizeStoreSlug(raw)
  if (!slug) return { slug, error: "Please enter a valid store URL containing only letters and numbers" }
  if (slug.startsWith("draft-")) return { slug, error: "This store URL is reserved and cannot be used" }
  if (RESERVED_SLUGS.includes(slug)) return { slug, error: "This store URL is reserved and cannot be used" }

  const existing = await db.store.findUnique({ where: { slug }, select: { id: true } })
  if (existing && existing.id !== ignoreStoreId) return { slug, error: "Store URL is already taken" }
  return { slug, error: null }
}

export async function findOrCreatePlan(planName: string, interval: string) {
  const safeInterval: PlanInterval = interval === "year" ? "year" : "month"
  const existing = await db.subscriptionPlan.findFirst({ where: { name: planName, interval: safeInterval } })
  if (existing) return existing

  const pkg = TRIAL_PACKAGES.find((p) => p.name === planName)
  return db.subscriptionPlan.create({
    data: {
      name: planName,
      price: pkg ? (safeInterval === "year" ? pkg.priceYearly : pkg.priceMonthly) : 0,
      currency: "GHS",
      interval: safeInterval,
    },
  })
}

/** 1-month free trial; the first stores get the early-bird flag. */
export async function startTrialSubscription(storeId: string, planId: string) {
  const endDate = new Date()
  endDate.setMonth(endDate.getMonth() + 1)
  const earlyBirdCount = await db.subscription.count({ where: { isEarlyBird: true } })

  await db.subscription.create({
    data: {
      storeId,
      planId,
      status: "TRIAL",
      currentPeriodEnd: endDate,
      isEarlyBird: earlyBirdCount < EARLY_BIRD_LIMIT,
    },
  })
  return endDate
}

export async function sendTrialStartedEmails(
  user: { name: string | null; email: string },
  planName: string,
  endDate: Date,
  { needsSetup }: { needsSetup: boolean }
) {
  try {
    await resend.emails.send({
      from: "Michelle from Shopora <billing@shopora.space>",
      to: user.email,
      subject: "Your Shopora 1-month free trial has started",
      html: `
        <p>Hi ${user.name || user.email.split("@")[0]},</p>
        <p>Your Shopora 1-month free trial has started!</p>
        <p>You currently have access to the ${planName} plan.</p>
        <p>Your trial ends on ${endDate.toLocaleDateString()}. After your 1-month trial, your subscription will need to be renewed manually to keep your store active.</p>
        ${
          needsSetup
            ? `<p>Click here to finish setting up your store:<br><a href="https://shopora.space/onboarding">https://shopora.space/onboarding</a></p>`
            : `<p>Your store is ready. Add products from the Shopora app or at <a href="https://shopora.space/login">shopora.space</a>.</p>`
        }
        <p>Best,<br>Michelle</p>
      `,
    })

    await resend.emails.send({
      from: "Shopora System <billing@shopora.space>",
      to: "shoporaspace@gmail.com",
      subject: "New Store Created / Trial Started",
      html: `
        <p>A new client has successfully created a store and started their trial!</p>
        <p><strong>Client:</strong> ${user.name} (${user.email})</p>
        <p><strong>Plan:</strong> ${planName}</p>
        <p>Log in to the Super Admin dashboard to view more details.</p>
      `,
    })
  } catch (err) {
    console.error("Failed to send trial start emails", err)
  }
}

type NewStoreInput = { name: string; slug: string; planName: string; interval: string; currency?: string }

/**
 * One-step store creation for the app: name + address + plan, trial started immediately.
 * If the seller abandoned the website's draft store, that draft is finished instead of duplicated.
 */
export async function createStoreWithTrial(userId: string, input: NewStoreInput) {
  const name = input.name.trim()
  if (name.length < 2) return { error: "Enter your store name." }
  if (!isTrialPackage(input.planName)) return { error: "Choose a plan to start your free month." }
  const currency = STORE_CURRENCIES.includes(input.currency ?? "") ? input.currency! : "GHS"

  const user = await db.user.findUnique({ where: { id: userId }, select: { name: true, email: true } })
  if (!user?.email) return { error: "Account not found." }

  const draft = await db.storeMember.findFirst({
    where: { userId, store: { slug: { startsWith: "draft-" } } },
    select: { storeId: true, store: { select: { subscription: { select: { id: true } } } } },
  })

  const { slug, error } = await checkStoreSlug(input.slug, draft?.storeId)
  if (error) return { error }

  const plan = await findOrCreatePlan(input.planName, input.interval)
  const storeSelect = { id: true, name: true, slug: true, currency: true, logoUrl: true } as const

  let store
  let endDate: Date | null = null
  if (draft) {
    store = await db.store.update({
      where: { id: draft.storeId },
      data: { name, slug, country: "GH", currency },
      select: storeSelect,
    })
    if (!draft.store.subscription) endDate = await startTrialSubscription(store.id, plan.id)
  } else {
    store = await db.store.create({
      data: {
        name,
        slug,
        country: "GH",
        currency,
        primaryColor: DEFAULT_BRAND_COLOR,
        members: { create: { userId, role: "OWNER" } },
      },
      select: storeSelect,
    })
    endDate = await startTrialSubscription(store.id, plan.id)
  }

  if (endDate) {
    await sendTrialStartedEmails({ name: user.name, email: user.email }, input.planName, endDate, { needsSetup: false })
  }
  const planName = normalizePlan(input.planName)
  return { store: { ...store, role: "OWNER" as const, plan: planName, features: featuresForPlan(planName) } }
}
