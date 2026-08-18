import { db } from "@/lib/db";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

export default async function ShowcasePage() {
  const stores = await db.store.findMany({
    where: { status: "ACTIVE" },
    take: 12,
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">Discover Our Merchants</h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Explore beautiful storefronts built on Shopora by incredible entrepreneurs around the world.
          </p>
        </div>

        {stores.length === 0 ? (
          <div className="text-center py-20 text-slate-500 bg-slate-50 rounded-2xl">
            No stores to showcase yet. Be the first!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {stores.map((store) => (
              <a 
                key={store.id} 
                href={`https://${store.slug}.shopora.space`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="group block"
              >
                <Card className="h-full overflow-hidden hover:shadow-xl transition-all duration-300 border-slate-100 group-hover:-translate-y-1">
                  <div 
                    className="h-40 w-full relative flex items-center justify-center p-6"
                    style={{ backgroundColor: store.primaryColor || "#0f172a" }}
                  >
                    {store.logoUrl ? (
                      <img src={store.logoUrl} alt={store.name} className="max-h-full max-w-full object-contain drop-shadow-md" />
                    ) : (
                      <h2 className="text-2xl font-bold text-white drop-shadow-md">{store.name}</h2>
                    )}
                  </div>
                  <CardContent className="p-6 bg-white">
                    <h3 className="font-semibold text-lg text-slate-900 group-hover:text-blue-600 transition-colors mb-2">
                      {store.name}
                    </h3>
                    <p className="text-sm text-slate-500 line-clamp-2">
                      {store.description || "A beautiful store built on Shopora."}
                    </p>
                    <p className="text-xs text-slate-400 mt-4 uppercase tracking-widest font-medium">
                      {store.country} • {store.currency}
                    </p>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
