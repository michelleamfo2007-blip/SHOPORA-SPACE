import Link from "next/link"
import { RIDER_TERMS } from "@/lib/rider-terms"
import { DropdownSection } from "@/components/DropdownSection"

export default function RiderTermsPage() {
  return (
    <div className="min-h-screen bg-[#faf8f5] px-5 py-14 text-stone-900">
      <article className="mx-auto max-w-2xl">
        <p className="text-[11px] uppercase tracking-[0.22em] text-stone-500">{RIDER_TERMS.brand}</p>
        <h1 className="mt-2 font-display text-4xl leading-tight">{RIDER_TERMS.title}</h1>
        <p className="mt-3 text-sm text-stone-600">Effective Date: {RIDER_TERMS.effectiveDate}</p>
        <p className="mt-1 text-xs text-stone-500">Version {RIDER_TERMS.version}</p>

        <div className="mt-6 border border-stone-900 bg-white px-5 py-4">
          <p className="text-sm font-medium">
            Commission: Shopora {RIDER_TERMS.cutPercent}% · Rider {RIDER_TERMS.riderPercent}%
          </p>
          <p className="mt-1 text-sm text-stone-600">
            Calculated on the delivery fee only — not on the product total. Example on GH₵30: Shopora GH₵4.50,
            rider GH₵25.50.
          </p>
        </div>

        <div className="mt-10 divide-y divide-stone-200 border-y border-stone-200">
          {RIDER_TERMS.sections.map((section) => (
            <DropdownSection key={section.heading} title={section.heading}>
              {section.paragraphs?.map((p) => (
                <p key={p.slice(0, 48)} className="mt-3 text-sm leading-relaxed text-stone-700 first:mt-0">
                  {p}
                </p>
              ))}
              {"numbered" in section && section.numbered && (
                <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-stone-700">
                  {section.numbered.map((item: string) => (
                    <li key={item}>{item}</li>
                  ))}
                </ol>
              )}
              {"bullets" in section && section.bullets && (
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-stone-700">
                  {section.bullets.map((item: string) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
              {"note" in section && section.note && (
                <p className="mt-3 text-sm leading-relaxed text-stone-700">{section.note}</p>
              )}
            </DropdownSection>
          ))}
        </div>

        <section className="mt-12 border border-stone-200 bg-white px-5 py-6">
          <h2 className="font-display text-2xl">{RIDER_TERMS.acceptance.title}</h2>
          <p className="mt-3 text-sm leading-relaxed text-stone-700">{RIDER_TERMS.acceptance.intro}</p>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-stone-700">
            {RIDER_TERMS.acceptance.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ol>
          <p className="mt-4 text-sm leading-relaxed text-stone-700">{RIDER_TERMS.acceptance.electronic}</p>
        </section>

        <footer className="mt-12 border-t border-stone-200 pt-6 text-sm text-stone-600">
          <p className="font-medium text-stone-900">{RIDER_TERMS.brand}</p>
          <p className="mt-2">
            Official Website:{" "}
            <a href={RIDER_TERMS.website} className="underline">
              {RIDER_TERMS.website}
            </a>
          </p>
          <p className="mt-1">
            Email:{" "}
            <a href={`mailto:${RIDER_TERMS.supportEmail}`} className="underline">
              {RIDER_TERMS.supportEmail}
            </a>
          </p>
        </footer>

        <Link href="/rider/signup" className="mt-8 inline-block text-sm underline">
          Back to rider signup
        </Link>
      </article>
    </div>
  )
}
