"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="px-5 pb-8 pt-8">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-stone-950 text-white">
        <div className="flex flex-col gap-6 border-b border-white/10 px-8 py-12 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Open your shop this week.</h2>
            <p className="mt-3 text-stone-400">Create an account. The 1-month trial starts as soon as the store is created.</p>
          </div>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-medium text-stone-950 hover:bg-stone-100"
          >
            Create an account <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-10 px-8 py-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link href="/" className="text-lg font-semibold tracking-tight">Shopora</Link>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-stone-400">
              A storefront and dashboard for merchants who keep their own payments and their own customers.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium">Product</h3>
            <ul className="mt-3 space-y-2 text-sm text-stone-400">
              <li><Link href="/#features" className="hover:text-white">Features</Link></li>
              <li><Link href="/#pricing" className="hover:text-white">Pricing</Link></li>
              <li><Link href="/showcase" className="hover:text-white">Showcase</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-medium">Legal</h3>
            <ul className="mt-3 space-y-2 text-sm text-stone-400">
              <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
              <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 px-8 py-5 text-sm text-stone-500">
          © {new Date().getFullYear()} Shopora. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
