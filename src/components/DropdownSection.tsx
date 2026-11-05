import { Minus, Plus } from "lucide-react"

/** A heading that opens to show its content (FAQs, policies, terms). */
export function DropdownSection({
  title,
  children,
  defaultOpen = false,
}: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  return (
    <details className="group" open={defaultOpen}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 [&::-webkit-details-marker]:hidden">
        <h2 className="font-display text-2xl leading-snug">{title}</h2>
        <Plus aria-hidden className="h-5 w-5 shrink-0 text-stone-500 group-open:hidden" strokeWidth={1.25} />
        <Minus aria-hidden className="hidden h-5 w-5 shrink-0 text-stone-500 group-open:block" strokeWidth={1.25} />
      </summary>
      <div className="whitespace-pre-line pb-7 pr-10 leading-relaxed text-stone-600">{children}</div>
    </details>
  )
}
