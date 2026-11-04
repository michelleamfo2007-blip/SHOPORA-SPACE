"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";
import { ProductCard } from "@/components/storefront/ProductCard";

type Product = {
  id: string;
  name: string;
  description: string | null;
  images: string[];
  price: number | null;
  compareAtPrice: number | null;
  stockCount: number;
  categorySlugs: string[];
  variants: { price: number; compareAtPrice: number | null; imageUrl: string | null; stockCount: number }[];
};

type Props = {
  products: Product[];
  categories: { name: string; slug: string }[];
  currency: string;
  basePath: string;
  initialQuery?: string;
  initialCategory?: string;
  autoFocusSearch?: boolean;
};

function priceOf(p: Product) {
  return p.variants[0]?.price ?? p.price ?? 0;
}

function onSale(p: Product) {
  const compare = p.variants[0]?.compareAtPrice ?? p.compareAtPrice;
  return compare != null && compare > priceOf(p);
}

function inStock(p: Product) {
  return p.variants.length ? p.variants.some((v) => v.stockCount > 0) : p.stockCount > 0;
}

export function ProductsClient({
  products,
  categories,
  currency,
  basePath,
  initialQuery = "",
  initialCategory = "",
  autoFocusSearch,
}: Props) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [sortOption, setSortOption] = useState("newest");
  const [category, setCategory] = useState(
    categories.some((c) => c.slug === initialCategory) ? initialCategory : ""
  );
  const [saleOnly, setSaleOnly] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);

  const q = searchQuery.trim().toLowerCase();
  const filteredProducts = products.filter(
    (product) =>
      (!q || product.name.toLowerCase().includes(q) || product.description?.toLowerCase().includes(q)) &&
      (!category || product.categorySlugs.includes(category)) &&
      (!saleOnly || onSale(product)) &&
      (!inStockOnly || inStock(product))
  );

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortOption === "price-low-high") return priceOf(a) - priceOf(b);
    if (sortOption === "price-high-low") return priceOf(b) - priceOf(a);
    return 0;
  });

  const anyOnSale = products.some(onSale);
  const filtersActive = !!q || !!category || saleOnly || inStockOnly;

  function clearAll() {
    setSearchQuery("");
    setCategory("");
    setSaleOnly(false);
    setInStockOnly(false);
    setSortOption("newest");
  }

  const chip = (active: boolean) =>
    `inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-4 text-[13px] transition-colors ${
      active ? "border-stone-900 bg-stone-900 text-white" : "border-stone-300 text-stone-700 hover:border-stone-900"
    }`;

  return (
    <div className="mx-auto max-w-7xl px-5 md:px-8">
      <div className="sticky top-16 z-30 -mx-5 mb-6 border-b border-stone-200 bg-[#faf8f5]/95 px-5 py-3 backdrop-blur md:top-20 md:mx-0 md:px-0">
        <div className="flex items-center justify-between gap-4">
          <label className="relative flex flex-1 items-center md:max-w-sm">
            <Search className="pointer-events-none absolute left-0 h-4 w-4 text-stone-500" strokeWidth={1.5} />
            <input
              type="search"
              placeholder="Search products"
              value={searchQuery}
              autoFocus={autoFocusSearch}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full bg-transparent pl-7 pr-7 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-0 flex h-8 w-8 items-center justify-center text-stone-500"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
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

        <div className="scrollbar-none -mx-5 mt-3 flex gap-2 overflow-x-auto px-5 md:mx-0 md:flex-wrap md:px-0">
          {categories.length > 0 && (
            <button onClick={() => setCategory("")} className={chip(!category)}>
              All
            </button>
          )}
          {categories.map((c) => (
            <button key={c.slug} onClick={() => setCategory(category === c.slug ? "" : c.slug)} className={chip(category === c.slug)}>
              {c.name}
            </button>
          ))}
          {anyOnSale && (
            <button onClick={() => setSaleOnly((v) => !v)} className={chip(saleOnly)}>
              On sale
            </button>
          )}
          <button onClick={() => setInStockOnly((v) => !v)} className={chip(inStockOnly)}>
            In stock
          </button>
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
          {products.length > 0 && filtersActive && (
            <button
              onClick={clearAll}
              className="mt-4 text-sm text-stone-600 underline underline-offset-4 hover:text-stone-900"
            >
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
