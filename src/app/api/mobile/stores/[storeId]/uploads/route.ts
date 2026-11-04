import { requireMobileStoreAccess } from "@/lib/mobile-auth"
import { uploadStoreImage } from "@/lib/store-image-upload"

export async function POST(req: Request, { params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params
  const access = await requireMobileStoreAccess(req, storeId)
  if ("error" in access) return Response.json({ error: access.error }, { status: access.status })

  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    if (!file) return Response.json({ error: "Choose a photo to upload." }, { status: 400 })

    const result = await uploadStoreImage(storeId, file)
    if ("error" in result) return Response.json({ error: result.error }, { status: result.status })
    return Response.json({ url: result.url })
  } catch (err) {
    console.error("[MOBILE_UPLOAD]", err)
    return Response.json({ error: "Could not upload this photo. Try again." }, { status: 500 })
  }
}
