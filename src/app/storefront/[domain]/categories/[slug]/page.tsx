import { notFound } from "next/navigation";
import { getStoreByHost } from "@/lib/tenant";
import { db } from "@/lib/db";
import { headers } from "next/headers";
import { ProductsClient } from "../../products/ProductsClient";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function CategoryProductsPage({ 
  params 
}: { 
  params: Promise<{ domain: string, slug: string }> 
}) {
  const { domain, slug } = await params;
  const store = await getStoreByHost(domain);

  if (!store) {
    notFound();
  }

  const category = await db.category.findFirst({
    where: { 
      storeId: store.id,
      slug: slug
    }
  });

  if (!category) {
    notFound();
  }

  const headersList = await headers();
  const host = headersList.get("host") || "";
  const isPreview = host.includes("vercel.app") || host.includes("localhost:3000") || host === "shopora.space" || host === "www.shopora.space";
  const basePath = isPreview ? `/storefront/${domain}` : "";

  const products = await db.product.findMany({
    where: { 
      storeId: store.id,
      status: "ACTIVE",
      visibility: "VISIBLE",
      categories: {
        some: {
          id: category.id
        }
      }
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
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 relative">
          <Link 
            href={`${basePath}/categories`}
            className="absolute top-8 left-4 sm:left-6 lg:left-8 flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Categories
          </Link>
          <div className="text-center mt-8">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-4">
              {category.name}
            </h1>
            <div className="h-1 w-16 bg-slate-900 rounded-full mx-auto" style={{ backgroundColor: store.primaryColor || '#0f172a' }}></div>
          </div>
        </div>
      </div>
      
      {/* We reuse the ProductsClient, but maybe override the title in it? 
          Actually, ProductsClient has its own "All Products" title hardcoded. 
          Let's just pass the products to it. We might need to hide the title in ProductsClient if we use it here. */}
      
      <div className="-mt-12 md:-mt-20">
        <ProductsClient 
          products={products} 
          currency={store.currency} 
          primaryColor={store.primaryColor} 
          basePath={basePath} 
          title={null}
        />
      </div>
    </div>
  );
}
