"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "Starter",
    price: "150",
    currency: "GHS",
    period: "/mo",
    description: "Perfect for new businesses just getting off the ground.",
    features: [
      "Up to 50 Products",
      "Bring Your Own Gateway",
      "Standard Support",
      "0% Transaction Fees",
    ],
    highlighted: false,
    cta: "Start Free Trial",
  },
  {
    name: "Pro",
    price: "350",
    currency: "GHS",
    period: "/mo",
    description: "For growing stores that need more power and automation.",
    features: [
      "Unlimited Products",
      "Bring Your Own Gateway",
      "Priority Support",
      "0% Transaction Fees",
      "Advanced Analytics",
      "Custom Domain",
    ],
    highlighted: true,
    cta: "Start Free Trial",
  },
  {
    name: "Enterprise",
    price: "Custom",
    currency: "",
    period: "",
    description: "Dedicated infrastructure and features for large operations.",
    features: [
      "Everything in Pro",
      "Dedicated Account Manager",
      "Custom Integrations",
      "SLA Guarantee",
    ],
    highlighted: false,
    cta: "Contact Sales",
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-24">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight mb-4">Simple, transparent pricing</h2>
          <p className="text-gray-600">No hidden fees, no revenue sharing. Pay a flat rate and keep all your profits.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 items-center">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative rounded-3xl p-8 ${
                plan.highlighted 
                  ? "bg-black text-white shadow-2xl scale-105 z-10" 
                  : "bg-white border border-gray-200"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-500 text-white px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                  Most Popular
                </div>
              )}
              
              <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
              <p className={`text-sm mb-6 ${plan.highlighted ? "text-gray-300" : "text-gray-500"}`}>
                {plan.description}
              </p>
              
              <div className="mb-8">
                <span className="text-4xl font-bold">{plan.currency}{plan.price}</span>
                <span className={plan.highlighted ? "text-gray-300" : "text-gray-500"}>{plan.period}</span>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm">
                    <Check className={`w-4 h-4 ${plan.highlighted ? "text-indigo-400" : "text-black"}`} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/login"
                className={`block text-center w-full py-3 rounded-full font-medium transition-colors ${
                  plan.highlighted
                    ? "bg-white text-black hover:bg-gray-100"
                    : "bg-black text-white hover:bg-gray-800"
                }`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
