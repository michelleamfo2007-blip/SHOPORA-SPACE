"use client";

import { useState, useRef, useCallback } from "react";
import { ImageIcon, FileVideo, Upload, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface MediaUploaderProps {
  storeId: string;
  currentMedia?: string | null;
  onUploaded: (url: string) => void;
  accept?: string;
  label?: string;
  type?: "image" | "video";
}

export function MediaUploader({ 
  storeId, 
  currentMedia, 
  onUploaded, 
  accept = "image/*", 
  label = "Click or drag & drop to upload",
  type = "image"
}: MediaUploaderProps) {
  const [preview, setPreview] = useState<string | null>(currentMedia || null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = useCallback(async (file: File) => {
    if (type === "image" && !file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }
    if (type === "video" && !file.type.startsWith("video/")) {
      toast.error("Please select a video file.");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast.error("File must be under 20MB.");
      return;
    }

    // Show local preview immediately
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setUploading(true);

    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("storeId", storeId);

      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "Upload failed");
      }

      onUploaded(data.url);
      toast.success("Media uploaded successfully!");
    } catch (err: any) {
      toast.error(err.message || "Upload failed. Please try again.");
      setPreview(currentMedia || null);
    } finally {
      setUploading(false);
    }
  }, [storeId, currentMedia, onUploaded, type]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) upload(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) upload(file);
  };

  const clear = () => {
    setPreview(null);
    onUploaded("");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="grid gap-2">
      <div
        className={`relative rounded-xl border-2 border-dashed transition-colors cursor-pointer overflow-hidden ${dragging ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-slate-400 bg-slate-50"} ${preview ? "h-48" : "h-36"}`}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && inputRef.current?.click()}
      >
        {preview ? (
          <>
            {type === "video" ? (
              <video
                src={preview}
                className="w-full h-full object-cover"
                controls
              />
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            )}
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <div className="flex items-center gap-2 text-white text-sm font-medium">
                <Upload className="w-4 h-4" />
                Change file
              </div>
            </div>
            {/* Clear button */}
            <button
              type="button"
              onClick={e => { e.stopPropagation(); clear(); }}
              className="absolute top-2 right-2 h-7 w-7 rounded-full bg-white/90 hover:bg-white text-slate-700 flex items-center justify-center shadow transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-slate-400 px-4 text-center">
            {type === "video" ? <FileVideo className="w-8 h-8" /> : <ImageIcon className="w-8 h-8" />}
            <p className="text-sm font-medium">{label}</p>
            <p className="text-xs">Max 20MB</p>
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
            <div className="flex items-center gap-2 text-white text-sm">
              <Loader2 className="w-5 h-5 animate-spin" />
              Uploading...
            </div>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
