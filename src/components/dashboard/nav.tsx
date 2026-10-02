"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import {
  LayoutDashboard,
  Package,
  LayoutGrid,
  Box,
  ShoppingCart,
  Truck,
  Users,
  CreditCard,
  Ticket,
  BarChart3,
  Star,
  LifeBuoy,
  Settings,
  Wallet,
  Menu,
  X,
} from "lucide-react"

import { cn } from "@/lib/utils"

interface DashboardNavProps {
  storeId: string
  isMobileMenu?: boolean
}

export function DashboardNav({ storeId, isMobileMenu }: DashboardNavProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const groups = [
    {
      label: "Shop",
      routes: [
        { href: `/${storeId}`, label: "Overview", icon: LayoutDashboard, active: pathname === `/${storeId}` },
        { href: `/${storeId}/products`, label: "Products", icon: Package, active: pathname === `/${storeId}/products` },
        { href: `/${storeId}/categories`, label: "Categories", icon: LayoutGrid, active: pathname === `/${storeId}/categories` },
        { href: `/${storeId}/inventory`, label: "Inventory", icon: Box, active: pathname === `/${storeId}/inventory` },
      ],
    },
    {
      label: "Sales",
      routes: [
        { href: `/${storeId}/orders`, label: "Orders", icon: ShoppingCart, active: pathname === `/${storeId}/orders` },
        { href: `/${storeId}/customers`, label: "Customers", icon: Users, active: pathname === `/${storeId}/customers` },
        { href: `/${storeId}/shipping`, label: "Delivery", icon: Truck, active: pathname === `/${storeId}/shipping` },
        { href: `/${storeId}/discounts`, label: "Discounts", icon: Ticket, active: pathname === `/${storeId}/discounts` },
        { href: `/${storeId}/reviews`, label: "Reviews", icon: Star, active: pathname === `/${storeId}/reviews` },
      ],
    },
    {
      label: "Account",
      routes: [
        { href: `/${storeId}/settings/payments`, label: "Payments", icon: CreditCard, active: pathname === `/${storeId}/settings/payments` },
        { href: `/${storeId}/analytics`, label: "Analytics", icon: BarChart3, active: pathname === `/${storeId}/analytics` },
        { href: `/${storeId}/billing`, label: "Billing", icon: Wallet, active: pathname === `/${storeId}/billing` },
        { href: `/${storeId}/support`, label: "Support", icon: LifeBuoy, active: pathname === `/${storeId}/support` },
        { href: `/${storeId}/settings`, label: "Settings", icon: Settings, active: pathname === `/${storeId}/settings` },
      ],
    },
  ]

  const linkClass = (active: boolean) =>
    cn(
      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
      active ? "bg-stone-950 text-white" : "text-stone-600 hover:bg-stone-100 hover:text-stone-950"
    )

  const nav = (
    <div className="grid gap-5">
      {groups.map((group) => (
        <div key={group.label}>
          <p className="px-3 pb-1 text-[11px] font-medium uppercase tracking-wider text-stone-400">{group.label}</p>
          <div className="grid gap-0.5">
            {group.routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                onClick={() => setIsOpen(false)}
                className={linkClass(route.active)}
              >
                <route.icon className="h-4 w-4" />
                {route.label}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  )

  if (isMobileMenu) {
    return (
      <div className="lg:hidden">
        <button type="button" onClick={() => setIsOpen(!isOpen)} className="rounded-lg p-2 text-stone-950" aria-label={isOpen ? "Close menu" : "Open menu"}>
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        {isOpen && (
          <div className="absolute left-0 right-0 top-14 z-50 max-h-[80vh] overflow-y-auto border-b border-stone-200 bg-stone-50 px-4 py-4">
            {nav}
          </div>
        )}
      </div>
    )
  }

  return nav
}
