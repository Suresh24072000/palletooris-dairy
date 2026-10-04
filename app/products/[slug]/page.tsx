"use client";

import { use, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { INITIAL_PRODUCTS } from "@/lib/data/mockData";
import { useCart } from "@/lib/context/CartContext";
import {
  Truck,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Plus,
  Minus,
  ShoppingCart,
  Calendar,
  Check,
} from "lucide-react";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const router = useRouter();
  const { slug } = use(params);
  const { addToCart } = useCart();

  const product = INITIAL_PRODUCTS.find(
    (p) => p.slug === slug || p.id === slug
  ) || INITIAL_PRODUCTS[0];

  const [selectedVariant, setSelectedVariant] = useState(product.variants[0]);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = () => {
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

  const handleBuyNow = () => {
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
    router.push("/checkout");
  };

  const relatedProducts = INITIAL_PRODUCTS.filter(
    (p) => p.id !== product.id && p.category === product.category
  ).slice(0, 3);

  const fallbackRelated =
    relatedProducts.length > 0
      ? relatedProducts
      : INITIAL_PRODUCTS.filter((p) => p.id !== product.id).slice(0, 3);

  const discountPercent =
    selectedVariant.originalPrice && selectedVariant.originalPrice > selectedVariant.price
      ? Math.round(
          ((selectedVariant.originalPrice - selectedVariant.price) /
            selectedVariant.originalPrice) *
            100
        )
      : null;

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#fffdf8] flex flex-col justify-between">
      <Header />

      <main className="w-full flex-1 px-4 py-8 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* BREADCRUMB */}
        <div className="mb-6 flex items-center gap-2 text-xs sm:text-sm text-gray-500">
          <Link href="/" className="hover:text-[#173b27]">
            Home
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-[#173b27]">
            Products
          </Link>
          <span>/</span>
          <span className="font-semibold text-[#173b27] truncate">
            {product.name}
          </span>
        </div>

        {/* MAIN PRODUCT GRID */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-14">
          {/* LEFT: LARGE PRODUCT IMAGE */}
          <div className="flex flex-col items-center">
            <div className="relative w-full aspect-square max-w-[500px] overflow-hidden rounded-[32px] bg-[#f8efd9] p-8 shadow-sm flex items-center justify-center">
              <Image
                src={product.image}
                alt={product.name}
                width={500}
                height={500}
                className="max-h-full max-w-full object-contain drop-shadow-xl"
                priority
              />
              {product.isFeatured && (
                <div className="absolute top-4 left-4 inline-flex items-center gap-1 rounded-full bg-[#126044] px-3 py-1.5 text-xs font-bold text-white shadow">
                  <Sparkles size={14} /> Farm Best-Seller
                </div>
              )}
            </div>

            {/* TRUST BADGES ROW */}
            <div className="mt-6 grid grid-cols-3 gap-3 w-full max-w-[500px]">
              <div className="rounded-2xl bg-white p-3 text-center border border-black/5">
                <Truck size={20} className="mx-auto text-[#126044]" />
                <p className="mt-1 text-[11px] font-bold text-[#173b27]">Morning 6-9 AM</p>
                <p className="text-[10px] text-gray-500">Daily Delivery</p>
              </div>
              <div className="rounded-2xl bg-white p-3 text-center border border-black/5">
                <ShieldCheck size={20} className="mx-auto text-[#126044]" />
                <p className="mt-1 text-[11px] font-bold text-[#173b27]">Lab Tested</p>
                <p className="text-[10px] text-gray-500">Zero Chemicals</p>
              </div>
              <div className="rounded-2xl bg-white p-3 text-center border border-black/5">
                <RotateCcw size={20} className="mx-auto text-[#126044]" />
                <p className="mt-1 text-[11px] font-bold text-[#173b27]">Glass Bottles</p>
                <p className="text-[10px] text-gray-500">Eco Hygiene</p>
              </div>
            </div>
          </div>

          {/* RIGHT: DETAILS & ACTIONS */}
          <div className="flex flex-col justify-between">
            <div>
              <span className="inline-block rounded-full bg-[#f8efd9] px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#b77932]">
                {product.category}
              </span>

              <h1 className="mt-2 text-3xl sm:text-4xl font-black text-[#173b27] tracking-tight">
                {product.name}
              </h1>

              <p className="mt-3 text-base text-[#52665d] leading-relaxed">
                {product.description}
              </p>

              {/* PRICE DISPLAY */}
              <div className="mt-6 flex items-baseline gap-3">
                <span className="text-4xl font-black text-[#173b27]">
                  ₹{selectedVariant.price}
                </span>
                {selectedVariant.originalPrice && selectedVariant.originalPrice > selectedVariant.price && (
                  <span className="text-lg text-gray-400 line-through">
                    ₹{selectedVariant.originalPrice}
                  </span>
                )}
                {discountPercent && (
                  <span className="rounded-full bg-[#c77828] px-3 py-1 text-xs font-bold text-white">
                    {discountPercent}% OFF
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">Inclusive of all local taxes</p>

              {/* VARIANTS SELECTOR */}
              <div className="mt-6">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-600 block mb-2">
                  Select Size / Quantity:
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {product.variants.map((v) => {
                    const isSelected = selectedVariant.id === v.id;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVariant(v)}
                        className={`rounded-2xl px-5 py-2.5 text-sm font-bold transition shadow-sm ${
                          isSelected
                            ? "bg-[#173b27] text-white ring-2 ring-[#173b27]/30"
                            : "bg-white text-gray-700 border border-black/10 hover:bg-[#f8efd9]"
                        }`}
                      >
                        {v.name} &bull; ₹{v.price}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* STOCK STATUS */}
              <div className="mt-4 flex items-center gap-2">
                {selectedVariant.stock > 0 ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
                    <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
                    Fresh Stock Available &bull; Guaranteed Today
                  </span>
                ) : (
                  <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700 border border-red-200">
                    Sold out for today&apos;s batch
                  </span>
                )}
              </div>

              {/* QUANTITY & ACTIONS */}
              <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* QUANTITY PICKER */}
                <div className="flex h-14 items-center justify-between rounded-full border border-black/10 bg-white px-4 shadow-sm w-full sm:w-36">
                  <button
                    onClick={() => setQuantity((q) => (q > 1 ? q - 1 : 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="text-base font-bold text-[#173b27]">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100"
                    aria-label="Increase quantity"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {/* ADD TO CART */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={selectedVariant.stock === 0}
                  className={`flex h-14 flex-1 items-center justify-center gap-2 rounded-full px-6 text-sm font-bold shadow-md transition-all ${
                    isAdded
                      ? "bg-emerald-700 text-white"
                      : "bg-[#126044] text-white hover:bg-[#0e5039]"
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check size={18} /> Added to Cart!
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={18} /> Add to Cart
                    </>
                  )}
                </button>

                {/* BUY NOW */}
                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={selectedVariant.stock === 0}
                  className="flex h-14 items-center justify-center rounded-full bg-[#c77828] px-8 text-sm font-bold text-white shadow-md transition hover:bg-[#a6621e]"
                >
                  Buy Now
                </button>
              </div>

              {/* SUBSCRIPTION CALLOUT */}
              <div className="mt-8 rounded-3xl border border-[#b77932]/30 bg-[#f8efd9]/70 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Calendar size={18} className="text-[#b77932]" />
                    <h4 className="text-sm font-black text-[#173b27]">
                      Need this delivered fresh every day?
                    </h4>
                  </div>
                  <p className="text-xs text-[#52665d] mt-1">
                    Subscribe daily or alternate days and save up to 15% with free early morning doorstep delivery.
                  </p>
                </div>
                <Link
                  href={`/subscriptions?product=${product.id}&variant=${selectedVariant.id}`}
                  className="shrink-0 rounded-full bg-[#173b27] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#126044]"
                >
                  Subscribe Plan
                </Link>
              </div>

              {/* SPECIFICATIONS & INGREDIENTS */}
              <div className="mt-8 space-y-3 border-t border-black/5 pt-6 text-xs text-[#52665d]">
                {product.ingredients && (
                  <p>
                    <strong className="text-[#173b27]">Ingredients:</strong> {product.ingredients}
                  </p>
                )}
                {product.shelfLife && (
                  <p>
                    <strong className="text-[#173b27]">Shelf Life:</strong> {product.shelfLife}
                  </p>
                )}
                {product.storageInstructions && (
                  <p>
                    <strong className="text-[#173b27]">Storage:</strong> {product.storageInstructions}
                  </p>
                )}
                {product.fatContent && (
                  <p>
                    <strong className="text-[#173b27]">Fat Content:</strong> {product.fatContent}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RELATED PRODUCTS */}
        <div className="mt-20 border-t border-black/10 pt-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#b77932]">Pairs Well With</p>
              <h2 className="text-2xl font-bold text-[#173b27]">Related Dairy Products</h2>
            </div>
            <Link href="/products" className="text-xs font-bold text-[#126044] hover:underline">
              View All &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {fallbackRelated.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
