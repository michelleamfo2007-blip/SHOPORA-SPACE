import { db } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Star } from "lucide-react"
import { ReviewVisibilityToggle, DeleteReviewButton, AddManualReviewModal } from "./ReviewsClient"

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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Product Reviews</h2>
          <p className="text-muted-foreground">Monitor and manage customer feedback.</p>
        </div>
        <AddManualReviewModal storeId={storeId} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Reviews</CardTitle>
          <CardDescription>
            Reviews are automatically published. You can hide inappropriate reviews from your storefront.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead className="w-1/3">Comment</TableHead>
                  <TableHead>Visibility</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviews.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No reviews found.
                    </TableCell>
                  </TableRow>
                ) : (
                  reviews.map((review) => (
                    <TableRow key={review.id}>
                      <TableCell className="font-medium">{review.product.name}</TableCell>
                      <TableCell>{review.customer?.name || "Anonymous"}</TableCell>
                      <TableCell>
                        <div className="flex items-center text-amber-500">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < review.rating ? "fill-current" : "text-slate-300"}`} />
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {review.comment || <span className="italic">No comment</span>}
                      </TableCell>
                      <TableCell>
                        <ReviewVisibilityToggle storeId={storeId} reviewId={review.id} initialIsHidden={review.status === "HIDDEN"} />
                      </TableCell>
                      <TableCell className="text-right">
                        <DeleteReviewButton storeId={storeId} reviewId={review.id} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
