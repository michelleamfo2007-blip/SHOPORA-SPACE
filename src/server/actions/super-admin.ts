"use server"

import { db } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/auth"
import { revalidatePath } from "next/cache"
import { StoreStatus } from "@prisma/client"

export async function toggleStoreStatusAction(storeId: string, currentStatus: StoreStatus) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const user = await db.user.findUnique({ where: { id: session.user.id } })
  if (user?.platformRole !== "SUPER_ADMIN") {
    throw new Error("Unauthorized: Only Super Admins can perform this action.")
  }

  const newStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE"

  await db.store.update({
    where: { id: storeId },
    data: { status: newStatus }
  })

  revalidatePath("/super-admin/moderation")
  
  return { success: true, newStatus }
}

import { resend } from "@/lib/resend"

export async function approveWaitlistAction(entryId: string) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const user = await db.user.findUnique({ where: { id: session.user.id } })
  if (user?.platformRole !== "SUPER_ADMIN") {
    throw new Error("Unauthorized: Only Super Admins can perform this action.")
  }

  const entry = await db.waitlistEntry.update({
    where: { id: entryId },
    data: { status: "INVITED" }
  })

  // Send the invite email
  try {
    const { data, error } = await resend.emails.send({
      from: "Michelle from Shopora <customersupport@shopora.space>",
      to: entry.email,
      subject: "Your Shopora Space application has been approved 🎉",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #334155;">
          <h2 style="color: #0f172a; margin-bottom: 5px;">Shopora Space</h2>
          <h3 style="color: #475569; margin-top: 0;">Vendor Launch Guide</h3>
          <p>Welcome to your new online space. ✨</p>
          <p>Thank you for choosing Shopora Space to take your business online. This guide will walk you through everything you need to know to set up your store, add your products, receive orders, and get your store ready for customers.</p>
          
          <p><strong>Get started here:</strong> <a href="https://shopora.space/signup" style="color: #2563eb;">https://shopora.space/signup</a></p>

          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <h3 style="color: #0f172a;">1. Choose Your Shopora Package</h3>
          <p>Before creating your store, select the package that works best for your business.</p>
          <ul>
            <li><strong>Shopora Space — GHS 150/month</strong></li>
          </ul>
          <p>Your subscription gives you access to your Shopora store and vendor dashboard. You'll also receive a 7-day free trial when you start.</p>

          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <h3 style="color: #0f172a;">2. Create Your Account</h3>
          <p>After selecting your package:</p>
          <ol>
            <li>Create your Shopora account.</li>
            <li>Enter your business information.</li>
            <li>Choose your store name.</li>
            <li>Complete your registration.</li>
            <li>Access your vendor dashboard.</li>
          </ol>
          <p>Your store will have its own Shopora address: <code>yourstorename.shopora.space</code></p>

          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <h3 style="color: #0f172a;">3. Set Up Your Store</h3>
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
          <p><em>Tip: Keep your branding consistent so your storefront looks professional.</em></p>

          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <h3 style="color: #0f172a;">4. Add Your Products</h3>
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
          <p><em>Tip: Use clear, well-lit product photos and accurate descriptions. This helps customers feel confident when shopping.</em></p>

          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <h3 style="color: #0f172a;">5. Organize Your Store</h3>
          <p>Create product categories so customers can easily find what they're looking for. For example:</p>
          <ul>
            <li><strong>Fashion:</strong> Dresses, Tops, Trousers</li>
            <li><strong>Beauty:</strong> Wigs, Hair, Skincare</li>
            <li><strong>Accessories:</strong> Bags, Shoes, Jewelry</li>
          </ul>
          <p>Choose categories that make sense for your business.</p>

          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <h3 style="color: #0f172a;">6. Set Your Delivery & Store Policies</h3>
          <p>Before launching, make sure customers know how your business handles orders. Add your:</p>
          <ul>
            <li>Delivery options</li>
            <li>Delivery fees</li>
            <li>Delivery areas</li>
            <li>Pickup information, if available</li>
            <li>Processing times</li>
            <li>Return policy</li>
            <li>Refund policy</li>
            <li>Exchange policy</li>
          </ul>
          <p>Be clear and transparent so customers know what to expect.</p>

          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <h3 style="color: #0f172a;">7. Set Up Customer Payments</h3>
          <p>Shopora provides the online storefront and order management system. Your customers will place their orders through your Shopora store.</p>
          <p>Make sure your preferred payment instructions are clearly available to customers so they know how to complete payment for their order.</p>
          <p><strong>Important:</strong> Always confirm that payment has been received before processing an order.</p>

          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <h3 style="color: #0f172a;">8. Customize Your Store</h3>
          <p>Make your storefront feel like your brand. You can customize your store with your Brand logo, Brand images, Product photos, Store description, Categories, Contact information, and Social media links.</p>
          <p>Your Shopora store should feel like an extension of your existing business.</p>

          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <h3 style="color: #0f172a;">9. Preview Your Store</h3>
          <p>Before sharing your store with customers, preview it as a customer would. Check: Product images, Prices, Product descriptions, Categories, Contact information, Delivery information, Payment instructions, Store branding, and Mobile appearance.</p>

          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <h3 style="color: #0f172a;">10. Launch Your Store 🎉</h3>
          <p>Once everything is ready, your store can go live. Share your unique store link with your customers: <code>yourstorename.shopora.space</code></p>
          <p>You can add it to: Instagram bio, TikTok bio, WhatsApp, Facebook, Business cards, Flyers, and other marketing platforms.</p>
          
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <h3 style="color: #0f172a;">11. Managing Your Orders</h3>
          <p>When a customer places an order, you'll be able to view it from your vendor dashboard. Keep your order status updated so customers know what is happening with their purchase.</p>
          
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <h3 style="color: #0f172a;">12. Managing Your Products</h3>
          <p>Your vendor dashboard allows you to keep your store up to date. Remember to update prices, update product availability, add new products, and remove unavailable products.</p>
          
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <h3 style="color: #0f172a;">13. Your 7-Day Free Trial ⏳</h3>
          <p>When you create your Shopora store, your 7-day free trial begins. After your 7-day trial ends, your selected Shopora package will need to be paid for to continue using the service.</p>
          
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <h3 style="color: #0f172a;">14. Before You Launch — Checklist ✅</h3>
          <ul>
            <li>Package selected</li>
            <li>Account created</li>
            <li>Store name set</li>
            <li>Logo uploaded</li>
            <li>Store description added</li>
            <li>Contact information added</li>
            <li>Products uploaded</li>
            <li>Prices checked</li>
            <li>Product photos checked</li>
            <li>Categories organized</li>
            <li>Inventory checked</li>
            <li>Delivery information added</li>
            <li>Return/refund policy added</li>
            <li>Payment instructions added</li>
            <li>Store previewed</li>
            <li>Store link tested</li>
            <li>Store ready to share 🎉</li>
          </ul>

          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <h3 style="color: #0f172a;">15. Need Help?</h3>
          <p>If you need assistance setting up your Shopora store, please contact the Shopora Space support team. We're here to help you get your business online and make the most of your Shopora store. 🤍</p>

          <br/>
          <p>Welcome to Shopora Space ✨</p>
          <p>Your Business. Your Store. Your Space.</p>
          <p>We're excited to have you here.</p>
          <p>— Shopora Space</p>
        </div>
      `
    })

    if (error) {
      console.error("Resend API Error:", error)
      // Rollback the status if email failed
      await db.waitlistEntry.update({
        where: { id: entryId },
        data: { status: "PENDING" }
      })
      return { success: false, error: error.message }
    }
  } catch (error: any) {
    console.error("Failed to send invite email:", error)
    // Rollback the status if email failed
    await db.waitlistEntry.update({
      where: { id: entryId },
      data: { status: "PENDING" }
    })
    return { success: false, error: error.message || "Failed to send email" }
  }

  revalidatePath("/super-admin/waitlist")
  return { success: true }
}
