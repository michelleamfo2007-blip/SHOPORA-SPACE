"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, Trash2, Star, Loader2, ImagePlus } from "lucide-react";
import { toast } from "sonner";

interface MultiImageUploaderProps {
  storeId: string;
  images: string[];
  onImagesChange: (images: string[]) => void;
}

export function MultiImageUploader({ storeId, images, onImagesChange }: MultiImageUploaderProps) {
  const [dragging, setDragging] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<{ id: string; file: File; objectUrl: string }[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFiles = useCallback(async (files: FileList | File[]) => {
    const validFiles = Array.from(files).filter(file => {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image file.`);
        return false;
      }
      if (file.size > 20 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 20MB limit.`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    // Create temp uploading states
    const newUploads = validFiles.map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      objectUrl: URL.createObjectURL(file)
    }));

    setUploadingFiles(prev => [...prev, ...newUploads]);

    // Upload files concurrently
    const uploadedUrls: string[] = [];
    
    await Promise.all(newUploads.map(async (uploadItem) => {
      try {
        const fd = new FormData();
        fd.append("file", uploadItem.file);
        fd.append("storeId", storeId);

        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await res.json();

        if (!res.ok || data.error) {
          throw new Error(data.error || "Upload failed");
        }

        uploadedUrls.push(data.url);
      } catch (err: any) {
        toast.error(`Failed to upload ${uploadItem.file.name}: ${err.message}`);
      } finally {
        setUploadingFiles(prev => prev.filter(u => u.id !== uploadItem.id));
      }
    }));

    if (uploadedUrls.length > 0) {
      onImagesChange([...images, ...uploadedUrls]);
      toast.success(`${uploadedUrls.length} image(s) uploaded successfully!`);
    }
  }, [storeId, images, onImagesChange]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      uploadFiles(e.target.files);
    }
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files) {
      uploadFiles(e.dataTransfer.files);
    }
  };

  const removeImage = (indexToRemove: number) => {
    const newImages = images.filter((_, index) => index !== indexToRemove);
    onImagesChange(newImages);
  };

  const setMainImage = (indexToMain: number) => {
    if (indexToMain === 0) return; // Already main
    const newImages = [...images];
    const temp = newImages[0];
    newImages[0] = newImages[indexToMain];
    newImages[indexToMain] = temp;
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
          <Upload className="w-5 h-5" />
        </div>
        <p className="text-sm font-semibold text-slate-900 mb-1">Drag & drop images here</p>
        <p className="text-sm text-slate-500">or click to browse files</p>
        <p className="text-xs text-slate-400 mt-4">PNG, JPG or WEBP • Maximum 20MB per image</p>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {(images.length > 0 || uploadingFiles.length > 0) && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((url, index) => (
            <div key={url} className="relative group rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm flex flex-col">
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

          {uploadingFiles.map((upload) => (
            <div key={upload.id} className="relative rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm flex flex-col opacity-60">
              <div className="relative aspect-[4/3] bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={upload.objectUrl} alt="Uploading..." className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                </div>
              </div>
              <div className="flex items-center justify-between p-2 bg-white invisible">
                <div className="w-4 h-4"></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
