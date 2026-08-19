"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Package, LayoutGrid, Box, ShoppingCart, Truck, Users, CreditCard, Ticket, BarChart3, Star, LifeBuoy, Settings } from "lucide-react"

import { cn } from "@/lib/utils"

interface DashboardNavProps {
  storeId: string
  isMobileMenu?: boolean
}

import { useState } from "react"
import { Menu, X } from "lucide-react"

export function DashboardNav({ storeId, isMobileMenu }: DashboardNavProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const routes = [
    {
      href: `/${storeId}`,
      label: "Overview",
      icon: LayoutDashboard,
      color: "text-blue-500",
      active: pathname === `/${storeId}`,
    },
    {
      href: `/${storeId}/products`,
      label: "Products",
      icon: Package,
      color: "text-emerald-500",
      active: pathname === `/${storeId}/products`,
    },
    {
      href: `/${storeId}/categories`,
      label: "Categories",
      icon: LayoutGrid,
      color: "text-pink-500",
      active: pathname === `/${storeId}/categories`,
    },
    {
      href: `/${storeId}/inventory`,
      label: "Inventory",
      icon: Box,
      color: "text-indigo-500",
      active: pathname === `/${storeId}/inventory`,
    },
    {
      href: `/${storeId}/orders`,
      label: "Orders",
      icon: ShoppingCart,
      color: "text-amber-500",
      active: pathname === `/${storeId}/orders`,
    },
    {
      href: `/${storeId}/shipping`,
      label: "Delivery",
      icon: Truck,
      color: "text-teal-500",
      active: pathname === `/${storeId}/shipping`,
    },
    {
      href: `/${storeId}/customers`,
      label: "Customers",
      icon: Users,
      color: "text-purple-500",
      active: pathname === `/${storeId}/customers`,
    },
    {
      href: `/${storeId}/settings/payments`,
      label: "Payments",
      icon: CreditCard,
      color: "text-green-500",
      active: pathname === `/${storeId}/settings/payments`,
    },
    {
      href: `/${storeId}/discounts`,
      label: "Discounts",
      icon: Ticket,
      color: "text-rose-500",
      active: pathname === `/${storeId}/discounts`,
    },
    {
      href: `/${storeId}/analytics`,
      label: "Analytics",
      icon: BarChart3,
      color: "text-cyan-500",
      active: pathname === `/${storeId}/analytics`,
    },
    {
      href: `/${storeId}/reviews`,
      label: "Reviews",
      icon: Star,
      color: "text-amber-500",
      active: pathname === `/${storeId}/reviews`,
    },
    {
      href: `/${storeId}/support`,
      label: "Support",
      icon: LifeBuoy,
      color: "text-indigo-500",
      active: pathname === `/${storeId}/support`,
    },
    {
      href: `/${storeId}/settings`,
      label: "Settings",
      icon: Settings,
      color: "text-slate-500",
      active: pathname === `/${storeId}/settings`,
    },
  ]

  if (isMobileMenu) {
    return (
      <div className="lg:hidden">
        <button onClick={() => setIsOpen(!isOpen)} className="text-slate-900 p-2">
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
        {isOpen && (
          <div className="absolute top-[60px] left-0 right-0 bg-white border-b shadow-lg z-50 px-4 py-4 max-h-[80vh] overflow-y-auto">
            <nav className="grid items-start gap-2">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-slate-100 hover:text-slate-900",
                    route.active ? "bg-slate-100 text-slate-900" : "text-slate-500"
                  )}
                >
                  <route.icon className={cn("h-4 w-4", route.color)} />
                  {route.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    )
  }

  return (
    <nav className="grid items-start gap-2">
      {routes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-slate-100 hover:text-slate-900",
            route.active ? "bg-slate-100 text-slate-900" : "text-slate-500"
          )}
        >
          <route.icon className={cn("h-4 w-4", route.color)} />
          {route.label}
        </Link>
      ))}
    </nav>
  )
}
