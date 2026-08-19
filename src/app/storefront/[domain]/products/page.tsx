import { notFound } from "next/navigation";
import { getStoreByHost } from "@/lib/tenant";
import { db } from "@/lib/db";
import { headers } from "next/headers";
import { ProductsClient } from "./ProductsClient";

export default async function ProductsPage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params;
  const store = await getStoreByHost(domain);

  if (!store) {
    notFound();
  }

  const headersList = await headers();
  const host = headersList.get("host") || "";
  const isPreview = host.includes("vercel.app") || host.includes("localhost:3000") || host === "shopora.space" || host === "www.shopora.space";
  const basePath = isPreview && !host.startsWith(domain) ? `/storefront/${domain}` : "";

  const products = await db.product.findMany({
    where: { 
      storeId: store.id,
      isActive: true
    },
    include: {
      variants: {
        take: 1
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="bg-slate-50 min-h-screen">
      <ProductsClient 
        products={products} 
        currency={store.currency} 
        primaryColor={store.primaryColor} 
        basePath={basePath} 
      />
    </div>
  );
}
