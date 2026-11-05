"use client";

import { motion } from "framer-motion";

const methods = [
  { name: "MTN MoMo", dot: "bg-[#f5c400]" },
  { name: "Telecel Cash", dot: "bg-[#d71920]" },
  { name: "AT Money", dot: "bg-[#0057b8]" },
  { name: "Bank transfer", dot: "bg-[#12100e]" },
];

const steps = [
  {
    title: "Your customer checks out",
    body: "They see your MoMo number or bank details, with copy buttons and a one-tap *170# dial for MTN.",
  },
  {
    title: "They pay you directly",
    body: "The money lands in your own wallet or account. They add the transaction reference to the order.",
  },
  {
    title: "You verify, the order moves",
    body: "Match the reference to your MoMo alert and tap Verify. The customer is emailed their confirmation.",
  },
];

const facts = [
  ["0%", "of every sale stays with you"],
  ["GHS 0", "delivery cost to you — customers pay the rider on arrival"],
  ["MoMo", "or bank to pay your own Shopora plan. No card needed"],
];

/** The real checkout payment card, as customers see it. */
function CheckoutCard() {
  return (
    <div className="rounded-3xl bg-white p-7 shadow-[0_50px_100px_-50px_rgba(18,16,14,0.45)] ring-1 ring-stone-900/10 md:p-9">
      <p className="text-[10px] uppercase tracking-[0.24em] text-stone-500">How to pay · Atelier Accra</p>
      <p className="mt-4 text-sm text-stone-600">
        Send exactly <span className="font-semibold text-stone-950">GHS 240.00</span> to
      </p>
      <div className="mt-6 border-t border-stone-100 pt-6">
        <p className="text-[10px] uppercase tracking-[0.24em] text-stone-500">Mobile Money</p>
        <div className="mt-2 flex items-center justify-between">
          <p className="font-display text-3xl tracking-wide text-stone-950">054 123 4567</p>
          <span className="rounded-full border border-stone-300 px-3 py-1 text-[10px] uppercase tracking-[0.15em] text-stone-600">
            Copy
          </span>
        </div>
        <p className="mt-1 text-sm text-stone-500">Akosua Mensah</p>
        <span className="mt-4 inline-flex rounded-full border border-stone-900 px-4 py-2 text-xs text-stone-900">
          Dial *170# (MTN MoMo)
        </span>
      </div>
      <div className="mt-6 border-t border-stone-100 pt-6">
        <p className="text-[10px] uppercase tracking-[0.24em] text-stone-500">Bank transfer</p>
        <p className="mt-2 text-sm text-stone-600">GCB Bank</p>
        <div className="flex items-center justify-between">
          <p className="font-display text-2xl tracking-wide text-stone-950">1020 3344 5566</p>
          <span className="rounded-full border border-stone-300 px-3 py-1 text-[10px] uppercase tracking-[0.15em] text-stone-600">
            Copy
          </span>
        </div>
      </div>
      <div className="mt-7 rounded-full bg-[#12100e] py-3.5 text-center text-sm text-white">Place order · GHS 240.00</div>
    </div>
  );
}

export function Payments() {
  return (
    <section id="payments" className="px-5 py-24 md:py-36">
      <div className="mx-auto grid max-w-6xl gap-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <p className="text-[11px] uppercase tracking-[0.32em] text-stone-500">03 — Payments</p>
          <h2 className="mt-6 font-display text-4xl leading-[1.02] tracking-[-0.01em] text-[#12100e] md:text-6xl">
            Paid the way <span className="italic text-[#8a6a3d]">Ghana</span> already pays.
          </h2>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
            {methods.map((m) => (
              <span key={m.name} className="flex items-center gap-2 text-sm text-stone-700">
                <span className={`h-2 w-2 rounded-full ${m.dot}`} />
                {m.name}
              </span>
            ))}
          </div>

          <ol className="mt-12 border-t border-stone-900/10">
            {steps.map((step, i) => (
              <motion.li
                key={step.title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="grid grid-cols-[3rem_1fr] gap-4 border-b border-stone-900/10 py-6"
              >
                <span className="font-display text-2xl italic text-[#8a6a3d]">{i + 1}</span>
                <div>
                  <h3 className="text-base font-medium text-stone-950">{step.title}</h3>
                  <p className="mt-1 text-[15px] leading-relaxed text-stone-600">{step.body}</p>
                </div>
              </motion.li>
            ))}
          </ol>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <CheckoutCard />
        </motion.div>
      </div>

      <div className="mx-auto mt-20 grid max-w-6xl gap-10 border-t border-stone-900/10 pt-12 md:grid-cols-3">
        {facts.map(([big, small]) => (
          <div key={big}>
            <p className="font-display text-5xl text-[#12100e]">{big}</p>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-stone-600">{small}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
