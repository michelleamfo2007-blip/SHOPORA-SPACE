"use client";

import { motion } from "framer-motion";
import { CreditCard, Mail, ShieldCheck, Store } from "lucide-react";

const features = [
  {
    title: "Your gateway, your payouts",
    description: "Connect Paystack, Stripe, or Flutterwave. Money goes to you. Shopora never sits in the middle of a sale.",
    icon: CreditCard,
    className: "md:col-span-2 bg-stone-950 text-white",
    iconClass: "bg-white/10 text-white",
    bodyClass: "text-stone-300",
  },
  {
    title: "A store that looks finished",
    description: "Products, categories, and a storefront on your .shopora.space address, or your own domain.",
    icon: Store,
    className: "bg-white",
    iconClass: "bg-emerald-50 text-emerald-700",
    bodyClass: "text-stone-600",
  },
  {
    title: "Orders that update themselves",
    description: "Confirmations, receipts, and shipping notes go out to customers without you copying them into email.",
    icon: Mail,
    className: "bg-white",
    iconClass: "bg-emerald-50 text-emerald-700",
    bodyClass: "text-stone-600",
  },
  {
    title: "Each store stays separate",
    description: "Customer lists, orders, and settings stay inside that store. Shopora runs the hosting and the security around it.",
    icon: ShieldCheck,
    className: "md:col-span-2 bg-white",
    iconClass: "bg-emerald-50 text-emerald-700",
    bodyClass: "text-stone-600",
  },
];

export function Features() {
  return (
    <section id="features" className="px-5 py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 max-w-2xl">
          <p className="text-sm font-medium text-emerald-700">The product</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-stone-950 md:text-4xl">
            A shop and a back office, without a cut of the sale.
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.article
                key={feature.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06 }}
                className={`rounded-3xl border border-stone-200 p-7 ${feature.className}`}
              >
                <div className={`mb-8 flex h-11 w-11 items-center justify-center rounded-2xl ${feature.iconClass}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-semibold tracking-tight">{feature.title}</h3>
                <p className={`mt-2 max-w-md text-sm leading-relaxed ${feature.bodyClass}`}>{feature.description}</p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
