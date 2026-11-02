"use client"

import { useState, useRef } from "react"
import { Upload, Trash2, Star, Loader2 } from "lucide-react"
import {
  compressImageForUpload,
  MAX_PRODUCT_IMAGES,
  MAX_UPLOAD_BYTES,
} from "@/lib/compress-image"

interface MultiImageUploaderProps {
  storeId: string
  images: string[]
  onImagesChange: (images: string[]) => void
  maxImages?: number
}

export function MultiImageUploader({
  storeId,
  images,
  onImagesChange,
  maxImages = MAX_PRODUCT_IMAGES,
}: MultiImageUploaderProps) {
  const [dragging, setDragging] = useState(false)
  const [uploadingCount, setUploadingCount] = useState(0)
  const [uploadingPreviews, setUploadingPreviews] = useState<{ id: string; objectUrl: string }[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const slotsLeft = Math.max(0, maxImages - images.length - uploadingCount)
  const atLimit = slotsLeft <= 0

  const uploadFiles = async (files: FileList | File[]) => {
    if (atLimit) {
      alert(`You can upload up to ${maxImages} images per product.`)
      return
    }

    const picked = Array.from(files).filter((file) => {
      if (!file.type.startsWith("image/")) {
        alert(`"${file.name}" is not an image.`)
        return false
      }
      return true
    })

    const limited = picked.slice(0, slotsLeft)
    if (picked.length > limited.length) {
      alert(`Only ${maxImages} images allowed per product. Extra files were skipped.`)
    }
    if (limited.length === 0) return

    const previews = limited.map((file) => ({
      id: Math.random().toString(36).substring(7),
      objectUrl: URL.createObjectURL(file),
    }))
    setUploadingPreviews((prev) => [...prev, ...previews])
    setUploadingCount((prev) => prev + limited.length)

    const uploadedUrls: string[] = []

    for (let i = 0; i < limited.length; i++) {
      const file = limited[i]
      const previewId = previews[i].id

      try {
        const prepared = await compressImageForUpload(file)
        if (prepared.size > MAX_UPLOAD_BYTES) {
          alert(
            `"${file.name}" is still too large after compression. Try a smaller photo (under ~4MB).`
          )
          continue
        }

        const fd = new FormData()
        fd.append("file", prepared)
        fd.append("storeId", storeId)

        const res = await fetch("/api/upload", {
          method: "POST",
          body: fd,
          credentials: "include",
        })

        if (!res.ok) {
          const text = await res.text()
          console.error("Upload failed:", res.status, text)
          alert(`Upload failed for "${file.name}": ${text || res.statusText}`)
          continue
        }

        const data = await res.json()
        if (data.error) {
          alert(`Upload failed for "${file.name}": ${data.error}`)
          continue
        }

        uploadedUrls.push(data.url)
      } catch (err: any) {
        console.error("Upload error:", err)
        alert(`Upload error for "${file.name}": ${err.message}`)
      } finally {
        setUploadingPreviews((prev) => {
          const hit = prev.find((p) => p.id === previewId)
          if (hit) URL.revokeObjectURL(hit.objectUrl)
          return prev.filter((p) => p.id !== previewId)
        })
        setUploadingCount((prev) => prev - 1)
      }
    }

    if (uploadedUrls.length > 0) {
      onImagesChange([...images, ...uploadedUrls].slice(0, maxImages))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFiles(e.target.files)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadFiles(e.dataTransfer.files)
    }
  }

  const removeImage = (indexToRemove: number) => {
    onImagesChange(images.filter((_, i) => i !== indexToRemove))
  }

  const setMainImage = (indexToMain: number) => {
    if (indexToMain === 0) return
    const next = [...images]
    const [main] = next.splice(indexToMain, 1)
    next.unshift(main)
    onImagesChange(next)
  }

  return (
    <div className="grid gap-6">
      {!atLimit ? (
        <div
          className={`relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl transition-colors cursor-pointer ${
            dragging ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-slate-400 bg-slate-50"
          }`}
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm">
            {uploadingCount > 0 ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
          </div>
          <p className="mb-1 text-sm font-semibold text-slate-900">
            {uploadingCount > 0 ? `Uploading ${uploadingCount} image(s)...` : "Drag & drop images here"}
          </p>
          <p className="text-sm text-slate-500">or click to browse files</p>
          <p className="mt-4 text-xs text-slate-400">
            PNG, JPG or WEBP · Up to {maxImages} images · Large photos are compressed automatically
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {images.length}/{maxImages} used · {slotsLeft} remaining
          </p>

          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            className="hidden"
            onChange={handleFileChange}
            onClick={(e) => {
              ;(e.target as HTMLInputElement).value = ""
            }}
          />
        </div>
      ) : (
        <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Maximum of {maxImages} images per product. Remove one to upload another.
        </p>
      )}

      {(images.length > 0 || uploadingPreviews.length > 0) && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {images.map((url, index) => (
            <div
              key={url}
              className="relative flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="relative aspect-[4/3] bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`Product image ${index + 1}`} className="h-full w-full object-cover" />
                {index === 0 && (
                  <div className="absolute left-2 top-2 rounded bg-slate-900 px-2 py-1 text-[10px] font-bold text-white">
                    MAIN IMAGE
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between bg-white p-2">
                <button
                  type="button"
                  onClick={() => setMainImage(index)}
                  className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
                    index === 0 ? "text-slate-900" : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  <Star className={`h-3.5 w-3.5 ${index === 0 ? "fill-slate-900" : ""}`} />
                  Main
                </button>
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
                  title="Remove image"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}

          {uploadingPreviews.map((preview) => (
            <div
              key={preview.id}
              className="relative flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white opacity-60 shadow-sm"
            >
              <div className="relative aspect-[4/3] bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview.objectUrl} alt="Uploading..." className="h-full w-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                </div>
              </div>
              <div className="bg-white p-2">
                <span className="text-xs text-slate-400">Uploading...</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
