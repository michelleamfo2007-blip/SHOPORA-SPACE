"use client";

import { motion } from "framer-motion";
import { Phone, RiderScreen, SellerHomeScreen, StoreBadges, VerifyScreen } from "@/components/marketing/mockups";

const sellerPoints = [
  "Order and payment alerts on your lock screen",
  "Verify MoMo payments and update orders in a tap",
  "Add products from your camera, with sizes and colours",
  "Stock, discounts, reviews, delivery and settings",
];

const riderPoints = [
  "Go online and accept Accra jobs",
  "Navigate to the customer’s exact pin",
  "Confirm every delivery with a 6-digit code",
];

export function AppShowcase() {
  return (
    <section id="app" className="overflow-hidden bg-[#12100e] px-5 py-24 text-white md:py-36">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-14 lg:grid-cols-[1fr_1fr] lg:items-end">
          <div>
            <p className="text-[11px] uppercase tracking-[0.32em] text-stone-500">02 — The Shopora app</p>
            <h2 className="mt-6 font-display text-4xl leading-[1.02] tracking-[-0.01em] md:text-6xl">
              The whole shop,
              <br />
              <span className="italic text-[#c8a165]">in your pocket.</span>
            </h2>
            <p className="mt-6 max-w-md text-[15px] leading-relaxed text-stone-400">
              One app for iPhone and Android, with two doors: <span className="text-white">I sell on Shopora</span> and{" "}
              <span className="text-white">I deliver for Shopora</span>. Your customers keep shopping on your website —
              no download needed.
            </p>
            <div className="mt-8">
              <StoreBadges dark />
            </div>
          </div>

          <div className="grid gap-10 sm:grid-cols-2">
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-[#c8a165]">For sellers</p>
              <ul className="mt-5 divide-y divide-white/10 border-t border-white/10">
                {sellerPoints.map((text) => (
                  <li key={text} className="py-3 text-sm text-stone-300">
                    {text}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-[#c8a165]">For riders</p>
              <ul className="mt-5 divide-y divide-white/10 border-t border-white/10">
                {riderPoints.map((text) => (
                  <li key={text} className="py-3 text-sm text-stone-300">
                    {text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="scrollbar-none -mx-5 mt-20 flex snap-x items-end gap-8 overflow-x-auto px-5 pb-4 lg:mx-0 lg:justify-center lg:overflow-visible lg:px-0"
        >
          {[
            { screen: <SellerHomeScreen />, caption: "Your day at a glance", lift: "" },
            { screen: <VerifyScreen />, caption: "Verify a MoMo payment", lift: "lg:-translate-y-12" },
            { screen: <RiderScreen />, caption: "Riders deliver to the pin", lift: "" },
          ].map((p) => (
            <figure key={p.caption} className={`snap-center ${p.lift}`}>
              <Phone className="ring-1 ring-white/10">{p.screen}</Phone>
              <figcaption className="mt-5 text-center font-display text-lg italic text-stone-400">{p.caption}</figcaption>
            </figure>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
