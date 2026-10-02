import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getStoreByHost } from "@/lib/tenant";
import { db } from "@/lib/db";
import { getStorefrontBasePath } from "@/lib/storefront";

export default async function CategoriesPage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params;
  const store = await getStoreByHost(domain);

  if (!store) {
    notFound();
  }

  const basePath = await getStorefrontBasePath(domain);

  const categories = await db.category.findMany({
    where: { storeId: store.id, products: { some: { status: "ACTIVE", visibility: "VISIBLE" } } },
    orderBy: { name: "asc" },
    include: {
      products: {
        where: { status: "ACTIVE", visibility: "VISIBLE" },
        select: { images: true, variants: { select: { imageUrl: true }, take: 1 } },
      },
    },
  });

  return (
    <div className="mx-auto max-w-7xl px-5 md:px-8">
      <div className="pb-12 pt-12 text-center md:pt-20">
        <p className="text-[11px] uppercase tracking-[0.25em] text-stone-500">{store.name}</p>
        <h1 className="mt-4 font-display text-5xl md:text-7xl">Collections</h1>
      </div>

      {categories.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
          {categories.map((cat) => {
            const cover = cat.products[0]?.variants[0]?.imageUrl || cat.products[0]?.images[0];
            return (
              <Link key={cat.id} href={`${basePath}/categories/${cat.slug}`} className="group relative aspect-[4/5] overflow-hidden bg-[#efebe4]">
                {cover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={cover} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/55 via-transparent to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-6 text-white">
                  <div>
                    <h2 className="font-display text-3xl">{cat.name}</h2>
                    <p className="mt-1 text-xs uppercase tracking-[0.2em] text-white/75">
                      {cat.products.length} {cat.products.length === 1 ? "piece" : "pieces"}
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" strokeWidth={1.25} />
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="border border-dashed border-stone-300 px-6 py-20 text-center">
          <p className="font-display text-3xl">Collections are coming soon</p>
          <Link href={`${basePath}/products`} className="mt-4 inline-block text-sm text-stone-600 underline underline-offset-4 hover:text-stone-900">
            Shop all products
          </Link>
        </div>
      )}
    </div>
  );
}
