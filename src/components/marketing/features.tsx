"use client";

import { motion } from "framer-motion";
import { Bell, Bike, Boxes, Palette, Shirt, Wallet } from "lucide-react";

const features = [
  {
    title: "Paid straight to your MoMo or bank",
    description:
      "Customers pay you directly by Mobile Money or bank transfer. Shopora never sits in the middle of a sale and takes 0% of it.",
    icon: Wallet,
    className: "md:col-span-2 bg-stone-950 text-white",
    iconClass: "bg-white/10 text-white",
    bodyClass: "text-stone-300",
  },
  {
    title: "A store that looks like your brand",
    description:
      "Your logo, cover, colour, announcement bar and story on yourstore.shopora.space, or your own domain.",
    icon: Palette,
    className: "bg-white",
    iconClass: "bg-emerald-50 text-emerald-700",
    bodyClass: "text-stone-600",
  },
  {
    title: "Product pages that sell",
    description:
      "Sizes and colours, swipeable photos, reviews with star ratings, sold-out badges, and one-tap sharing to WhatsApp.",
    icon: Shirt,
    className: "bg-white",
    iconClass: "bg-emerald-50 text-emerald-700",
    bodyClass: "text-stone-600",
  },
  {
    title: "Shopora Delivery in Accra",
    description:
      "Riders pick up from you and deliver to the customer’s exact GPS pin. Live delivery rates at checkout, a 6-digit code at the door, and a tracking link for the customer.",
    icon: Bike,
    className: "md:col-span-2 bg-white",
    iconClass: "bg-emerald-50 text-emerald-700",
    bodyClass: "text-stone-600",
  },
  {
    title: "Orders that update themselves",
    description:
      "Lock-screen alerts for new orders, plus confirmation, shipping and delivery emails to your customers, sent for you.",
    icon: Bell,
    className: "bg-white",
    iconClass: "bg-emerald-50 text-emerald-700",
    bodyClass: "text-stone-600",
  },
  {
    title: "Stock you can trust",
    description:
      "Customers can’t order more than you have. Cancelled orders go back into stock, and low-stock items show on your dashboard.",
    icon: Boxes,
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
            A shop, a back office and delivery, without a cut of the sale.
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
