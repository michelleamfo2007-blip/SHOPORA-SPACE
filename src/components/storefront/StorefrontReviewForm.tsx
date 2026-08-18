"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Star } from "lucide-react"
import { submitStorefrontReviewAction } from "@/server/actions/reviews"

export function StorefrontReviewForm({ domain, productId }: { domain: string, productId?: string }) {
  const [rating, setRating] = useState(5)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [customerName, setCustomerName] = useState("")
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!customerName || !comment || !productId) return

    setIsSubmitting(true)
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
      alert("Failed to submit review. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!productId) return null; // We need a product to review

  if (isSuccess) {
    return (
      <div className="bg-emerald-50 text-emerald-700 p-6 rounded-2xl text-center">
        <h3 className="font-bold mb-2">Thank you for your review!</h3>
        <p className="text-sm">Your feedback has been submitted and is pending approval.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-slate-50 p-6 rounded-2xl text-left space-y-4">
      <h3 className="font-bold text-lg text-slate-900">How was your experience?</h3>
      
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Rating</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              type="button"
              key={star}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              onClick={() => setRating(star)}
              className="focus:outline-none transition-transform hover:scale-110"
            >
              <Star 
                className={`w-8 h-8 ${(hoveredRating || rating) >= star ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`} 
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Your Name</label>
        <Input 
          required 
          value={customerName} 
          onChange={e => setCustomerName(e.target.value)} 
          placeholder="e.g. Sarah J."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Review</label>
        <Textarea 
          required 
          value={comment} 
          onChange={e => setComment(e.target.value)} 
          placeholder="Tell us what you think..."
          rows={3}
        />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Submitting..." : "Submit Review"}
      </Button>
    </form>
  )
}
