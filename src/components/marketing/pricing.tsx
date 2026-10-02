"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "Starter",
    price: "100",
    currency: "GHS",
    period: "/mo",
    description: "For a new shop getting its first products online.",
    features: [
      "Up to 25 products",
      "Your own payment gateway",
      "Standard support",
      "0% platform fee on sales",
      "Free .shopora.space address",
    ],
    highlighted: false,
    cta: "Start free trial",
    href: "/signup",
  },
  {
    name: "Professional",
    price: "200",
    currency: "GHS",
    period: "/mo",
    description: "For a store that is already taking orders and wants room to grow.",
    features: [
      "Up to 50 products",
      "Your own payment gateway",
      "Priority support",
      "0% platform fee on sales",
      "Free .shopora.space address",
      "Your own domain",
      "Advanced analytics",
    ],
    highlighted: true,
    cta: "Start free trial",
    href: "/signup",
  },
  {
    name: "Business",
    price: "300",
    currency: "GHS",
    period: "/mo",
    description: "For a higher-volume shop that wants a person on the account.",
    features: [
      "Unlimited products",
      "Your own payment gateway",
      "Dedicated account manager",
      "Custom integrations",
      "0% platform fee on sales",
      "Your own domain",
    ],
    highlighted: false,
    cta: "Start free trial",
    href: "/signup",
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="px-5 py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 max-w-2xl">
          <p className="text-sm font-medium text-emerald-700">Pricing</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-stone-950 md:text-4xl">
            One monthly price. The sale stays yours.
          </h2>
          <p className="mt-3 text-stone-600">Every plan starts with a 1-month free trial. No share of revenue.</p>
        </div>

        <div className="grid items-stretch gap-4 md:grid-cols-3">
          {plans.map((plan, index) => (
            <motion.article
              key={plan.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.06 }}
              className={`flex flex-col rounded-3xl p-7 ${
                plan.highlighted
                  ? "bg-stone-950 text-white shadow-[0_24px_60px_-36px_rgba(28,25,23,0.8)]"
                  : "border border-stone-200 bg-white text-stone-950"
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                {plan.highlighted && (
                  <span className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
                    Recommended
                  </span>
                )}
              </div>
              <p className={`mt-2 min-h-12 text-sm ${plan.highlighted ? "text-stone-300" : "text-stone-500"}`}>
                {plan.description}
              </p>
              <p className="mt-6">
                <span className="text-4xl font-semibold tracking-tight">{plan.currency} {plan.price}</span>
                <span className={plan.highlighted ? "text-stone-400" : "text-stone-500"}>{plan.period}</span>
              </p>
              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm">
                    <Check className={`mt-0.5 h-4 w-4 shrink-0 ${plan.highlighted ? "text-emerald-300" : "text-emerald-700"}`} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={plan.href}
                className={`mt-8 block rounded-full py-3 text-center text-sm font-medium transition-colors ${
                  plan.highlighted
                    ? "bg-white text-stone-950 hover:bg-stone-100"
                    : "bg-stone-950 text-white hover:bg-stone-800"
                }`}
              >
                {plan.cta}
              </Link>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
