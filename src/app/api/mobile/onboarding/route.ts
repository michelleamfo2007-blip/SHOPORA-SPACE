import { requireMobileVendor } from "@/lib/mobile-auth"
import { TRIAL_PACKAGES } from "@/lib/plans"
import { STORE_CURRENCIES, createStoreWithTrial } from "@/lib/store-onboarding"

/** Plans and currencies the app shows on the "Create your store" screen. */
export async function GET(req: Request) {
  const auth = await requireMobileVendor(req)
  if (auth.error !== undefined) return Response.json({ error: auth.error }, { status: auth.status })
  return Response.json({ packages: TRIAL_PACKAGES, currencies: STORE_CURRENCIES })
}

/** Creates the seller's store and starts the 1-month free trial on the chosen plan. */
export async function POST(req: Request) {
  const auth = await requireMobileVendor(req)
  if (auth.error !== undefined) return Response.json({ error: auth.error }, { status: auth.status })

  try {
    const body = await req.json().catch(() => ({}))
    const result = await createStoreWithTrial(auth.user.id, {
      name: String(body.name ?? ""),
      slug: String(body.slug ?? ""),
      planName: String(body.planName ?? ""),
      interval: String(body.interval ?? "month"),
      currency: String(body.currency ?? "GHS"),
    })
    if ("error" in result) return Response.json({ error: result.error }, { status: 400 })
    return Response.json(result)
  } catch (err) {
    console.error("[MOBILE_CREATE_STORE]", err)
    const taken = (err as { code?: string })?.code === "P2002"
    return Response.json(
      { error: taken ? "Store URL is already taken" : "Could not create your store. Try again." },
      { status: taken ? 409 : 500 }
    )
  }
}
