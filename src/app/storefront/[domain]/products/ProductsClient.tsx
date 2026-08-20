"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";

type Product = {
  id: string;
  name: string;
  images: string[];
  price: number | null;
  compareAtPrice: number | null;
  variants: { price: number; compareAtPrice: number | null; imageUrl: string | null }[];
};

type Props = {
  products: Product[];
  currency: string;
  primaryColor?: string | null;
  basePath: string;
  title?: string | null;
};

export function ProductsClient({ products, currency, primaryColor, basePath, title = "All Products" }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("newest");

  // Filter products based on search
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const priceA = a.variants[0]?.price ?? a.price ?? 0;
    const priceB = b.variants[0]?.price ?? b.price ?? 0;

    if (sortOption === "price-low-high") return priceA - priceB;
    if (sortOption === "price-high-low") return priceB - priceA;
    // default "newest" keeps original order from database (desc)
    return 0;
  });

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      <div className="mb-12">
        {title && (
          <>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-6">
              {title}
            </h1>
            <div className="h-1 w-20 bg-slate-900 rounded-full mb-8" style={{ backgroundColor: primaryColor || '#0f172a' }}></div>
          </>
        )}
        
        {/* Search and Filter Controls */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none transition-shadow"
              style={{ '--tw-ring-color': primaryColor || '#0f172a' } as React.CSSProperties}
            />
          </div>
          <div className="w-full md:w-auto flex items-center gap-2">
            <span className="text-sm font-medium text-slate-500 whitespace-nowrap">Sort by:</span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="w-full md:w-auto px-4 py-3 bg-slate-50 border-none rounded-xl font-medium focus:ring-2 focus:ring-slate-900 focus:outline-none cursor-pointer"
              style={{ '--tw-ring-color': primaryColor || '#0f172a' } as React.CSSProperties}
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price-low-high">Price: Low to High</option>
              <option value="price-high-low">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {sortedProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
          {sortedProducts.map((product) => {
            const variant = product.variants[0];
            const price = variant?.price ?? product.price ?? 0;
            const compareAtPrice = variant?.compareAtPrice ?? product.compareAtPrice ?? null;
            const imageUrl = variant?.imageUrl ?? product.images?.[0] ?? null;
            
            return (
              <Link key={product.id} href={`${basePath}/product/${product.id}`} className="group">
                <Card className="h-full overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-white rounded-2xl">
                  <div className="aspect-[4/5] bg-slate-100 relative w-full overflow-hidden">
                    {imageUrl ? (
                      <img 
                        src={imageUrl} 
                        alt={product.name} 
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-slate-400 bg-slate-50">
                        <span className="text-sm">No Image</span>
                      </div>
                    )}
                    {compareAtPrice !== null && compareAtPrice > price && (
                      <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md tracking-wider">
                        SALE
                      </div>
                    )}
                  </div>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg text-slate-900 truncate group-hover:text-blue-600 transition-colors mb-2">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="font-bold text-lg text-slate-900">
                        {currency} {price.toFixed(2)}
                      </span>
                      {compareAtPrice !== null && compareAtPrice > price && (
                        <span className="text-sm text-slate-400 line-through font-medium">
                          {currency} {compareAtPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <div className="w-full bg-slate-900 text-white text-center py-2.5 rounded-lg font-medium group-hover:bg-opacity-90 transition-all" style={{ backgroundColor: primaryColor || '#0f172a' }}>
                      View Product
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-slate-100">
          <p className="text-xl text-slate-500 font-medium mb-4">No products found.</p>
          <button 
            onClick={() => { setSearchQuery(""); setSortOption("newest"); }}
            className="text-slate-900 font-semibold hover:underline"
            style={{ color: primaryColor || '#0f172a' }}
          >
            Clear Search Filters
          </button>
        </div>
      )}
    </div>
  );
}
