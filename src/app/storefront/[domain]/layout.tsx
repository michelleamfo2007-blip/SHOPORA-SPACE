import { notFound } from "next/navigation"
import Link from "next/link"
import { getStoreByHost } from "@/lib/tenant"
import { db } from "@/lib/db"
import { ShoppingCart } from "lucide-react"

export default async function StorefrontLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ domain: string }>
}) {
  const { domain } = await params
  const store = await getStoreByHost(domain)

  if (!store) {
    notFound()
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Storefront Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-xl font-bold tracking-tight text-slate-900">
                {store.name}
              </Link>
            </div>
            
            <nav className="hidden md:flex gap-6">
              <Link href="/" className="text-sm font-medium hover:text-slate-900 text-slate-600 transition-colors">
                Home
              </Link>
              <Link href="/products" className="text-sm font-medium hover:text-slate-900 text-slate-600 transition-colors">
                All Products
              </Link>
              <Link href="/categories" className="text-sm font-medium hover:text-slate-900 text-slate-600 transition-colors">
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
                <li><Link href="/products">All Products</Link></li>
                <li><Link href="/categories">Categories</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><Link href="#">Contact Us</Link></li>
                <li><Link href="#">Shipping Policy</Link></li>
                <li><Link href="#">Refund Policy</Link></li>
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
}
