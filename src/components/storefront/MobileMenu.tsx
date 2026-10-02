"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"

type MobileMenuProps = {
  storeName: string
  basePath: string
  hasCategories: boolean
  whatsappHref: string | null
}

export function MobileMenu({ storeName, basePath, hasCategories, whatsappHref }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = previous
    }
  }, [isOpen])

  const links = [
    { href: `${basePath}/`, label: "Home" },
    { href: `${basePath}/products`, label: "Shop all" },
    ...(hasCategories ? [{ href: `${basePath}/categories`, label: "Collections" }] : []),
    { href: `${basePath}/pages/shipping`, label: "Delivery" },
    { href: `${basePath}/pages/refunds`, label: "Returns" },
    { href: `${basePath}/pages/faq`, label: "FAQs" },
  ]

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="-ml-2 flex h-10 w-10 items-center justify-center text-stone-900"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" strokeWidth={1.5} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-[#faf8f5]">
          <div className="flex h-16 items-center justify-between border-b border-stone-200 px-5">
            <span className="font-display text-2xl">{storeName}</span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="-mr-2 flex h-10 w-10 items-center justify-center"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" strokeWidth={1.5} />
            </button>
          </div>
          <nav className="flex flex-1 flex-col overflow-y-auto px-5 py-6">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="border-b border-stone-200 py-4 font-display text-3xl text-stone-900"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          {whatsappHref && (
            <div className="border-t border-stone-200 p-5">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="flex h-12 w-full items-center justify-center rounded-full bg-stone-900 text-sm font-medium tracking-wide text-white"
              >
                Chat with us on WhatsApp
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
