"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { StoreBadges } from "@/components/marketing/mockups";

export function Footer() {
  return (
    <footer className="bg-[#12100e] px-5 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-10 border-b border-white/10 py-24 md:flex-row md:items-end md:justify-between md:py-32">
          <div className="max-w-2xl">
            <h2 className="font-display text-5xl leading-[0.98] tracking-[-0.01em] md:text-7xl">
              Open your shop
              <br />
              <span className="italic text-[#c8a165]">this week.</span>
            </h2>
            <p className="mt-6 max-w-md text-[15px] text-stone-400">
              Create an account and your free month starts the moment your store is created.
            </p>
          </div>
          <div className="flex flex-col gap-6">
            <Link
              href="/signup"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-7 text-sm font-medium text-stone-950 hover:bg-stone-100"
            >
              Start your free month <ArrowRight className="h-4 w-4" />
            </Link>
            <StoreBadges dark />
          </div>
        </div>

        <div className="grid gap-10 py-14 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link href="/" className="font-display text-3xl">
              Shopora
            </Link>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-stone-500">
              The online store, seller app and Accra delivery for Ghanaian brands. Customers pay you directly by MoMo or
              bank.
            </p>
          </div>
          <div>
            <h3 className="text-[11px] uppercase tracking-[0.28em] text-stone-500">Product</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-stone-300">
              <li><Link href="/#features" className="hover:text-white">Platform</Link></li>
              <li><Link href="/#app" className="hover:text-white">The app</Link></li>
              <li><Link href="/#payments" className="hover:text-white">Payments</Link></li>
              <li><Link href="/#pricing" className="hover:text-white">Pricing</Link></li>
              <li><Link href="/showcase" className="hover:text-white">Showcase</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-[11px] uppercase tracking-[0.28em] text-stone-500">Company</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-stone-300">
              <li><Link href="/rider/signup" className="hover:text-white">Ride with Shopora</Link></li>
              <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
              <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
              <li><Link href="/delete-account" className="hover:text-white">Delete account</Link></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-2 border-t border-white/10 py-6 text-xs text-stone-500 sm:flex-row">
          <p>© {new Date().getFullYear()} Shopora Space. Made in Accra.</p>
          <p>shopora.space</p>
        </div>
      </div>
    </footer>
  );
}
