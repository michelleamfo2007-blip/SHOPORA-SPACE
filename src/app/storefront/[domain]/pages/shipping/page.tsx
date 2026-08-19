import { notFound } from "next/navigation";
import { getStoreByHost } from "@/lib/tenant";

export default async function ShippingPage({ params }: { params: Promise<{ domain: string }> }) {
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
            Shipping Policy
          </h1>
          <div className="h-1 w-20 bg-slate-900 rounded-full mx-auto" style={{ backgroundColor: store.primaryColor || '#0f172a' }}></div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 md:p-12 space-y-8 prose prose-slate max-w-none">
          <p className="text-lg text-slate-600">
            Thank you for shopping with <strong>{store.name}</strong>. We want to ensure your order reaches you safely and as quickly as possible. Please review our shipping policy below.
          </p>

          <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4">1. Order Processing Time</h3>
          <p className="text-slate-600">
            All orders are processed manually by our team after order confirmation. Processing typically takes 1-2 business days. Orders are not shipped or delivered on weekends or holidays. If we are experiencing a high volume of orders, shipments may be delayed by a few days. We will contact you directly if there will be a significant delay.
          </p>

          <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4">2. Shipping Rates & Delivery Estimates</h3>
          <p className="text-slate-600">
            Shipping charges for your order will be calculated and displayed at checkout. Delivery delays can occasionally occur due to unforeseen circumstances, weather, or carrier issues.
          </p>

          <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4">3. Shipment Confirmation</h3>
          <p className="text-slate-600">
            You will receive a confirmation message or email once your order has shipped, along with an estimated delivery window. 
          </p>

          <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4">4. Damages & Issues</h3>
          <p className="text-slate-600">
            <strong>{store.name}</strong> is not liable for any products damaged or lost during shipping. However, if you received your order damaged, please contact us immediately so we can help resolve the issue. Please save all packaging materials and damaged goods before filing a claim.
          </p>
        </div>
      </div>
    </div>
  );
}
