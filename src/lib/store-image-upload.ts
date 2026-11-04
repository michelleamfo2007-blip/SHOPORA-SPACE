import { createClient } from "@supabase/supabase-js"
import { MAX_UPLOAD_BYTES } from "@/lib/compress-image"

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"])

/** Saves a store image to Supabase storage. Callers must check store access first. */
export async function uploadStoreImage(
  storeId: string,
  file: File
): Promise<{ url: string } | { error: string; status: number }> {
  if (!ALLOWED_TYPES.has(file.type) && !file.type.startsWith("image/")) {
    return { error: "Only image files are allowed.", status: 400 }
  }

  // Vercel functions reject bodies over ~4.5MB — refuse clearly instead of a blank 413.
  if (file.size > MAX_UPLOAD_BYTES) {
    return {
      error: "Image is too large for upload (max ~3.5MB after compression). Use a smaller photo.",
      status: 413,
    }
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) {
    console.error("Missing Supabase upload env vars")
    return { error: "Image storage is not configured.", status: 500 }
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
    return { error: `Upload failed: ${error.message}`, status: 500 }
  }

  const { data: urlData } = supabase.storage.from("store-images").getPublicUrl(fileName)
  return { url: urlData.publicUrl }
}
