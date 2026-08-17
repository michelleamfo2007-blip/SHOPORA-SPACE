import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getStoreByHost } from "@/lib/tenant"
import { notFound } from "next/navigation"

export default async function CheckoutSuccessPage({ 
  params,
  searchParams 
}: { 
  params: { storeId: string },
  searchParams: { orderId?: string }
}) {
  const store = await getStoreByHost(params.storeId)
  if (!store) notFound()

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
      <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-sm">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Order Confirmed!</h1>
        <p className="text-slate-600 mb-6">
          Thank you for shopping at {store.name}. Your payment is being processed and your order will be shipped soon.
        </p>
        
        {searchParams.orderId && (
          <div className="bg-slate-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-slate-500 font-medium">Order Reference</p>
            <p className="font-mono text-slate-900">{searchParams.orderId}</p>
          </div>
        )}

        <Link href="/">
          <Button className="w-full">Continue Shopping</Button>
        </Link>
      </div>
    </div>
  )
}
