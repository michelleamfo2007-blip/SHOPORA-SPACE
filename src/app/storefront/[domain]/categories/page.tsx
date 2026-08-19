import { notFound } from "next/navigation";
import Link from "next/link";
import { getStoreByHost } from "@/lib/tenant";
import { db } from "@/lib/db";
import { headers } from "next/headers";

export default async function CategoriesPage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params;
  const store = await getStoreByHost(domain);

  if (!store) {
    notFound();
  }

  const headersList = await headers();
  const host = headersList.get("host") || "";
  const isPreview = host.includes("vercel.app") || host.includes("localhost:3000");
  const basePath = isPreview && !host.startsWith(domain) ? `/storefront/${domain}` : "";

  const categories = await db.category.findMany({
    where: { storeId: store.id },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="bg-slate-50 min-h-screen py-12 md:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-6">
            All Categories
          </h1>
          <div className="h-1 w-20 bg-slate-900 rounded-full mx-auto md:mx-0 mb-8" style={{ backgroundColor: store.primaryColor || '#0f172a' }}></div>
          <p className="text-lg text-slate-600 max-w-2xl">
            Browse our full collection of categories to find exactly what you're looking for.
          </p>
        </div>

        {categories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {categories.map((cat) => (
              <Link 
                key={cat.id} 
                href={`${basePath}/categories/${cat.slug}`} 
                className="group relative h-72 overflow-hidden rounded-3xl shadow-md hover:shadow-2xl transition-all duration-500"
              >
                <div className="absolute inset-0 bg-slate-200">
                  <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400 group-hover:scale-105 transition-transform duration-700">
                    <span className="text-sm font-medium">{cat.name}</span>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
                  <h3 className="text-2xl font-bold mb-2 group-hover:-translate-y-2 transition-transform duration-300">{cat.name}</h3>
                  <div className="h-0.5 w-12 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-x-4 group-hover:translate-x-0"></div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-slate-100">
            <p className="text-xl text-slate-500 font-medium">Categories coming soon.</p>
          </div>
        )}
      </div>
    </div>
  );
}
