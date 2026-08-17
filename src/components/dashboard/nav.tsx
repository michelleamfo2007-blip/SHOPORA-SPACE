"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Package, ShoppingCart, Users, Settings } from "lucide-react"

import { cn } from "@/lib/utils"

interface DashboardNavProps {
  storeId: string
}

export function DashboardNav({ storeId }: DashboardNavProps) {
  const pathname = usePathname()

  const routes = [
    {
      href: `/${storeId}`,
      label: "Overview",
      icon: LayoutDashboard,
      active: pathname === `/${storeId}`,
    },
    {
      href: `/${storeId}/products`,
      label: "Products",
      icon: Package,
      active: pathname === `/${storeId}/products`,
    },
    {
      href: `/${storeId}/categories`,
      label: "Categories",
      icon: Package,
      active: pathname === `/${storeId}/categories`,
    },
    {
      href: `/${storeId}/inventory`,
      label: "Inventory",
      icon: Package,
      active: pathname === `/${storeId}/inventory`,
    },
    {
      href: `/${storeId}/orders`,
      label: "Orders",
      icon: ShoppingCart,
      active: pathname === `/${storeId}/orders`,
    },
    {
      href: `/${storeId}/shipping`,
      label: "Shipping",
      icon: Package,
      active: pathname === `/${storeId}/shipping`,
    },
    {
      href: `/${storeId}/customers`,
      label: "Customers",
      icon: Users,
      active: pathname === `/${storeId}/customers`,
    },
    {
      href: `/${storeId}/settings/payments`,
      label: "Payments",
      icon: Settings,
      active: pathname === `/${storeId}/settings/payments`,
    },
    {
      href: `/${storeId}/discounts`,
      label: "Discounts",
      icon: Settings,
      active: pathname === `/${storeId}/discounts`,
    },
    {
      href: `/${storeId}/analytics`,
      label: "Analytics",
      icon: LayoutDashboard,
      active: pathname === `/${storeId}/analytics`,
    },
    {
      href: `/${storeId}/reviews`,
      label: "Reviews",
      icon: Users,
      active: pathname === `/${storeId}/reviews`,
    },
    {
      href: `/${storeId}/support`,
      label: "Support",
      icon: Users,
      active: pathname === `/${storeId}/support`,
    },
    {
      href: `/${storeId}/settings`,
      label: "Settings",
      icon: Settings,
      active: pathname === `/${storeId}/settings`,
    },
  ]

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
          <route.icon className="h-4 w-4" />
          {route.label}
        </Link>
      ))}
    </nav>
  )
}
