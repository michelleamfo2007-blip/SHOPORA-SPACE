import { requireMobileVendor } from "@/lib/mobile-auth"
import { checkStoreSlug } from "@/lib/store-onboarding"

/** Live "is this store address free?" check while the seller types. */
export async function GET(req: Request) {
  const auth = await requireMobileVendor(req)
  if (auth.error !== undefined) return Response.json({ error: auth.error }, { status: auth.status })

  const raw = new URL(req.url).searchParams.get("slug") ?? ""
  const { slug, error } = await checkStoreSlug(raw)
  return Response.json({ slug, available: !error, reason: error })
}
