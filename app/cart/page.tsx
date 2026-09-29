"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCart } from "@/lib/context/CartContext";
import { INITIAL_PRODUCTS } from "@/lib/data/mockData";
import {
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag,
  Sparkles,
  Tag,
  CheckCircle2,
  ShieldCheck,
  Truck,
} from "lucide-react";

export default function CartPage() {
  const {
    cart,
    updateQuantity,
    updateVariant,
    removeFromCart,
    subtotal,
    deliveryFee,
    discount,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    totalAmount,
    totalCount,
    isLoaded,
  } = useCart();

  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError("");
    setCouponSuccess("");
    if (!couponInput.trim()) return;

    const res = applyCoupon(couponInput);
    if (res.success) {
      setCouponSuccess(res.message);
      setCouponInput("");
    } else {
      setCouponError(res.message);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-[#fffdf8]">
        <Header />
        <div className="flex-1 flex items-center justify-center p-8">
          <p className="text-base text-gray-500 font-semibold animate-pulse">
            Loading your fresh dairy cart...
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  const freeDeliveryThreshold = 199;
  const amountToFreeDelivery = freeDeliveryThreshold - subtotal;

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#fffdf8] flex flex-col justify-between">
      <Header />

      <main className="w-full flex-1 px-4 py-8 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* HEADER BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-[#173b27]">
              Shopping Cart
            </h1>
            <p className="mt-1 text-sm text-[#52665d]">
              {totalCount} fresh {totalCount === 1 ? "item" : "items"} from Palletoori&apos;s Farm
            </p>
          </div>

          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#126044] hover:underline"
          >
            &larr; Continue Shopping
          </Link>
        </div>

        {cart.length === 0 ? (
          /* EMPTY CART VIEW */
          <div className="rounded-3xl border border-black/5 bg-white p-12 text-center shadow-sm max-w-2xl mx-auto my-12">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#f8efd9] text-4xl mb-4">
              🛒
            </div>
            <h2 className="text-2xl font-black text-[#173b27]">
              Your cart is empty
            </h2>
            <p className="mt-2 text-sm text-[#52665d] max-w-md mx-auto">
              You haven&apos;t added any farm fresh milk, ghee, or curd yet. Discover pure dairy harvested today.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/products"
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-[#126044] px-8 py-3.5 text-sm font-bold text-white shadow hover:bg-[#0e5039]"
              >
                Browse Fresh Products
              </Link>
              <Link
                href="/subscriptions"
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-full border border-[#173b27] px-8 py-3.5 text-sm font-bold text-[#173b27] hover:bg-[#f8efd9]"
              >
                Daily Milk Subscription
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* CART ITEMS LIST */}
            <div className="lg:col-span-2 space-y-4">
              {/* FREE DELIVERY PROGRESS */}
              <div className="rounded-2xl border border-black/5 bg-[#f8efd9] p-4 text-xs sm:text-sm">
                {amountToFreeDelivery > 0 ? (
                  <div className="flex items-center gap-2 text-[#173b27]">
                    <Truck size={18} className="text-[#b77932] shrink-0" />
                    <span>
                      Add <strong>₹{amountToFreeDelivery}</strong> more to get{" "}
                      <strong className="text-[#126044]">FREE Morning Delivery</strong>!
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-[#126044] font-bold">
                    <CheckCircle2 size={18} />
                    <span>You unlocked FREE Morning Doorstep Delivery! 🎉</span>
                  </div>
                )}
              </div>

              {cart.map((item) => {
                // Find all variants for this product to allow inline variant switching
                const productDef = INITIAL_PRODUCTS.find((p) => p.id === item.productId);
                const availableVariants = productDef ? productDef.variants : [];

                return (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-black/5 bg-white p-5 shadow-sm transition hover:shadow-md"
                  >
                    <div className="flex items-center gap-4">
                      {/* PRODUCT IMAGE */}
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-[#f8efd9] p-2 flex items-center justify-center">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-contain"
                        />
                      </div>

                      {/* INFO */}
                      <div className="min-w-0">
                        <h3 className="text-base font-bold text-[#173b27] truncate">
                          {item.name}
                        </h3>

                        {/* VARIANT SELECTOR INSIDE CART */}
                        {availableVariants.length > 1 ? (
                          <div className="mt-1 flex items-center gap-1.5">
                            <span className="text-[11px] text-gray-500">Size:</span>
                            <select
                              value={item.variantId}
                              onChange={(e) => {
                                const newV = availableVariants.find(
                                  (v) => v.id === e.target.value
                                );
                                if (newV) {
                                  updateVariant(
                                    item.id,
                                    newV.id,
                                    newV.name,
                                    newV.price,
                                    newV.unit
                                  );
                                }
                              }}
                              className="rounded-lg border border-black/10 bg-[#fffdf8] px-2 py-0.5 text-xs font-semibold text-[#173b27] outline-none"
                            >
                              {availableVariants.map((v) => (
                                <option key={v.id} value={v.id}>
                                  {v.name} (₹{v.price})
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <p className="text-xs text-gray-500">{item.variantName}</p>
                        )}

                        <p className="mt-1 text-sm font-bold text-[#c77828]">
                          ₹{item.price} each
                        </p>
                      </div>
                    </div>

                    {/* QUANTITY STEPPER & ITEM TOTAL */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-black/5">
                      {/* STEPPER */}
                      <div className="flex h-10 items-center rounded-full border border-black/10 bg-[#fffdf8] px-2 shadow-sm">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center text-sm font-bold text-[#173b27]">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100"
                          aria-label="Increase quantity"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      {/* TOTAL & DELETE */}
                      <div className="text-right min-w-[70px]">
                        <p className="text-lg font-black text-[#173b27]">
                          ₹{item.price * item.quantity}
                        </p>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={12} /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="flex justify-between items-center pt-2">
                <Link
                  href="/products"
                  className="text-xs font-bold text-[#126044] hover:underline"
                >
                  + Add more dairy products
                </Link>
              </div>
            </div>

            {/* ORDER SUMMARY SIDEBAR */}
            <div className="space-y-4">
              <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-black text-[#173b27] mb-4">
                  Order Summary
                </h2>

                <div className="space-y-3 text-sm text-[#52665d] border-b border-black/5 pb-4">
                  <div className="flex justify-between">
                    <span>Subtotal ({totalCount} items)</span>
                    <span className="font-bold text-[#173b27]">₹{subtotal}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Morning Delivery Fee</span>
                    <span>
                      {deliveryFee === 0 ? (
                        <span className="font-bold text-[#126044]">FREE</span>
                      ) : (
                        <span className="font-bold text-[#173b27]">₹{deliveryFee}</span>
                      )}
                    </span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-[#126044] font-bold">
                      <span>Coupon Discount ({appliedCoupon})</span>
                      <span>-₹{discount}</span>
                    </div>
                  )}
                </div>

                {/* COUPON SECTION */}
                <div className="py-4 border-b border-black/5">
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between rounded-2xl bg-emerald-50 p-2.5 text-xs text-emerald-800 border border-emerald-200">
                      <div className="flex items-center gap-1.5 font-bold">
                        <Tag size={14} /> Coupon applied: {appliedCoupon}
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="text-xs font-bold text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                          placeholder="Coupon (e.g. PALLETOORI50)"
                          className="flex-1 rounded-xl border border-black/10 bg-[#fffdf8] px-3 py-2 text-xs uppercase outline-none focus:border-[#126044]"
                        />
                        <button
                          type="submit"
                          className="rounded-xl bg-[#173b27] px-4 py-2 text-xs font-bold text-white hover:bg-[#126044]"
                        >
                          Apply
                        </button>
                      </div>
                      {couponError && (
                        <p className="text-[11px] text-red-600">{couponError}</p>
                      )}
                      {couponSuccess && (
                        <p className="text-[11px] text-emerald-600">{couponSuccess}</p>
                      )}
                      <p className="text-[10px] text-gray-400">
                        Use code <strong className="text-gray-600">PALLETOORI50</strong> for ₹50 off on orders ₹200+
                      </p>
                    </form>
                  )}
                </div>

                {/* TOTAL */}
                <div className="flex items-baseline justify-between pt-4">
                  <div>
                    <span className="text-base font-bold text-[#173b27]">Total Payable</span>
                    <span className="block text-[11px] text-gray-400">All taxes included</span>
                  </div>
                  <span className="text-3xl font-black text-[#c77828]">
                    ₹{totalAmount}
                  </span>
                </div>

                {/* PROCEED TO CHECKOUT BUTTON */}
                <Link
                  href="/checkout"
                  className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#126044] px-6 text-base font-bold text-white shadow-lg transition hover:bg-[#0e5039]"
                >
                  Proceed to Checkout <ArrowRight size={18} />
                </Link>

                <p className="mt-3 text-center text-[11px] text-gray-500">
                  🔒 100% Safe &amp; Secure Payments via Razorpay
                </p>
              </div>

              {/* GUARANTEE BADGE */}
              <div className="rounded-2xl bg-[#f8efd9] p-4 text-xs text-[#52665d] space-y-1">
                <p className="font-bold text-[#173b27] flex items-center gap-1.5">
                  <ShieldCheck size={16} className="text-[#126044]" /> Farm Quality Guarantee
                </p>
                <p>If you are ever unsatisfied with the freshness or taste of our milk, we replace it or refund with zero questions asked.</p>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}