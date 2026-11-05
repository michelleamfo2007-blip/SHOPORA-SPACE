import { requireMobileStoreAccess } from "@/lib/mobile-auth"
import { getShareKit } from "@/lib/share-kit"

export async function GET(req: Request, { params }: { params: Promise<{ storeId: string; productId: string }> }) {
  const { storeId, productId } = await params
  const access = await requireMobileStoreAccess(req, storeId)
  if ("error" in access) return Response.json({ error: access.error }, { status: access.status })

  const kit = await getShareKit(storeId, productId)
  if (!kit) return Response.json({ error: "Product not found." }, { status: 404 })
  return Response.json(kit)
}
