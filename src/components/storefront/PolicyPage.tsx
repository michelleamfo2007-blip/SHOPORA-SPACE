import { Minus, Plus } from "lucide-react"

type Contact = {
  storeName: string
  whatsappNumber?: string | null
  contactEmail?: string | null
}

export function PolicyPage({
  eyebrow,
  title,
  children,
  contact,
}: {
  eyebrow: string
  title: string
  children: React.ReactNode
  contact?: Contact
}) {
  const whatsapp = contact?.whatsappNumber?.replace(/[^0-9]/g, "")

  return (
    <div className="mx-auto max-w-3xl px-5 pb-24 pt-12 md:px-8 md:pt-20">
      <div className="mb-12 text-center md:mb-16">
        <p className="text-[11px] uppercase tracking-[0.25em] text-stone-500">{eyebrow}</p>
        <h1 className="mt-4 font-display text-5xl md:text-7xl">{title}</h1>
      </div>

      <div className="divide-y divide-stone-200 border-y border-stone-200">{children}</div>

      {contact && (whatsapp || contact.contactEmail) && (
        <div className="mt-14 bg-[#f3efe8] px-6 py-10 text-center">
          <p className="font-display text-3xl">Still have a question?</p>
          <p className="mt-2 text-sm text-stone-600">{contact.storeName} is happy to help.</p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {whatsapp && (
              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-12 items-center rounded-full bg-[var(--store-accent)] px-8 text-sm tracking-wide text-white hover:opacity-90"
              >
                Message on WhatsApp
              </a>
            )}
            {contact.contactEmail && (
              <a
                href={`mailto:${contact.contactEmail}`}
                className="inline-flex h-12 items-center rounded-full border border-stone-900 px-8 text-sm tracking-wide text-stone-900 hover:bg-stone-900 hover:text-white"
              >
                {contact.contactEmail}
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/** A question that opens to show its answer. */
export function FaqItem({ question, children }: { question: string; children: React.ReactNode }) {
  return (
    <details className="group">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 [&::-webkit-details-marker]:hidden">
        <h2 className="font-display text-2xl leading-snug">{question}</h2>
        <Plus aria-hidden className="h-5 w-5 shrink-0 text-stone-500 group-open:hidden" strokeWidth={1.25} />
        <Minus aria-hidden className="hidden h-5 w-5 shrink-0 text-stone-500 group-open:block" strokeWidth={1.25} />
      </summary>
      <div className="whitespace-pre-line pb-7 pr-10 leading-relaxed text-stone-600">{children}</div>
    </details>
  )
}

export function PolicySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-3 py-8 md:grid-cols-[14rem_1fr] md:gap-10">
      <h2 className="font-display text-2xl leading-snug">{title}</h2>
      <div className="whitespace-pre-line leading-relaxed text-stone-600">{children}</div>
    </section>
  )
}
