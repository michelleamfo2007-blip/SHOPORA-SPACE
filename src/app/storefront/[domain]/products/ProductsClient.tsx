"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { ProductCard } from "@/components/storefront/ProductCard";

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
  basePath: string;
};

export function ProductsClient({ products, currency, basePath }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("newest");

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const priceA = a.variants[0]?.price ?? a.price ?? 0;
    const priceB = b.variants[0]?.price ?? b.price ?? 0;

    if (sortOption === "price-low-high") return priceA - priceB;
    if (sortOption === "price-high-low") return priceB - priceA;
    return 0;
  });

  return (
    <div className="mx-auto max-w-7xl px-5 md:px-8">
      <div className="sticky top-16 z-30 -mx-5 mb-10 flex items-center justify-between gap-4 border-b border-stone-200 bg-[#faf8f5]/95 px-5 py-3 backdrop-blur md:top-20 md:mx-0 md:px-0">
        <label className="relative flex flex-1 items-center md:max-w-sm">
          <Search className="pointer-events-none absolute left-0 h-4 w-4 text-stone-500" strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full bg-transparent pl-7 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none"
          />
        </label>
        <div className="flex items-center gap-3">
          <span className="hidden text-xs uppercase tracking-[0.15em] text-stone-500 sm:inline">
            {sortedProducts.length} {sortedProducts.length === 1 ? "piece" : "pieces"}
          </span>
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="h-10 cursor-pointer bg-transparent text-sm text-stone-900 focus:outline-none"
            aria-label="Sort products"
          >
            <option value="newest">Newest</option>
            <option value="price-low-high">Price: low to high</option>
            <option value="price-high-low">Price: high to low</option>
          </select>
        </div>
      </div>

      {sortedProducts.length > 0 ? (
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4">
          {sortedProducts.map((product) => (
            <ProductCard key={product.id} product={product} currency={currency} basePath={basePath} />
          ))}
        </div>
      ) : (
        <div className="border border-dashed border-stone-300 px-6 py-20 text-center">
          <p className="font-display text-3xl">
            {products.length === 0 ? "New pieces are on their way" : "Nothing matches your search"}
          </p>
          {products.length > 0 && (
            <button
              onClick={() => { setSearchQuery(""); setSortOption("newest"); }}
              className="mt-4 text-sm text-stone-600 underline underline-offset-4 hover:text-stone-900"
            >
              Clear search
            </button>
          )}
        </div>
      )}
    </div>
  );
}
