"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  ClipboardList
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    title: "Platform Management",
    items: [
      {
        title: "Overview",
        href: "/super-admin",
        icon: BarChart3,
      },
      {
        title: "Waitlist",
        href: "/super-admin/waitlist",
        icon: ClipboardList,
      },
      {
        title: "Sellers",
        href: "/super-admin/sellers",
        icon: Store,
      },
      {
        title: "Customers",
        href: "/super-admin/customers",
        icon: Users,
      },
      {
        title: "Categories",
        href: "/super-admin/categories",
        icon: Package,
      },
      {
        title: "Platform Finance",
        href: "/super-admin/finance",
        icon: Wallet,
      },
      {
        title: "Moderation",
        href: "/super-admin/moderation",
        icon: ShieldAlert,
      },
      {
        title: "Analytics",
        href: "/super-admin/analytics",
        icon: LineChart,
      },
      {
        title: "Marketing",
        href: "/super-admin/promotions",
        icon: Megaphone,
      },
      {
        title: "Admin Roles",
        href: "/super-admin/roles",
        icon: UserCog,
      },
      {
        title: "Settings",
        href: "/super-admin/settings",
        icon: Settings,
      },
      {
        title: "Audit Logs",
        href: "/super-admin/audit-logs",
        icon: FileText,
      },
    ],
  },
];

import { useState } from "react";
import { Menu, X } from "lucide-react";

export function SuperAdminNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden flex flex-shrink-0 items-center justify-between bg-slate-950 p-4 text-white border-b border-slate-800">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <span className="text-blue-500">Shopora</span> Admin
        </h2>
        <button onClick={() => setIsOpen(!isOpen)} className="text-slate-300">
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <nav className={cn(
        "w-full md:w-64 border-r border-slate-800 bg-slate-950 min-h-screen text-slate-300",
        isOpen ? "block" : "hidden md:block"
      )}>
        <div className="hidden md:block p-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-blue-500">Shopora</span> Admin
          </h2>
        </div>
        <div className="space-y-6 px-3 py-4 md:py-0">
          {navItems.map((group) => (
            <div key={group.title} className="px-3">
              <h3 className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                {group.title}
              </h3>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-4 py-2.5 text-sm font-medium transition-colors hover:bg-slate-800 hover:text-slate-50",
                      pathname === item.href ? "bg-slate-800 text-white" : ""
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.title}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </nav>
    </>
  );
}
