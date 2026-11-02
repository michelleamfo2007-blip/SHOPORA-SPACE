/** Client-side image shrink so uploads stay under Vercel's ~4.5MB body limit. */

export const MAX_PRODUCT_IMAGES = 2
/** Soft target after compression (bytes). */
export const MAX_UPLOAD_BYTES = 3.5 * 1024 * 1024
const MAX_EDGE = 1600

export async function compressImageForUpload(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file
  // Already small enough — keep original
  if (file.size <= MAX_UPLOAD_BYTES && file.type !== "image/heic" && file.type !== "image/heif") {
    return file
  }

  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height))
  const width = Math.max(1, Math.round(bitmap.width * scale))
  const height = Math.max(1, Math.round(bitmap.height * scale))

  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d")
  if (!ctx) return file
  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  let quality = 0.82
  let blob: Blob | null = null
  for (let i = 0; i < 5; i++) {
    blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", quality)
    )
    if (!blob) break
    if (blob.size <= MAX_UPLOAD_BYTES) break
    quality -= 0.12
  }

  if (!blob) return file

  const base = file.name.replace(/\.[^.]+$/, "") || "image"
  return new File([blob], `${base}.jpg`, { type: "image/jpeg", lastModified: Date.now() })
}
