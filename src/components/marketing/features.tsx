"use client";

import { motion } from "framer-motion";

const features = [
  {
    title: "Paid straight to you",
    body: "Customers pay by Mobile Money or bank transfer into your own account. Shopora never holds your money and takes 0% of the sale.",
  },
  {
    title: "A store that feels like your brand",
    body: "Your logo, cover, colour, announcement bar and story — all on your own address, yourstore.shopora.space.",
  },
  {
    title: "Product pages that sell",
    body: "Sizes and colours, swipeable photos, star reviews, sold-out states and one-tap sharing to WhatsApp and Instagram.",
  },
  {
    title: "Delivery across Accra",
    body: "Shopora riders collect from you and deliver to the customer’s exact GPS pin, with a live rate at checkout and a 6-digit code at the door.",
  },
  {
    title: "Orders that look after themselves",
    body: "Lock-screen alerts for every order, and confirmation, shipping and delivery emails sent to customers for you.",
  },
  {
    title: "Stock you can trust",
    body: "Nobody can buy more than you have. Cancelled orders return to stock, and low-stock items surface on your dashboard.",
  },
];

export function Features() {
  return (
    <section id="features" className="px-5 py-24 md:py-36">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 md:grid-cols-[0.8fr_1.2fr] md:items-end">
          <p className="text-[11px] uppercase tracking-[0.32em] text-stone-500">01 — The platform</p>
          <h2 className="font-display text-4xl leading-[1.02] tracking-[-0.01em] text-[#12100e] md:text-6xl">
            Everything a modern Ghanaian shop needs. <span className="italic text-stone-500">Nothing it doesn’t.</span>
          </h2>
        </div>

        <div className="mt-16 grid border-t border-stone-900/10 md:mt-24 md:grid-cols-3">
          {features.map((feature, index) => (
            <motion.article
              key={feature.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: (index % 3) * 0.08, duration: 0.5 }}
              className="border-b border-stone-900/10 py-10 md:px-8 md:[&:nth-child(3n+1)]:pl-0 md:[&:nth-child(3n)]:pr-0 md:[&:not(:nth-child(3n))]:border-r"
            >
              <p className="font-display text-lg italic text-[#8a6a3d]">{String(index + 1).padStart(2, "0")}</p>
              <h3 className="mt-6 font-display text-[1.9rem] leading-tight text-[#12100e]">{feature.title}</h3>
              <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-stone-600">{feature.body}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
