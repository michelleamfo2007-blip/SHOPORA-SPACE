"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { submitStorefrontReviewAction } from "@/server/actions/reviews"

const inputClass =
  "w-full border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-900 focus:outline-none"

export function StorefrontReviewForm({ domain, productId }: { domain: string, productId?: string }) {
  const [rating, setRating] = useState(5)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [customerName, setCustomerName] = useState("")
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!customerName || !comment || !productId) return

    setIsSubmitting(true)
    setError(null)
    try {
      await submitStorefrontReviewAction(domain, {
        customerName,
        rating,
        comment,
        productId
      })
      setIsSuccess(true)
    } catch (err) {
      console.error(err)
      setError("Your review could not be sent. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!productId) return null;

  if (isSuccess) {
    return (
      <div className="bg-[#f3efe8] p-8 text-center">
        <p className="font-display text-3xl">Thank you</p>
        <p className="mt-2 text-sm text-stone-600">Your review will appear once the store approves it.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 text-left">
      <h2 className="text-center font-display text-3xl">How was your experience?</h2>

      <div className="flex justify-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            type="button"
            key={star}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            onClick={() => setRating(star)}
            className="p-1 transition-transform hover:scale-110 focus:outline-none"
            aria-label={`${star} star${star > 1 ? "s" : ""}`}
          >
            <Star
              className={`h-7 w-7 ${(hoveredRating || rating) >= star ? "fill-stone-900 text-stone-900" : "text-stone-300"}`}
              strokeWidth={1.25}
            />
          </button>
        ))}
      </div>

      <input
        required
        value={customerName}
        onChange={e => setCustomerName(e.target.value)}
        placeholder="Your name"
        aria-label="Your name"
        className={inputClass}
      />
      <textarea
        required
        value={comment}
        onChange={e => setComment(e.target.value)}
        placeholder="Tell us what you think"
        aria-label="Your review"
        rows={3}
        className={inputClass}
      />

      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="h-12 rounded-full border border-stone-900 text-sm tracking-wide text-stone-900 transition-colors hover:bg-stone-900 hover:text-white disabled:opacity-60"
      >
        {isSubmitting ? "Sending..." : "Send review"}
      </button>
    </form>
  )
}
