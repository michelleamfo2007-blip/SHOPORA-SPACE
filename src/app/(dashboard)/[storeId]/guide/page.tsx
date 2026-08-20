import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"

export default function GuidePage() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Vendor Launch Guide</h1>
        <p className="text-slate-500">Welcome to your new online space. ✨</p>
      </div>

      <Card>
        <CardContent className="pt-6 prose prose-slate max-w-none">
          <p>
            Thank you for choosing Shopora Space to take your business online. This guide will walk you through everything you need to know to set up your store, add your products, receive orders, and get your store ready for customers.
          </p>

          <hr className="my-8 border-slate-200" />

          <h3>1. Choose Your Shopora Package</h3>
          <p>Before creating your store, select the package that works best for your business.</p>
          <ul>
            <li><strong>Shopora Space — GHS 150/month</strong></li>
          </ul>
          <p>Your subscription gives you access to your Shopora store and vendor dashboard. You'll also receive a 7-day free trial when you start.</p>

          <hr className="my-8 border-slate-200" />

          <h3>2. Create Your Account</h3>
          <p>After selecting your package:</p>
          <ol>
            <li>Create your Shopora account.</li>
            <li>Enter your business information.</li>
            <li>Choose your store name.</li>
            <li>Complete your registration.</li>
            <li>Access your vendor dashboard.</li>
          </ol>
          <p>Your store will have its own Shopora address: <code>yourstorename.shopora.space</code></p>

          <hr className="my-8 border-slate-200" />

          <h3>3. Set Up Your Store</h3>
          <p>From your vendor dashboard, add your business information. Make sure you add:</p>
          <ul>
            <li>Business/store name</li>
            <li>Logo</li>
            <li>Store description</li>
            <li>Contact information</li>
            <li>Social media links</li>
            <li>Store location</li>
            <li>Business hours, if applicable</li>
            <li>Store banner/cover image</li>
          </ul>
          <p><strong>Tip:</strong> Keep your branding consistent so your storefront looks professional.</p>

          <hr className="my-8 border-slate-200" />

          <h3>4. Add Your Products</h3>
          <p>Add the products you want customers to see in your store. For each product, include:</p>
          <ul>
            <li>Product name</li>
            <li>High-quality product photos</li>
            <li>Price</li>
            <li>Product description</li>
            <li>Category</li>
            <li>Available quantity</li>
            <li>Sizes or variants, if applicable</li>
            <li>Product options, if applicable</li>
          </ul>
          <p><strong>Tip:</strong> Use clear, well-lit product photos and accurate descriptions. This helps customers feel confident when shopping.</p>

          <hr className="my-8 border-slate-200" />

          <h3>5. Organize Your Store</h3>
          <p>Create product categories so customers can easily find what they're looking for. Choose categories that make sense for your business, for example:</p>
          <ul>
            <li><strong>Fashion:</strong> Dresses, Tops, Trousers</li>
            <li><strong>Beauty:</strong> Wigs, Hair, Skincare</li>
            <li><strong>Accessories:</strong> Bags, Shoes, Jewelry</li>
          </ul>

          <hr className="my-8 border-slate-200" />

          <h3>6. Set Your Delivery & Store Policies</h3>
          <p>Before launching, make sure customers know how your business handles orders. Add your:</p>
          <ul>
            <li>Delivery options</li>
            <li>Delivery fees</li>
            <li>Delivery areas</li>
            <li>Pickup information, if available</li>
            <li>Processing times</li>
            <li>Return, Refund, and Exchange policies</li>
          </ul>
          <p>Be clear and transparent so customers know what to expect.</p>

          <hr className="my-8 border-slate-200" />

          <h3>7. Set Up Customer Payments</h3>
          <p>Shopora provides the online storefront and order management system. Your customers will place their orders through your Shopora store.</p>
          <p>Make sure your preferred payment instructions are clearly available to customers so they know how to complete payment for their order.</p>
          <p className="text-amber-600 bg-amber-50 p-3 rounded border border-amber-200">
            <strong>Important:</strong> Always confirm that payment has been received before processing an order.
          </p>

          <hr className="my-8 border-slate-200" />

          <h3>8. Customize Your Store</h3>
          <p>Make your storefront feel like your brand. You can customize your store with your Brand logo, Brand images, Product photos, Store description, Categories, Contact information, and Social media links.</p>
          <p>Your Shopora store should feel like an extension of your existing business.</p>

          <hr className="my-8 border-slate-200" />

          <h3>9. Preview Your Store</h3>
          <p>Before sharing your store with customers, preview it as a customer would. Check:</p>
          <ul>
            <li>Product images and Prices</li>
            <li>Product descriptions and Categories</li>
            <li>Contact and Delivery information</li>
            <li>Payment instructions and Store branding</li>
            <li>Mobile appearance</li>
          </ul>
          <p>Make sure everything looks correct.</p>

          <hr className="my-8 border-slate-200" />

          <h3>10. Launch Your Store 🎉</h3>
          <p>Once everything is ready, your store can go live. Share your unique store link with your customers: <code>yourstorename.shopora.space</code></p>
          <p>You can add it to your Instagram bio, TikTok bio, WhatsApp, Facebook, Business cards, Flyers, and other marketing platforms. Your customers can now visit your store and shop from your own online space.</p>

          <hr className="my-8 border-slate-200" />

          <h3>11. Managing Your Orders</h3>
          <p>When a customer places an order, you'll be able to view it from your vendor dashboard. You can use your dashboard to:</p>
          <ul>
            <li>View new orders and customer information</li>
            <li>Review order details and update order status</li>
            <li>Track your orders and manage completed orders</li>
          </ul>
          <p>Keep your order status updated so customers know what is happening with their purchase.</p>

          <hr className="my-8 border-slate-200" />

          <h3>12. Managing Your Products</h3>
          <p>Your vendor dashboard allows you to keep your store up to date. Remember to:</p>
          <ul>
            <li>Update prices when necessary</li>
            <li>Update product availability and adjust inventory</li>
            <li>Add new products and remove unavailable products</li>
            <li>Update product information</li>
          </ul>
          <p>Keeping your store updated gives customers an accurate shopping experience.</p>

          <hr className="my-8 border-slate-200" />

          <h3>13. Your 7-Day Free Trial ⏳</h3>
          <p>When you create your Shopora store, your 7-day free trial begins. During your trial, you can set up your store, add your products, customize your storefront, test your dashboard, and prepare your store for customers.</p>
          <p>After your 7-day trial ends, your selected Shopora package will need to be paid for to continue using the service.</p>

          <hr className="my-8 border-slate-200" />

          <h3>14. Before You Launch — Checklist ✅</h3>
          <ul className="list-none pl-0 space-y-2">
            {[
              "Package selected", "Account created", "Store name set", "Logo uploaded",
              "Store description added", "Contact information added", "Products uploaded",
              "Prices checked", "Product photos checked", "Categories organized",
              "Inventory checked", "Delivery information added", "Return/refund policy added",
              "Payment instructions added", "Store previewed", "Store link tested", "Store ready to share 🎉"
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <hr className="my-8 border-slate-200" />

          <h3>15. Need Help?</h3>
          <p>If you need assistance setting up your Shopora store, please contact the Shopora Space support team. We're here to help you get your business online and make the most of your Shopora store. 🤍</p>

          <div className="mt-12 text-center p-8 bg-slate-50 rounded-xl border border-slate-100">
            <h2 className="mt-0 text-xl font-bold">Welcome to Shopora Space ✨</h2>
            <p className="text-slate-600 mb-0">Your Business. Your Store. Your Space.</p>
            <p className="text-slate-600">We're excited to have you here.<br/>— Shopora Space</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
