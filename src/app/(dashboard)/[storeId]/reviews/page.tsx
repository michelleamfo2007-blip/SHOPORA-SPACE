import { db } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ReviewVisibilityToggle, DeleteReviewButton, AddManualReviewModal } from "./ReviewsClient"
import { Star } from "lucide-react"
export default async function ReviewsPage({
  params
}: {
  params: Promise<{ storeId: string }>
}) {
  const { storeId } = await params

  const reviews = await db.review.findMany({
    where: { storeId },
    include: { product: true, customer: true },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <Star className="w-8 h-8 text-amber-500 fill-amber-500" />
            Product Reviews
          </h2>
          <p className="text-slate-500 mt-1">Monitor and manage customer feedback.</p>
        </div>
        <AddManualReviewModal storeId={storeId} />
      </div>

      <Card className="border-0 shadow-sm bg-white overflow-hidden rounded-xl">
        <CardHeader className="px-6 py-5 border-b border-slate-100 bg-slate-50/30">
          <CardTitle className="text-lg font-bold text-slate-900">Customer Reviews</CardTitle>
          <p className="text-sm text-slate-500 mt-1">Reviews are automatically published. You can hide inappropriate reviews from your storefront.</p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs font-bold text-slate-400 bg-slate-50/50 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Rating</th>
                  <th className="px-6 py-4 w-1/3">Comment</th>
                  <th className="px-6 py-4">Visibility</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reviews.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-medium">
                      No reviews found.
                    </td>
                  </tr>
                ) : (
                  reviews.map((review) => (
                    <tr key={review.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4 font-bold text-slate-900">{review.product.name}</td>
                      <td className="px-6 py-4 font-semibold text-slate-600">{review.customer?.name || "Anonymous"}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-amber-500">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < review.rating ? "fill-current" : "text-slate-200 fill-slate-200"}`} />
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 italic">
                        {review.comment || <span className="text-slate-400">No comment</span>}
                      </td>
                      <td className="px-6 py-4">
                        <ReviewVisibilityToggle storeId={storeId} reviewId={review.id} initialIsHidden={review.status === "HIDDEN"} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <DeleteReviewButton storeId={storeId} reviewId={review.id} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
