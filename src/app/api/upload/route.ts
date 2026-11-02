import { createClient } from "@supabase/supabase-js"
import { getStoreAccess } from "@/lib/store-access"
import { MAX_UPLOAD_BYTES } from "@/lib/compress-image"

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"])

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

    if (!ALLOWED_TYPES.has(file.type) && !file.type.startsWith("image/")) {
      return Response.json({ error: "Only image files are allowed." }, { status: 400 })
    }

    // Vercel functions reject bodies over ~4.5MB — refuse clearly instead of a blank 413.
    if (file.size > MAX_UPLOAD_BYTES) {
      return Response.json(
        {
          error:
            "Image is too large for upload (max ~3.5MB after compression). Use a smaller photo.",
        },
        { status: 413 }
      )
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !serviceKey) {
      console.error("Missing Supabase upload env vars")
      return Response.json({ error: "Image storage is not configured." }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, serviceKey)

    const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg"
    const fileName = `media-${storeId}-${Date.now()}.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())

    const { error } = await supabase.storage.from("store-images").upload(fileName, buffer, {
      contentType: file.type || "image/jpeg",
      upsert: true,
    })

    if (error) {
      console.error("Supabase upload error:", error)
      return Response.json({ error: `Upload failed: ${error.message}` }, { status: 500 })
    }

    const { data: urlData } = supabase.storage.from("store-images").getPublicUrl(fileName)
    return Response.json({ url: urlData.publicUrl })
  } catch (err: any) {
    console.error("Upload error:", err)
    return Response.json({ error: err.message || "Internal server error" }, { status: 500 })
  }
}
