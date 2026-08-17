"use client";

import { motion } from "framer-motion";
import { CreditCard, Zap, ShieldCheck, Globe } from "lucide-react";

const features = [
  {
    title: "Bring Your Own Gateway",
    description: "Connect your Paystack, Stripe, or Flutterwave account directly. No middlemen, no delayed payouts.",
    icon: CreditCard,
  },
  {
    title: "Zero Transaction Fees",
    description: "We don't take a cut of your sales. You pay a single flat monthly rate and keep 100% of your revenue.",
    icon: Zap,
  },
  {
    title: "Automated Workflows",
    description: "Order confirmations, receipts, and shipping updates are emailed to your customers automatically.",
    icon: Globe,
  },
  {
    title: "Secure & Isolated",
    description: "Your store data and customers are completely isolated. Shopora handles the security and infrastructure.",
    icon: ShieldCheck,
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 bg-gray-50/50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight mb-4">Everything you need to scale</h2>
          <p className="text-gray-600">Built from the ground up for modern merchants who want full control over their business and their money.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center mb-6">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
