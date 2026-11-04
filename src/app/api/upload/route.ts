import { getStoreAccess } from "@/lib/store-access"
import { uploadStoreImage } from "@/lib/store-image-upload"

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const storeId = formData.get("storeId") as string | null

    if (!file || !storeId) {
      return Response.json({ error: "File and storeId are required" }, { status: 400 })
    }

    const access = await getStoreAccess(storeId)
    if ("error" in access) {
      return Response.json({ error: access.error }, { status: access.status })
    }

    const result = await uploadStoreImage(storeId, file)
    if ("error" in result) return Response.json({ error: result.error }, { status: result.status })
    return Response.json({ url: result.url })
  } catch (err: any) {
    console.error("Upload error:", err)
    return Response.json({ error: err.message || "Internal server error" }, { status: 500 })
  }
}
