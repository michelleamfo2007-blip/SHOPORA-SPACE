"use client";

import { motion } from "framer-motion";
import { Bell, Bike, Camera, Check, MapPin, Store } from "lucide-react";
import type { ReactNode } from "react";

/** Phone frame drawn in CSS so the mockups stay sharp and match the real app's colours. */
function Phone({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`relative w-[230px] shrink-0 rounded-[2.4rem] border-[9px] border-stone-900 bg-[#faf8f5] shadow-[0_40px_80px_-40px_rgba(28,25,23,0.55)] ${className}`}
    >
      <div className="absolute left-1/2 top-2 z-10 h-4 w-16 -translate-x-1/2 rounded-full bg-stone-900" />
      <div className="h-[460px] overflow-hidden rounded-[1.8rem] px-3.5 pb-3 pt-9 text-stone-900">{children}</div>
    </div>
  );
}

function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="text-[8px] uppercase tracking-[0.18em] text-stone-500">{children}</p>;
}

function SellerHome() {
  return (
    <Phone>
      <div className="mb-3 flex items-start gap-2 rounded-xl bg-stone-900 px-3 py-2 text-white shadow-lg">
        <Bell className="mt-0.5 h-3 w-3 shrink-0 text-amber-400" />
        <div className="text-[9px] leading-snug">
          <p className="font-semibold">New order · GHS 240</p>
          <p className="text-stone-300">Ama placed ORD-482193. Check the payment.</p>
        </div>
      </div>
      <Eyebrow>Atelier Accra</Eyebrow>
      <p className="mt-0.5 font-display text-xl">Hi Akosua</p>
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {[
          ["Revenue", "GHS 8,420"],
          ["Orders", "64"],
          ["Products", "38"],
          ["Store views", "1,902"],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-stone-200 bg-white p-2">
            <Eyebrow>{label}</Eyebrow>
            <p className="mt-0.5 text-[12px] font-semibold">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-2 rounded-lg border border-stone-200 bg-white p-2">
        <Eyebrow>Sales · last 7 days</Eyebrow>
        <div className="mt-2 flex h-16 items-end gap-1">
          {[35, 55, 40, 80, 60, 95, 70].map((h, i) => (
            <div key={i} className="flex-1 rounded-sm bg-stone-900" style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>
      <div className="mt-2 flex justify-between rounded-lg border border-stone-200 bg-white px-2 py-2 text-center">
        {[
          ["3", "To verify"],
          ["5", "Processing"],
          ["2", "Shipped"],
          ["54", "Delivered"],
        ].map(([n, l], i) => (
          <div key={l}>
            <p className={`text-[12px] font-semibold ${i === 0 ? "text-amber-700" : ""}`}>{n}</p>
            <p className="text-[7px] text-stone-500">{l}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 flex justify-around border-t border-stone-200 pt-2 text-[7px] text-stone-500">
        {["Home", "Orders", "Products", "More"].map((t, i) => (
          <span key={t} className={i === 0 ? "font-semibold text-stone-900" : ""}>
            {t}
          </span>
        ))}
      </div>
    </Phone>
  );
}

function VerifyOrder() {
  return (
    <Phone className="lg:-mt-10">
      <p className="text-[9px] text-stone-500">← Orders</p>
      <p className="mt-1 font-display text-lg">Order #ORD-482193</p>
      <span className="mt-1 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[8px] font-semibold text-amber-700">
        Verify payment
      </span>
      <div className="mt-2.5 rounded-lg border border-amber-200 bg-amber-50 p-2 text-[9px] leading-snug">
        <p className="font-semibold">Payment to check</p>
        <p>Customer paid with reference 0541234567.</p>
        <p className="text-stone-500">Expected: GHS 240.00</p>
      </div>
      <div className="mt-2 rounded-lg border border-stone-200 bg-white p-2">
        <Eyebrow>Items</Eyebrow>
        {[
          ["Kente print shirt", "M / Gold", "GHS 180.00"],
          ["Beaded bracelet", null, "GHS 60.00"],
        ].map(([n, v, p]) => (
          <div key={n} className="mt-1.5 flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-[#efe6d8]" />
            <div className="flex-1">
              <p className="text-[9px] font-medium">{n}</p>
              {v && <p className="text-[8px] text-stone-500">{v}</p>}
            </div>
            <p className="text-[9px]">{p}</p>
          </div>
        ))}
      </div>
      <div className="mt-2 rounded-lg border border-stone-200 bg-white p-2 text-[9px]">
        <Eyebrow>Delivery</Eyebrow>
        <p className="mt-0.5 font-semibold">Shopora Delivery</p>
        <p className="text-stone-500">East Legon, blue gate opp. Total</p>
        <p className="mt-1 font-semibold text-emerald-700">📍 Exact pin saved</p>
      </div>
      <div className="mt-2.5 rounded-full bg-stone-900 py-2 text-center text-[10px] font-semibold text-white">
        Verify payment
      </div>
      <div className="mt-1.5 rounded-full border border-stone-200 bg-white py-2 text-center text-[10px] font-semibold">
        Cancel order
      </div>
    </Phone>
  );
}

function RiderJob() {
  return (
    <Phone>
      <Eyebrow>Shopora riders · Accra</Eyebrow>
      <p className="mt-0.5 font-display text-lg">Kwame Mensah</p>
      <div className="mt-2 rounded-xl bg-emerald-700 px-3 py-2.5 text-white">
        <p className="text-[12px] font-semibold">You’re online</p>
        <p className="text-[8px] text-emerald-100">Tap to go offline</p>
      </div>
      <p className="mt-3 font-display text-sm">Open jobs</p>
      <div className="mt-1.5 rounded-lg border border-stone-200 bg-white p-2">
        <div className="flex justify-between">
          <div>
            <p className="text-[10px] font-semibold">Atelier Accra</p>
            <p className="text-[8px] text-stone-500">#ORD-482193</p>
          </div>
          <p className="text-[11px] font-bold">GHS 32.00</p>
        </div>
        <p className="mt-1 text-[8px] text-stone-600">
          <span className="text-stone-400">PICKUP</span> Osu Oxford St
        </p>
        <p className="text-[8px] text-stone-600">
          <span className="text-stone-400">DROPOFF</span> East Legon
        </p>
        <p className="mt-0.5 text-[8px] text-stone-500">7.2 km · ~22 mins · You keep GHS 27.20</p>
        <div className="relative mt-1.5 h-24 overflow-hidden rounded-md bg-[#e8efe6]">
          <svg viewBox="0 0 200 100" className="absolute inset-0 h-full w-full">
            <path d="M0 70 L60 55 L110 62 L200 30" stroke="#fff" strokeWidth="6" fill="none" />
            <path d="M40 0 L55 100" stroke="#fff" strokeWidth="4" fill="none" />
            <path d="M130 0 L150 100" stroke="#fff" strokeWidth="4" fill="none" />
            <path d="M45 58 Q100 40 150 38" stroke="#1c1917" strokeWidth="2" strokeDasharray="4 3" fill="none" />
          </svg>
          <span className="absolute left-5 top-11 rounded-full bg-stone-900 px-1.5 py-0.5 text-[7px] font-semibold text-white">
            Pickup
          </span>
          <span className="absolute right-6 top-5 rounded-full bg-amber-700 px-1.5 py-0.5 text-[7px] font-semibold text-white">
            Customer
          </span>
        </div>
        <div className="mt-1.5 rounded-full bg-stone-900 py-1.5 text-center text-[9px] font-semibold text-white">
          Accept delivery
        </div>
      </div>
      <div className="mt-2 rounded-lg border border-stone-200 bg-white p-2">
        <p className="text-[8px] text-stone-500">CUSTOMER’S 6-DIGIT CODE</p>
        <p className="mt-1 text-center text-base font-semibold tracking-[0.4em]">48 21 93</p>
      </div>
    </Phone>
  );
}

const sellerPoints = [
  { icon: Bell, text: "New-order and payment alerts on your lock screen" },
  { icon: Check, text: "Verify MoMo payments and update orders in one tap" },
  { icon: Camera, text: "Add products from your camera, with sizes and colours" },
  { icon: Store, text: "Your whole dashboard: stock, discounts, reviews, settings" },
];

const riderPoints = [
  { icon: Bike, text: "Go online and accept Accra jobs, first come first served" },
  { icon: MapPin, text: "Navigate to the customer’s exact pin, not a guess" },
  { icon: Check, text: "Confirm delivery with the customer’s 6-digit code" },
];

export function AppShowcase() {
  return (
    <section id="app" className="overflow-hidden px-5 py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div className="max-w-xl">
            <p className="text-sm font-medium text-emerald-700">The Shopora app</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-stone-950 md:text-4xl">
              Run your shop from your phone.
            </h2>
            <p className="mt-3 text-stone-600">
              One app with two doors: <strong className="font-medium text-stone-900">I sell on Shopora</strong> and{" "}
              <strong className="font-medium text-stone-900">I deliver for Shopora</strong>. Your customers keep shopping
              on your website, with no download needed.
            </p>
            <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-700">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              Android app coming soon
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">For sellers</p>
              <ul className="mt-3 space-y-3">
                {sellerPoints.map(({ icon: Icon, text }) => (
                  <li key={text} className="flex gap-3 text-sm text-stone-700">
                    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                    {text}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">For riders</p>
              <ul className="mt-3 space-y-3">
                {riderPoints.map(({ icon: Icon, text }) => (
                  <li key={text} className="flex gap-3 text-sm text-stone-700">
                    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                    {text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="scrollbar-none -mx-5 flex snap-x gap-6 overflow-x-auto px-5 pb-6 pt-12 lg:mx-0 lg:justify-center lg:overflow-visible lg:px-0"
        >
          <div className="snap-center">
            <SellerHome />
            <p className="mt-4 text-center text-sm text-stone-500">Seller home</p>
          </div>
          <div className="snap-center">
            <VerifyOrder />
            <p className="mt-4 text-center text-sm text-stone-500">Verify a MoMo payment</p>
          </div>
          <div className="snap-center">
            <RiderJob />
            <p className="mt-4 text-center text-sm text-stone-500">Rider jobs</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
