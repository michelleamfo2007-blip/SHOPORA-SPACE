import { notFound } from "next/navigation"
import Link from "next/link"
import { getStoreByHost } from "@/lib/tenant"
import { db } from "@/lib/db"
import { ShoppingCart } from "lucide-react"

import { headers } from "next/headers"

export default async function StorefrontLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ domain: string }>
}) {
  try {
    const { domain } = await params
    const store = await getStoreByHost(domain)

    if (!store) {
      notFound()
    }

    const headersList = await headers()
    const host = headersList.get("host") || ""
    const isPreview = host.includes("vercel.app") || host.includes("localhost:3000")
    // If testing via Vercel preview or localhost, the base path is /storefront/[domain]
    // Otherwise on the actual custom domain, the base path is just /
    const basePath = isPreview && !host.startsWith(domain) ? `/storefront/${domain}` : ""

  return (
    <div className="flex min-h-screen flex-col">
      {/* Storefront Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`${basePath}/`} className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                {store.logoUrl ? (
                  <img src={store.logoUrl} alt={`${store.name} Logo`} className="h-8 w-auto object-contain" />
                ) : (
                  <span>{store.name}</span>
                )}
              </Link>
            </div>
            
            <nav className="hidden md:flex gap-6">
              <Link href={`${basePath}/`} className="text-sm font-medium hover:text-slate-900 text-slate-600 transition-colors">
                Home
              </Link>
              <Link href={`${basePath}/products`} className="text-sm font-medium hover:text-slate-900 text-slate-600 transition-colors">
                All Products
              </Link>
              <Link href={`${basePath}/categories`} className="text-sm font-medium hover:text-slate-900 text-slate-600 transition-colors">
                Categories
              </Link>
            </nav>

            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors">
                <ShoppingCart className="h-5 w-5" />
                <span className="text-sm font-medium">0</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 bg-slate-50">
        {children}
      </main>

      {/* Storefront Footer */}
      <footer className="border-t bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <h3 className="text-lg font-bold mb-4">{store.name}</h3>
              <p className="text-sm text-slate-500">
                {store.description || "Welcome to our online store!"}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Shop</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><Link href={`${basePath}/products`}>All Products</Link></li>
                <li><Link href={`${basePath}/categories`}>Categories</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><Link href={`${basePath}/contact`}>Contact Us</Link></li>
                <li><Link href={`${basePath}/shipping`}>Shipping Policy</Link></li>
                <li><Link href={`${basePath}/refunds`}>Refund Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t pt-8 text-center text-sm text-slate-500">
            <p>© {new Date().getFullYear()} {store.name}. Powered by Shopora.</p>
          </div>
        </div>
      </footer>
    </div>
  )
  } catch (error: any) {
    return (
      <html lang="en">
        <body>
          <div className="p-10 text-red-500">
            <h1 className="text-2xl font-bold">Storefront Layout Error</h1>
            <pre className="mt-4 p-4 bg-gray-100 rounded text-sm text-black">{error.message}</pre>
            <pre className="mt-4 p-4 bg-gray-100 rounded text-sm text-black">{error.stack}</pre>
          </div>
        </body>
      </html>
    )
  }
}
