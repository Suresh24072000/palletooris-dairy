"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Minus, ShoppingCart, Check, Sparkles } from "lucide-react";
import { Product, ProductVariant } from "@/types/dairy";
import { useCart } from "@/lib/context/CartContext";

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(
    product.variants[0] || {
      id: "var-default",
      productId: product.id,
      name: "Standard",
      price: 0,
      stock: 50,
      isAvailable: true,
      unit: "unit",
    }
  );
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addToCart({
      productId: product.id,
      variantId: selectedVariant.id,
      name: product.name,
      variantName: selectedVariant.name,
      price: selectedVariant.price,
      image: product.image,
      quantity,
      unit: selectedVariant.unit,
    });

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const discountPercent =
    selectedVariant.originalPrice && selectedVariant.originalPrice > selectedVariant.price
      ? Math.round(
          ((selectedVariant.originalPrice - selectedVariant.price) /
            selectedVariant.originalPrice) *
            100
        )
      : null;

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-[26px] border border-black/5 bg-[#fffdf8] p-4 sm:p-5 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      {/* BADGES */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
        {product.isFeatured ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#126044] px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
            <Sparkles size={12} /> Farm Best
          </span>
        ) : (
          <span />
        )}

        {discountPercent ? (
          <span className="rounded-full bg-[#c77828] px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
            {discountPercent}% OFF
          </span>
        ) : null}
      </div>

      <div>
        {/* PRODUCT IMAGE */}
        <Link
          href={`/products/${product.slug}`}
          className="relative block h-[210px] w-full overflow-hidden rounded-2xl bg-[#f8efd9] transition-transform duration-300 group-hover:scale-[1.02]"
        >
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        </Link>

        {/* DETAILS */}
        <div className="mt-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#b77932]">
            {product.category}
          </p>

          <Link href={`/products/${product.slug}`}>
            <h3 className="mt-1 text-lg font-bold text-[#173b27] group-hover:text-[#126044] transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>

          <p className="mt-1 text-xs leading-relaxed text-[#52665d] line-clamp-2 min-h-[32px]">
            {product.shortDescription}
          </p>
        </div>

        {/* VARIANT SELECTOR */}
        {product.variants.length > 1 ? (
          <div className="mt-3">
            <label className="text-[11px] font-semibold text-gray-500 mb-1 block">
              Select Size:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {product.variants.map((v) => {
                const isSelected = selectedVariant.id === v.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedVariant(v);
                    }}
                    className={`rounded-xl px-2.5 py-1 text-xs font-semibold transition ${
                      isSelected
                        ? "bg-[#173b27] text-white shadow-sm"
                        : "border border-black/10 bg-white text-gray-700 hover:bg-[#f8efd9]"
                    }`}
                  >
                    {v.name}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="mt-3">
            <span className="inline-block text-xs font-semibold text-gray-500">
              Size: {selectedVariant.name}
            </span>
          </div>
        )}

        {/* PRICE & AVAILABILITY */}
        <div className="mt-4 flex items-baseline justify-between border-t border-black/5 pt-3">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-[#173b27]">
                ₹{selectedVariant.price}
              </span>
              {selectedVariant.originalPrice && selectedVariant.originalPrice > selectedVariant.price && (
                <span className="text-xs text-gray-400 line-through">
                  ₹{selectedVariant.originalPrice}
                </span>
              )}
            </div>
            <span className="text-[10px] text-gray-500">
              Incl. of all taxes
            </span>
          </div>

          <div>
            {selectedVariant.stock <= 5 && selectedVariant.stock > 0 ? (
              <span className="text-[11px] font-semibold text-amber-700">
                Only {selectedVariant.stock} left
              </span>
            ) : selectedVariant.stock > 0 ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                In Stock
              </span>
            ) : (
              <span className="text-[11px] font-bold text-red-600">
                Sold Out
              </span>
            )}
          </div>
        </div>
      </div>

      {/* QUANTITY & ADD TO CART ACTION */}
      <div className="mt-4 flex items-center gap-2">
        <div className="flex h-11 items-center rounded-full border border-black/10 bg-white px-2 shadow-sm">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
            }}
            className="flex h-7 w-7 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100"
            aria-label="Decrease quantity"
          >
            <Minus size={14} />
          </button>
          <span className="w-6 text-center text-xs font-bold text-[#173b27]">
            {quantity}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setQuantity((prev) => prev + 1);
            }}
            className="flex h-7 w-7 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100"
            aria-label="Increase quantity"
          >
            <Plus size={14} />
          </button>
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!selectedVariant.isAvailable || selectedVariant.stock === 0}
          className={`flex h-11 flex-1 items-center justify-center gap-2 rounded-full px-4 text-xs sm:text-sm font-bold shadow-md transition-all ${
            isAdded
              ? "bg-emerald-700 text-white"
              : selectedVariant.stock === 0
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-[#126044] text-white hover:bg-[#0e5039] active:scale-95"
          }`}
        >
          {isAdded ? (
            <>
              <Check size={16} /> Added!
            </>
          ) : (
            <>
              <ShoppingCart size={16} /> Add to Cart
            </>
          )}
        </button>
      </div>
    </div>
  );
}
