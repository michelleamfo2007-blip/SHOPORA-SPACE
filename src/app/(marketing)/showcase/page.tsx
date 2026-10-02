import { db } from "@/lib/db"
import { Navbar } from "@/components/marketing/navbar"
import { Footer } from "@/components/marketing/footer"
import { ArrowUpRight } from "lucide-react"

export const revalidate = 300

export default async function ShowcasePage() {
  const stores = await db.store.findMany({
    where: { status: "ACTIVE" },
    take: 12,
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="min-h-screen bg-stone-50 text-stone-950">
      <Navbar />
      <main className="mx-auto max-w-6xl px-5 pb-20 pt-28">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-stone-500">Shops on Shopora</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">Discover our merchants</h1>
          <p className="mt-4 text-base leading-relaxed text-stone-600 md:text-lg">
            Real storefronts from sellers on Shopora. Open a shop to see what they sell.
          </p>
        </div>

        {stores.length === 0 ? (
          <div className="mt-16 rounded-3xl border border-stone-200 bg-white px-6 py-16 text-center text-stone-500">
            No stores to showcase yet.
          </div>
        ) : (
          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {stores.map((store) => (
              <a
                key={store.id}
                href={`https://${store.slug}.shopora.space`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col overflow-hidden rounded-3xl border border-stone-200 bg-white transition-colors hover:border-stone-400"
              >
                <div
                  className="relative h-44 overflow-hidden"
                  style={{ backgroundColor: store.primaryColor || "#0a0a0a" }}
                >
                  {store.heroImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={store.heroImage}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : store.logoUrl ? (
                    <div className="flex h-full items-center justify-center bg-stone-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={store.logoUrl}
                        alt=""
                        className="h-28 w-28 object-contain"
                      />
                    </div>
                  ) : (
                    <div className="flex h-full items-end p-5">
                      <p className="text-2xl font-semibold text-white">{store.name}</p>
                    </div>
                  )}
                  {store.heroImage && store.logoUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={store.logoUrl}
                      alt=""
                      className="absolute bottom-3 left-3 h-12 w-12 rounded-xl bg-white object-contain p-1"
                    />
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h2 className="text-lg font-semibold tracking-tight">{store.name}</h2>
                  <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-stone-500">
                    {store.description || "Shop this store on Shopora."}
                  </p>
                  <p className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-stone-950">
                    {store.slug}.shopora.space
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </p>
                </div>
              </a>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
