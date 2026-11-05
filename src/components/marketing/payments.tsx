"use client";

import { motion } from "framer-motion";
import { Bike, Building2, Smartphone, Wallet } from "lucide-react";

const methods = [
  { name: "MTN MoMo", className: "bg-[#ffcc00] text-stone-950" },
  { name: "Telecel Cash", className: "bg-[#e60000] text-white" },
  { name: "AT Money", className: "bg-[#0057b8] text-white" },
  { name: "Bank transfer", className: "bg-stone-900 text-white" },
];

const steps = [
  {
    title: "Customer orders on your store",
    body: "They see your MoMo number or bank details at checkout, with copy buttons and a quick *170# dial for MTN.",
  },
  {
    title: "They pay you directly",
    body: "The money lands in your own MoMo wallet or bank account. They enter the transaction reference with the order.",
  },
  {
    title: "You verify, the order moves",
    body: "Match the reference to your MoMo alert, tap Verify payment, and the customer gets their confirmation email.",
  },
];

const facts = [
  {
    icon: Wallet,
    title: "0% of your sales",
    body: "Shopora never touches the product money. No commission, no payout delays, no gateway fees from us.",
  },
  {
    icon: Bike,
    title: "Delivery paid on arrival",
    body: "With Shopora Delivery in Accra, the customer pays the rider when the order arrives. It costs you nothing.",
  },
  {
    icon: Smartphone,
    title: "Your subscription, by MoMo",
    body: "Pay your monthly plan by MoMo or bank transfer from Billing, and submit the reference. No card needed.",
  },
  {
    icon: Building2,
    title: "MoMo, bank, or both",
    body: "Add your MoMo number, your bank account, or both under Payment details. Change them any time from the app.",
  },
];

export function Payments() {
  return (
    <section id="payments" className="px-5 py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 max-w-2xl">
          <p className="text-sm font-medium text-emerald-700">Payments</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-stone-950 md:text-4xl">
            Customers pay you the way Ghana already pays.
          </h2>
          <p className="mt-3 text-stone-600">Mobile Money and bank transfer, straight to you. Every cedi from the sale stays yours.</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {methods.map((m) => (
              <span key={m.name} className={`rounded-full px-4 py-2 text-sm font-semibold ${m.className}`}>
                {m.name}
              </span>
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((step, i) => (
            <motion.article
              key={step.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="rounded-3xl border border-stone-200 bg-white p-7"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-950 text-sm font-semibold text-white">
                {i + 1}
              </span>
              <h3 className="mt-6 text-lg font-semibold tracking-tight">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">{step.body}</p>
            </motion.article>
          ))}
        </div>

        <div className="mt-4 grid gap-4 rounded-3xl bg-stone-950 p-7 text-white md:grid-cols-4 md:p-9">
          {facts.map(({ icon: Icon, title, body }) => (
            <div key={title}>
              <Icon className="h-5 w-5 text-emerald-300" />
              <h3 className="mt-4 font-semibold">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-stone-400">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
