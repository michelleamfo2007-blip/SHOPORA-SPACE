"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import {
  BrowserStorefront,
  Phone,
  SellerHomeScreen,
  type FeaturedStorefront,
} from "@/components/marketing/mockups";

export function Hero({ store }: { store?: FeaturedStorefront | null }) {
  return (
    <section className="relative overflow-hidden px-5 pb-16 pt-32 md:pb-24 md:pt-40">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_70%_20%,rgba(200,161,101,0.18),transparent_70%),radial-gradient(40%_40%_at_10%_80%,rgba(28,25,23,0.06),transparent_70%)]" />

      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-3xl text-center"
        >
          <p className="text-[11px] uppercase tracking-[0.32em] text-stone-500">
            Online store · Seller app · Accra delivery
          </p>
          <h1 className="mt-6 font-display text-[3.4rem] leading-[0.92] tracking-[-0.02em] text-[#12100e] md:text-[6.2rem]">
            Your shop,
            <br />
            <span className="italic text-[#8a6a3d]">beautifully</span> run.
          </h1>
          <p className="mx-auto mt-7 max-w-xl text-[15px] leading-relaxed text-stone-600 md:text-lg">
            A storefront that looks like your brand, an app to run it from your phone, and riders who deliver across
            Accra. Customers pay you directly by Mobile Money or bank — Shopora takes nothing from the sale.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex h-12 items-center gap-2 rounded-full bg-[#12100e] px-7 text-sm font-medium text-white transition-colors hover:bg-stone-800"
            >
              Start your free month <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="#app" className="text-sm font-medium text-stone-700 underline decoration-stone-300 underline-offset-[6px] hover:text-stone-950">
              See the iOS & Android app
            </Link>
          </div>
          <p className="mt-6 text-xs text-stone-500">1-month free trial · 0% commission · Plans from GHS 100/month</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto mt-16 max-w-5xl md:mt-24"
        >
          <div className="hidden md:block md:pl-28 lg:pl-40">
            <BrowserStorefront store={store} />
            {store && (
              <a
                href={`https://${store.domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex items-center justify-end gap-1 text-xs text-stone-500 hover:text-stone-900"
              >
                Live on Shopora · {store.domain}
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
          <div className="flex justify-center md:absolute md:-bottom-12 md:left-4 md:block xl:-left-4">
            <Phone className="rotate-0 md:-rotate-[4deg]">
              <SellerHomeScreen storeName={store?.name} />
            </Phone>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
