"use client";

import { useState, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES } from "@/lib/data/mockData";
import { Search, SlidersHorizontal, Sparkles } from "lucide-react";

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc">("featured");

  const filteredProducts = useMemo(() => {
    return INITIAL_PRODUCTS.filter((product) => {
      const matchesCategory =
        selectedCategory === "all" || product.category.toLowerCase().includes(selectedCategory.toLowerCase());
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    }).sort((a, b) => {
      const priceA = a.variants[0]?.price || 0;
      const priceB = b.variants[0]?.price || 0;
      if (sortBy === "price-asc") return priceA - priceB;
      if (sortBy === "price-desc") return priceB - priceA;
      return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
    });
  }, [selectedCategory, searchQuery, sortBy]);

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#fffdf8] flex flex-col justify-between">
      <Header />

      <main className="w-full flex-1 px-4 py-8 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* BANNER */}
        <div className="rounded-[32px] bg-[#f8efd9] p-6 sm:p-10 relative overflow-hidden mb-8">
          <div className="max-w-2xl relative z-10">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-bold text-[#173b27] shadow-sm mb-3">
              <Sparkles size={14} className="text-[#c77828]" /> 100% Unadulterated
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-[#173b27] tracking-tight">
              Farm-to-Doorstep Products
            </h1>
            <p className="mt-3 text-sm sm:text-base text-[#52665d] leading-relaxed">
              Every bottle of milk, jar of Vedic ghee, and block of paneer is prepared with traditional village care without any synthetic additives.
            </p>
          </div>
        </div>

        {/* SEARCH & FILTERS BAR */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          {/* SEARCH INPUT */}
          <div className="relative flex-1 max-w-md">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search milk, curd, ghee, paneer..."
              className="w-full rounded-full border border-black/10 bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-[#126044] focus:ring-2 focus:ring-[#126044]/20 shadow-sm"
            />
          </div>

          {/* SORT SELECTOR */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            <SlidersHorizontal size={16} className="text-gray-500" />
            <span className="text-xs font-bold text-gray-600">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "featured" | "price-asc" | "price-desc")}
              className="rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-semibold text-[#173b27] shadow-sm outline-none focus:border-[#126044]"
            >
              <option value="featured">Featured First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* CATEGORY TABS */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none mb-8">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`whitespace-nowrap rounded-full px-5 py-2 text-xs sm:text-sm font-bold transition shadow-sm ${
              selectedCategory === "all"
                ? "bg-[#173b27] text-white"
                : "bg-white text-gray-700 border border-black/10 hover:bg-[#f8efd9]"
            }`}
          >
            All Products
          </button>
          {INITIAL_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory.toLowerCase() === cat.name.toLowerCase();
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`whitespace-nowrap rounded-full px-5 py-2 text-xs sm:text-sm font-bold transition shadow-sm ${
                  isSelected
                    ? "bg-[#173b27] text-white"
                    : "bg-white text-gray-700 border border-black/10 hover:bg-[#f8efd9]"
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* PRODUCTS GRID */}
        {filteredProducts.length === 0 ? (
          <div className="rounded-3xl border border-black/5 bg-white p-12 text-center shadow-sm">
            <span className="text-5xl">🥛</span>
            <h3 className="mt-4 text-xl font-bold text-[#173b27]">No dairy products found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search query or select another category filter.
            </p>
            <button
              onClick={() => {
                setSelectedCategory("all");
                setSearchQuery("");
              }}
              className="mt-4 rounded-full bg-[#126044] px-6 py-2.5 text-xs font-bold text-white"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
