import { notFound } from "next/navigation"
import { getStoreByHost } from "@/lib/tenant"
import { db } from "@/lib/db"
import { CheckoutForm } from "./CheckoutForm"

export default async function CheckoutPage({ params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params;
  const store = await db.store.findUnique({ where: { slug: storeId } })
  if (!store) notFound()

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-8">
          Checkout
        </h1>
        <CheckoutForm storeId={store.id} currency={store.currency} />
      </div>
    </div>
  )
}
