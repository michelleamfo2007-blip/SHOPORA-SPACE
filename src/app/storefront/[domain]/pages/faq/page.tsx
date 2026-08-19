import { notFound } from "next/navigation";
import { getStoreByHost } from "@/lib/tenant";
import { headers } from "next/headers";

export default async function FAQPage({ params }: { params: Promise<{ domain: string }> }) {
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
            Frequently Asked Questions
          </h1>
          <div className="h-1 w-20 bg-slate-900 rounded-full mx-auto" style={{ backgroundColor: store.primaryColor || '#0f172a' }}></div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 md:p-12 space-y-8">
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">How do I place an order?</h3>
            <p className="text-slate-600 leading-relaxed">
              Simply browse our products, select your desired items and quantities, and click "Add to Cart". When you're ready, click the shopping cart icon in the top right corner and proceed to checkout to complete your delivery and payment details.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">What payment methods do you accept?</h3>
            <p className="text-slate-600 leading-relaxed">
              We offer secure online payments and, depending on your region, manual payment options. You will see all available payment methods for your specific order during the checkout process.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">How long will delivery take?</h3>
            <p className="text-slate-600 leading-relaxed">
              Delivery times vary depending on your location and the shipping method selected at checkout. Typically, standard deliveries take 3-5 business days. You will receive an estimated delivery window when your order is confirmed.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Can I track my order?</h3>
            <p className="text-slate-600 leading-relaxed">
              Currently, our team processes orders manually to ensure the highest quality control. If you have questions about your specific order status, please reach out to us directly via the contact options at the bottom of the page or via WhatsApp if available!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
