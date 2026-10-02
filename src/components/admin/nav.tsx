"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import {
  BarChart3,
  Store,
  Users,
  Package,
  Settings,
  ShieldAlert,
  Megaphone,
  UserCog,
  FileText,
  LineChart,
  Wallet,
  CreditCard,
  LayoutGrid,
  Menu,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"

const groups = [
  {
    label: "Platform",
    items: [
      { title: "Overview", href: "/super-admin", icon: BarChart3 },
      { title: "Sellers", href: "/super-admin/sellers", icon: Store },
      { title: "Customers", href: "/super-admin/customers", icon: Users },
      { title: "Products", href: "/super-admin/products", icon: Package },
      { title: "Categories", href: "/super-admin/categories", icon: LayoutGrid },
    ],
  },
  {
    label: "Money",
    items: [
      { title: "Subscriptions", href: "/super-admin/subscriptions", icon: CreditCard },
      { title: "Finance", href: "/super-admin/finance", icon: Wallet },
    ],
  },
  {
    label: "Account",
    items: [
      { title: "Analytics", href: "/super-admin/analytics", icon: LineChart },
      { title: "Marketing", href: "/super-admin/promotions", icon: Megaphone },
      { title: "Moderation", href: "/super-admin/moderation", icon: ShieldAlert },
      { title: "Roles", href: "/super-admin/roles", icon: UserCog },
      { title: "Audit logs", href: "/super-admin/audit-logs", icon: FileText },
      { title: "Settings", href: "/super-admin/settings", icon: Settings },
    ],
  },
]

export function SuperAdminNav() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

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
            {group.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={linkClass(pathname === item.href)}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <>
      <div className="flex h-14 flex-shrink-0 items-center justify-between border-b border-stone-200 bg-stone-50 px-4 md:hidden">
        <p className="text-sm font-semibold">Shopora</p>
        <button type="button" onClick={() => setIsOpen(!isOpen)} className="rounded-lg p-2 text-stone-950" aria-label={isOpen ? "Close menu" : "Open menu"}>
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {isOpen && (
        <div className="border-b border-stone-200 bg-stone-50 px-3 py-4 md:hidden">{nav}</div>
      )}
      <nav className="hidden w-60 border-r border-stone-200 bg-stone-50 md:block">
        <div className="flex h-14 items-center px-5">
          <p className="text-sm font-semibold">Shopora</p>
        </div>
        <div className="px-3 pb-6">{nav}</div>
      </nav>
    </>
  )
}
