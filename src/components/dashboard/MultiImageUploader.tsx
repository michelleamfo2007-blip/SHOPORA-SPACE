"use client";

import { useState, useRef } from "react";
import { Upload, Trash2, Star, Loader2 } from "lucide-react";

interface MultiImageUploaderProps {
  storeId: string;
  images: string[];
  onImagesChange: (images: string[]) => void;
}

export function MultiImageUploader({ storeId, images, onImagesChange }: MultiImageUploaderProps) {
  const [dragging, setDragging] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [uploadingPreviews, setUploadingPreviews] = useState<{ id: string; objectUrl: string }[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFiles = async (files: FileList | File[]) => {
    const validFiles = Array.from(files).filter(file => {
      if (file.size > 20 * 1024 * 1024) {
        alert(`"${file.name}" is too large. Maximum size is 20MB.`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    // Show previews immediately
    const previews = validFiles.map(file => ({
      id: Math.random().toString(36).substring(7),
      objectUrl: URL.createObjectURL(file)
    }));
    setUploadingPreviews(prev => [...prev, ...previews]);
    setUploadingCount(prev => prev + validFiles.length);

    const uploadedUrls: string[] = [];

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      const previewId = previews[i].id;

      try {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("storeId", storeId);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: fd,
          credentials: "include",
        });

        if (!res.ok) {
          const text = await res.text();
          console.error("Upload failed:", res.status, text);
          alert(`Upload failed for "${file.name}": ${text || res.statusText}`);
          continue;
        }

        const data = await res.json();
        if (data.error) {
          alert(`Upload failed for "${file.name}": ${data.error}`);
          continue;
        }

        uploadedUrls.push(data.url);
      } catch (err: any) {
        console.error("Upload error:", err);
        alert(`Upload error for "${file.name}": ${err.message}`);
      } finally {
        setUploadingPreviews(prev => prev.filter(p => p.id !== previewId));
        setUploadingCount(prev => prev - 1);
      }
    }

    if (uploadedUrls.length > 0) {
      onImagesChange([...images, ...uploadedUrls]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFiles(e.target.files);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadFiles(e.dataTransfer.files);
    }
  };

  const removeImage = (indexToRemove: number) => {
    const newImages = images.filter((_, i) => i !== indexToRemove);
    onImagesChange(newImages);
  };

  const setMainImage = (indexToMain: number) => {
    if (indexToMain === 0) return;
    const newImages = [...images];
    const [main] = newImages.splice(indexToMain, 1);
    newImages.unshift(main);
    onImagesChange(newImages);
  };

  return (
    <div className="grid gap-6">
      <div
        className={`relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl transition-colors cursor-pointer ${
          dragging ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-slate-400 bg-slate-50"
        }`}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <div className="h-12 w-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-4 text-slate-600">
          {uploadingCount > 0 ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
        </div>
        <p className="text-sm font-semibold text-slate-900 mb-1">
          {uploadingCount > 0 ? `Uploading ${uploadingCount} image(s)...` : "Drag & drop images here"}
        </p>
        <p className="text-sm text-slate-500">or click to browse files</p>
        <p className="text-xs text-slate-400 mt-4">PNG, JPG or WEBP • Maximum 20MB per image</p>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileChange}
          onClick={(e) => { (e.target as HTMLInputElement).value = ""; }}
        />
      </div>

      {(images.length > 0 || uploadingPreviews.length > 0) && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((url, index) => (
            <div key={url} className="relative rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm flex flex-col">
              <div className="relative aspect-[4/3] bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`Product image ${index + 1}`} className="w-full h-full object-cover" />
                {index === 0 && (
                  <div className="absolute top-2 left-2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded">
                    MAIN IMAGE
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between p-2 bg-white">
                <button
                  type="button"
                  onClick={() => setMainImage(index)}
                  className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${index === 0 ? "text-slate-900" : "text-slate-400 hover:text-slate-600"}`}
                >
                  <Star className={`w-3.5 h-3.5 ${index === 0 ? "fill-slate-900" : ""}`} />
                  Main
                </button>
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                  title="Remove image"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}

          {uploadingPreviews.map((preview) => (
            <div key={preview.id} className="relative rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm flex flex-col opacity-60">
              <div className="relative aspect-[4/3] bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview.objectUrl} alt="Uploading..." className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                </div>
              </div>
              <div className="flex items-center p-2 bg-white">
                <span className="text-xs text-slate-400">Uploading...</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
