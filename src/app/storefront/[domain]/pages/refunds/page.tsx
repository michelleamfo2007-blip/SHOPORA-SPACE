import { notFound } from "next/navigation";
import { getStoreByHost } from "@/lib/tenant";

export default async function RefundsPage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params;
  const store = await getStoreByHost(domain);

  if (!store) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50 py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-6">
            Returns & Refunds Policy
          </h1>
          <div className="h-1 w-20 bg-slate-900 rounded-full mx-auto" style={{ backgroundColor: store.primaryColor || '#0f172a' }}></div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 md:p-12 space-y-8 prose prose-slate max-w-none">
          <p className="text-lg text-slate-600">
            At <strong>{store.name}</strong>, we strive to ensure you are completely satisfied with your purchase. If you are not entirely happy with your order, we're here to help.
          </p>

          <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4">1. Returns</h3>
          <p className="text-slate-600">
            You have 14 calendar days to return an item from the date you received it. To be eligible for a return, your item must be unused, in the same condition that you received it, and in its original packaging. You must also have the receipt or proof of purchase.
          </p>
          <p className="text-slate-600 italic">
            * Note: Certain items such as intimate apparel, custom orders, or final sale items cannot be returned due to hygiene and safety reasons.
          </p>

          <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4">2. Refunds</h3>
          <p className="text-slate-600">
            Once we receive your item, we will inspect it and notify you that we have received your returned item. We will immediately notify you on the status of your refund after inspecting the item.
            If your return is approved, we will initiate a refund to your original method of payment. You will receive the credit within a certain amount of days, depending on your card issuer's policies.
          </p>

          <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4">3. Shipping Returns</h3>
          <p className="text-slate-600">
            You will be responsible for paying for your own shipping costs for returning your item. Shipping costs are non-refundable. If you receive a refund, the cost of return shipping will be deducted from your refund.
          </p>

          <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4">4. Contact Us</h3>
          <p className="text-slate-600">
            If you have any questions on how to return your item to us, please contact our support team using the contact options in the footer.
          </p>
        </div>
      </div>
    </div>
  );
}
