"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const previewOrders = [
  { name: "Silk set · M", status: "Paid", amount: "GHS 420" },
  { name: "Linen shirt · L", status: "New", amount: "GHS 180" },
  { name: "Canvas tote", status: "Packed", amount: "GHS 95" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden px-5 pb-20 pt-28 md:pb-28 md:pt-36">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.12),transparent_55%)]" />

      <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            0% platform fees · 1-month free trial
          </p>
          <h1 className="max-w-xl text-5xl font-semibold tracking-tight text-stone-950 md:text-6xl md:leading-[1.05]">
            Sell global.
            <span className="block text-stone-500">Manage local.</span>
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-stone-600 md:text-lg">
            Shopora is the storefront and dashboard for sellers who want their own payments, their own customers, and every cedi from a sale.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-stone-950 px-6 py-3.5 text-sm font-medium text-white transition-colors hover:bg-stone-800"
            >
              Create an account <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="#features"
              className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-6 py-3.5 text-sm font-medium text-stone-900 transition-colors hover:bg-stone-100"
            >
              See how it works
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08 }}
          className="rounded-3xl border border-stone-200 bg-white p-3 shadow-[0_30px_80px_-40px_rgba(28,25,23,0.45)]"
        >
          <div className="rounded-2xl bg-stone-950 p-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-stone-400">Your store</p>
                <p className="mt-1 text-lg font-medium">Atelier</p>
              </div>
              <span className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-xs font-medium text-emerald-300">Live</span>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-3">
              {[
                ["Today", "GHS 695"],
                ["Orders", "3"],
                ["Fees", "0%"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl bg-white/5 px-3 py-3">
                  <p className="text-[11px] uppercase tracking-wide text-stone-400">{label}</p>
                  <p className="mt-1 text-sm font-semibold">{value}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="px-2 pb-2 pt-4">
            <p className="px-2 pb-2 text-xs font-medium uppercase tracking-wide text-stone-400">Recent orders</p>
            <ul className="divide-y divide-stone-100">
              {previewOrders.map((order) => (
                <li key={order.name} className="flex items-center justify-between px-2 py-3 text-sm">
                  <span className="font-medium text-stone-900">{order.name}</span>
                  <span className="flex items-center gap-3 text-stone-500">
                    <span>{order.status}</span>
                    <span className="font-medium text-stone-900">{order.amount}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
