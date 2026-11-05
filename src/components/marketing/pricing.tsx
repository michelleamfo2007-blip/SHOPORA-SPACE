"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const everyPlan = [
  "0% commission on sales",
  "MoMo & bank payments to you",
  "Seller app for iOS & Android",
  "Shopora Delivery in Accra",
];

const plans = [
  {
    name: "Starter",
    price: "100",
    description: "For a new shop getting its first products online.",
    features: ["Up to 25 products", ...everyPlan, "yourstore.shopora.space", "Standard support"],
    highlighted: false,
  },
  {
    name: "Professional",
    price: "200",
    description: "For a store already taking orders and ready to grow.",
    features: ["Up to 50 products", ...everyPlan, "Your own domain", "Advanced analytics", "Priority support"],
    highlighted: true,
  },
  {
    name: "Business",
    price: "300",
    description: "For a high-volume shop that wants a dedicated contact.",
    features: ["Unlimited products", ...everyPlan, "Your own domain", "Dedicated account manager", "Custom integrations"],
    highlighted: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="px-5 py-24 md:py-36">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 md:grid-cols-[0.8fr_1.2fr] md:items-end">
          <p className="text-[11px] uppercase tracking-[0.32em] text-stone-500">04 — Pricing</p>
          <div>
            <h2 className="font-display text-4xl leading-[1.02] tracking-[-0.01em] text-[#12100e] md:text-6xl">
              One monthly price. <span className="italic text-stone-500">The sale stays yours.</span>
            </h2>
            <p className="mt-5 max-w-lg text-[15px] text-stone-600">
              Every plan starts with a free month. No share of revenue, ever. Pay your plan by MoMo or bank transfer.
            </p>
          </div>
        </div>

        <div className="mt-16 grid gap-5 md:mt-20 md:grid-cols-3">
          {plans.map((plan, index) => (
            <motion.article
              key={plan.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.5 }}
              className={`flex flex-col rounded-[1.75rem] p-8 ${
                plan.highlighted
                  ? "bg-[#12100e] text-white shadow-[0_40px_90px_-45px_rgba(18,16,14,0.9)]"
                  : "bg-white text-stone-950 ring-1 ring-stone-900/10"
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display text-3xl">{plan.name}</h3>
                {plan.highlighted && (
                  <span className="rounded-full border border-[#c8a165]/40 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-[#c8a165]">
                    Most chosen
                  </span>
                )}
              </div>
              <p className={`mt-2 text-sm md:min-h-16 ${plan.highlighted ? "text-stone-400" : "text-stone-500"}`}>
                {plan.description}
              </p>
              <p className="mt-8 flex items-baseline gap-2">
                <span className={`text-sm ${plan.highlighted ? "text-stone-400" : "text-stone-500"}`}>GHS</span>
                <span className="font-display text-6xl leading-none">{plan.price}</span>
                <span className={`text-sm ${plan.highlighted ? "text-stone-400" : "text-stone-500"}`}>/ month</span>
              </p>
              <ul className={`mt-8 flex-1 divide-y border-t ${plan.highlighted ? "divide-white/10 border-white/10" : "divide-stone-900/10 border-stone-900/10"}`}>
                {plan.features.map((feature) => (
                  <li key={feature} className={`py-2.5 text-sm ${plan.highlighted ? "text-stone-300" : "text-stone-700"}`}>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className={`mt-8 block rounded-full py-3.5 text-center text-sm font-medium transition-colors ${
                  plan.highlighted ? "bg-white text-stone-950 hover:bg-stone-100" : "bg-[#12100e] text-white hover:bg-stone-800"
                }`}
              >
                Start free month
              </Link>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
