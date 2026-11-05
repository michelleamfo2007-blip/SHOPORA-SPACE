"use client"

import { useState } from "react"
import { Check, Copy, Download, MessageCircle } from "lucide-react"
import { toast } from "sonner"

type Kit = {
  name: string
  link: string
  caption: string
  isLive: boolean
  images: { format: string; label: string; url: string }[]
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [done, setDone] = useState(false)
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(text)
        setDone(true)
        toast.success(`${label} copied`)
        setTimeout(() => setDone(false), 1500)
      }}
      className="inline-flex h-10 items-center gap-2 rounded-full border border-stone-300 bg-white px-4 text-sm font-medium text-stone-900 hover:bg-stone-50"
    >
      {done ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} Copy {label.toLowerCase()}
    </button>
  )
}

export function ShareActions({ kit }: { kit: Kit }) {
  const [caption, setCaption] = useState(kit.caption)

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      <div className="grid grid-cols-2 gap-4">
        {kit.images.map(({ url, ...img }) => ({ ...img, url: new URL(url).pathname + new URL(url).search })).map((img) => (
          <figure key={img.format} className="space-y-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.url}
              alt={`${kit.name} – ${img.label}`}
              className={`w-full rounded-xl border border-stone-200 bg-stone-100 object-cover ${img.format === "story" ? "aspect-[9/16]" : "aspect-square"}`}
            />
            <figcaption className="text-xs text-stone-500">{img.label}</figcaption>
            <a
              href={img.url}
              download={`${kit.name}-${img.format}.png`}
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-stone-950 px-4 text-xs font-medium text-white hover:bg-stone-800"
            >
              <Download className="h-3.5 w-3.5" /> Download
            </a>
          </figure>
        ))}
      </div>

      <div className="space-y-4 rounded-2xl border border-stone-200 bg-white p-5">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-stone-500">Product link</p>
          <p className="mt-1 break-all text-sm text-stone-900">{kit.link}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-stone-500">Caption (edit if you like)</p>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={9}
            className="mt-1 w-full rounded-lg border border-stone-200 p-3 text-sm leading-relaxed"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <CopyButton text={caption} label="Caption" />
          <CopyButton text={kit.link} label="Link" />
          <a
            href={`https://wa.me/?text=${encodeURIComponent(caption)}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 items-center gap-2 rounded-full bg-emerald-600 px-4 text-sm font-medium text-white hover:bg-emerald-700"
          >
            <MessageCircle className="h-4 w-4" /> Send on WhatsApp
          </a>
        </div>
        <p className="text-xs text-stone-500">
          For WhatsApp Status or Instagram Stories: download the tall image, post it, and paste the caption.
        </p>
      </div>
    </div>
  )
}
