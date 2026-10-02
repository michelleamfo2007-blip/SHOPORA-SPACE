import { notFound } from "next/navigation";
import { getStoreByHost } from "@/lib/tenant";
import { db } from "@/lib/db";
import { getStorefrontBasePath } from "@/lib/storefront";
import { ProductsClient } from "./ProductsClient";

export default async function ProductsPage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params;
  const store = await getStoreByHost(domain);

  if (!store) {
    notFound();
  }

  const basePath = await getStorefrontBasePath(domain);

  const products = await db.product.findMany({
    where: { storeId: store.id, status: "ACTIVE", visibility: "VISIBLE" },
    include: { variants: { take: 2 } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mx-auto max-w-7xl px-5 pb-8 pt-12 text-center md:px-8 md:pt-20">
        <p className="text-[11px] uppercase tracking-[0.25em] text-stone-500">{store.name}</p>
        <h1 className="mt-4 font-display text-5xl md:text-7xl">Shop all</h1>
      </div>
      <ProductsClient products={products} currency={store.currency} basePath={basePath} />
    </div>
  );
}
