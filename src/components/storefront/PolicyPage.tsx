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

export { DropdownSection as PolicySection } from "@/components/DropdownSection"

/**
 * A seller-written policy. Blank lines split paragraphs; a short first line with no full stop
 * (e.g. "What we collect") is shown as a heading.
 */
export function PolicyText({ text }: { text: string }) {
  const blocks = text.trim().split(/\n\s*\n/)
  return (
    <article className="space-y-6 py-8 text-[15px] leading-relaxed text-stone-700">
      {blocks.map((block, i) => {
        const [first, ...rest] = block.split("\n")
        const isHeading = rest.length > 0 && first.trim().length <= 60 && !/[.!?:]$/.test(first.trim())
        return (
          <section key={i}>
            {isHeading && <h2 className="mb-1.5 font-display text-2xl text-stone-950">{first.trim()}</h2>}
            <p className="whitespace-pre-line">{isHeading ? rest.join("\n") : block}</p>
          </section>
        )
      })}
    </article>
  )
}
