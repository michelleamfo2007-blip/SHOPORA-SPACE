import { DropdownSection } from "@/components/DropdownSection"

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

      <div className="[&>details]:border-t [&>details]:border-[var(--store-line)] [&>details:last-of-type]:border-b">{children}</div>

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

export { DropdownSection as PolicySection }

/**
 * A seller-written policy. Blank lines split paragraphs; a short first line with no full stop
 * (e.g. "What we collect") becomes a dropdown heading.
 */
export function PolicyText({ text }: { text: string }) {
  const blocks = text.trim().split(/\n\s*\n/)
  const intro: string[] = []
  const sections: { title: string; body: string }[] = []

  for (const block of blocks) {
    const [first, ...rest] = block.split("\n")
    const isHeading = rest.length > 0 && first.trim().length <= 60 && !/[.!?:]$/.test(first.trim())
    if (isHeading) {
      sections.push({ title: first.trim(), body: rest.join("\n").trim() })
    } else if (sections.length === 0) {
      intro.push(block)
    } else {
      sections[sections.length - 1].body += `\n\n${block}`
    }
  }

  return (
    <>
      {intro.length > 0 && (
        <p className="mx-auto mb-12 max-w-2xl text-center font-display text-2xl italic leading-snug text-[var(--store-ink)] md:mb-16 md:text-3xl">
          {intro.join("\n\n")}
        </p>
      )}
      {sections.map((section) => (
        <DropdownSection key={section.title} title={section.title}>
          {section.body}
        </DropdownSection>
      ))}
    </>
  )
}
