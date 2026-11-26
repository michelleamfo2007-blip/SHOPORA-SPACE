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
        <p className="store-kicker">{eyebrow}</p>
        <h1 className="mt-4 font-display text-5xl md:text-7xl">{title}</h1>
        <div className="store-rule mx-auto mt-6 w-16" />
      </div>

      <div className="divide-y divide-[var(--store-line)] border-y border-[var(--store-line)]">{children}</div>

      {contact && (whatsapp || contact.contactEmail) && (
        <div className="mt-14 border border-[var(--store-line)] px-6 py-10 text-center">
          <p className="font-display text-3xl">Still have a question?</p>
          <p className="mt-2 text-sm text-[var(--store-muted)]">{contact.storeName} is happy to help.</p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {whatsapp && (
              <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer" className="store-btn">
                Message on WhatsApp
              </a>
            )}
            {contact.contactEmail && (
              <a href={`mailto:${contact.contactEmail}`} className="store-btn-ghost">
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
