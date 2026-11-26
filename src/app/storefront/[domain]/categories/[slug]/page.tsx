import { notFound } from "next/navigation";
import Link from "next/link";
import { getStoreByHost } from "@/lib/tenant";
import { db } from "@/lib/db";
import { getStorefrontBasePath } from "@/lib/storefront";
import { ProductsClient } from "../../products/ProductsClient";
import { blackFridayIsLive, withSaleOnProduct } from "@/lib/black-friday";

export default async function CategoryProductsPage({
  params,
}: {
  params: Promise<{ domain: string; slug: string }>;
}) {
  const { domain, slug } = await params;
  const store = await getStoreByHost(domain);

  if (!store) {
    notFound();
  }

  const category = await db.category.findFirst({
    where: { storeId: store.id, slug },
  });

  if (!category) {
    notFound();
  }

  const basePath = await getStorefrontBasePath(domain);

  const products = await db.product.findMany({
    where: {
      storeId: store.id,
      status: "ACTIVE",
      visibility: "VISIBLE",
      categories: { some: { id: category.id } },
    },
    include: { variants: { take: 2 } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mx-auto max-w-7xl px-5 pb-8 pt-12 text-center md:px-8 md:pt-20">
        <nav className="store-kicker">
          <Link href={`${basePath}/categories`} className="hover:text-[var(--store-ink)]">Collections</Link>
          <span className="mx-2">/</span>
          <span className="text-[var(--store-ink)]">{category.name}</span>
        </nav>
        <h1 className="mt-4 font-display text-5xl md:text-7xl">{category.name}</h1>
        <div className="store-rule mx-auto mt-6 w-16" />
      </div>
      <ProductsClient
        products={products.map((p) => ({ ...withSaleOnProduct(p, blackFridayIsLive(store)), categorySlugs: [category.slug] }))}
        categories={[]}
        currency={store.currency}
        basePath={basePath}
      />
    </div>
  );
}
