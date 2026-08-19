import { notFound } from "next/navigation"
import Link from "next/link"
import { getStoreByHost } from "@/lib/tenant"
import { db } from "@/lib/db"
import { ShoppingCart } from "lucide-react"
import { AIAssistant } from "@/components/storefront/AIAssistant"
import { CartDrawer } from "@/components/storefront/CartDrawer"

import { headers } from "next/headers"

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

  const headersList = await headers()
    const host = headersList.get("host") || ""
    const isPreview = host.includes("vercel.app") || host.includes("localhost:3000") || host === "shopora.space" || host === "www.shopora.space"
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
              <CartDrawer 
                currency={store.currency} 
                primaryColor={store.primaryColor} 
                basePath={basePath} 
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 bg-slate-50">
        {children}
      </main>

      {/* Storefront Footer */}
      <footer className="bg-slate-900 text-white pt-16 pb-8 border-t border-slate-800" style={{ backgroundColor: store.primaryColor || '#0f172a' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4 mb-12">
            <div>
              <h3 className="text-2xl font-bold tracking-tight mb-6">{store.name}</h3>
              <p className="text-white/70 leading-relaxed mb-6">
                {store.description || "Premium quality products delivered right to your door."}
              </p>
              <div className="flex gap-4">
                {store.instagramHandle && (
                  <a href={`https://instagram.com/${store.instagramHandle.replace('@', '')}`} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                  </a>
                )}
                {store.whatsappNumber && (
                  <a href={`https://wa.me/${store.whatsappNumber.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 0C5.393 0 0 5.385 0 12.022c0 2.128.552 4.195 1.6 6L.266 22.9l5.006-1.312C6.982 22.564 8.98 23.1 11.056 23.1 18.665 23.1 24 17.702 24 11.05 24 4.398 18.664 0 12.031 0zm.012 19.336c-1.802 0-3.56-.484-5.1-1.399l-.364-.218-3.791.995 1.01-3.692-.239-.38C2.658 13.2 2.148 11.455 2.148 9.61c0-5.467 4.455-9.92 9.926-9.92 5.47 0 9.92 4.453 9.92 9.92 0 5.467-4.45 9.92-9.922 9.92zm5.437-7.44c-.297-.15-1.761-.871-2.034-.972-.272-.102-.471-.152-.669.15-.198.301-.767.971-.94 1.171-.173.2-.345.225-.643.076-1.636-.81-2.808-1.554-3.882-3.376-.172-.293.17-.282.464-.863.099-.197.05-.37-.025-.52-.074-.15-.668-1.611-.914-2.205-.24-.582-.486-.504-.668-.513-.173-.01-.371-.01-.57-.01-.198 0-.52.074-.792.373-.272.302-1.04 1.018-1.04 2.482 0 1.464 1.064 2.879 1.213 3.079.148.2 2.094 3.196 5.077 4.48 2.016.865 2.827.942 3.82.783.743-.119 2.274-.933 2.596-1.836.321-.904.321-1.677.222-1.838-.098-.16-.37-.258-.667-.408z"/></svg>
                  </a>
                )}
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-6">Quick Links</h4>
              <ul className="space-y-3 text-white/70">
                <li><Link href={`${basePath}/`} className="hover:text-white transition-colors">Home</Link></li>
                <li><Link href={`${basePath}/#shop`} className="hover:text-white transition-colors">Shop</Link></li>
                <li><Link href={`${basePath}/#categories`} className="hover:text-white transition-colors">Categories</Link></li>
                <li><Link href={`${basePath}/#about`} className="hover:text-white transition-colors">About Us</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-6">Customer Support</h4>
              <ul className="space-y-3 text-white/70">
                {store.whatsappNumber ? (
                  <li><a href={`https://wa.me/${store.whatsappNumber.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Contact Us</a></li>
                ) : (
                  <li><Link href={`${basePath}/pages/faq`} className="hover:text-white transition-colors">Contact</Link></li>
                )}
                <li><Link href={`${basePath}/pages/faq`} className="hover:text-white transition-colors">FAQs</Link></li>
                <li><Link href={`${basePath}/pages/shipping`} className="hover:text-white transition-colors">Shipping Policy</Link></li>
                <li><Link href={`${basePath}/pages/refunds`} className="hover:text-white transition-colors">Returns Policy</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-6">Shopora Space</h4>
              <p className="text-white/70 text-sm mb-4">
                This store is proudly powered by Shopora Space. Discover more amazing stores on our platform.
              </p>
              <a href="https://shopora.space" target="_blank" rel="noreferrer" className="inline-flex items-center text-sm font-semibold text-white hover:underline">
                Explore Shopora Space &rarr;
              </a>
            </div>
          </div>
          
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-white/50 text-sm">
            <p>© {new Date().getFullYear()} {store.name}. All rights reserved.</p>
            <div className="flex gap-4">
              <span>Powered by Shopora</span>
            </div>
          </div>
        </div>
      </footer>
      <AIAssistant domain={domain} storeId={store.id} primaryColor={store.primaryColor || undefined} />
    </div>
  )
}
