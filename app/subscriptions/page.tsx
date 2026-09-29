"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { DairyStore } from "@/lib/db/store";
import { useAuth } from "@/lib/context/AuthContext";
import { INITIAL_PRODUCTS, INITIAL_DELIVERY_SLOTS } from "@/lib/data/mockData";
import { Subscription, SubscriptionFrequency, Product, ProductVariant } from "@/types/dairy";
import {
  Calendar,
  Clock,
  Plus,
  Minus,
  Pause,
  Play,
  RotateCcw,
  Trash2,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Truck,
} from "lucide-react";

export default function SubscriptionsPage() {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [showBuilder, setShowBuilder] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");

  // Builder State
  const [selectedProduct, setSelectedProduct] = useState<Product>(INITIAL_PRODUCTS[0]);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(INITIAL_PRODUCTS[0].variants[0]);
  const [quantity, setQuantity] = useState(1);
  const [frequency, setFrequency] = useState<SubscriptionFrequency>("daily");
  const [customDays, setCustomDays] = useState<string[]>(["Mon", "Wed", "Fri"]);
  const [selectedSlot, setSelectedSlot] = useState("Morning (6:00 AM – 9:00 AM)");
  const [paymentMode, setPaymentMode] = useState("UPI AutoPay");

  const loadSubscriptions = () => {
    const list = DairyStore.getSubscriptions();
    setSubscriptions(list);
  };

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const handleProductChange = (prodId: string) => {
    const p = INITIAL_PRODUCTS.find((item) => item.id === prodId);
    if (p) {
      setSelectedProduct(p);
      setSelectedVariant(p.variants[0]);
    }
  };

  const handleToggleStatus = (sub: Subscription) => {
    const newStatus = sub.status === "active" ? "paused" : "active";
    DairyStore.updateSubscriptionStatus(sub.id, newStatus);
    loadSubscriptions();
    setFeedbackMsg(
      newStatus === "active"
        ? `Subscription for ${sub.productName} has been resumed.`
        : `Subscription for ${sub.productName} has been paused.`
    );
    setTimeout(() => setFeedbackMsg(""), 3500);
  };

  const handleSkipNext = (sub: Subscription) => {
    setFeedbackMsg(`Next scheduled delivery for ${sub.productName} skipped.`);
    setTimeout(() => setFeedbackMsg(""), 3500);
  };

  const handleUpdateQuantity = (sub: Subscription, delta: number) => {
    const newQty = sub.quantity + delta;
    if (newQty <= 0) return;
    DairyStore.updateSubscriptionQuantity(sub.id, newQty);
    loadSubscriptions();
  };

  const handleCancelSub = (subId: string) => {
    if (confirm("Are you sure you want to cancel this daily subscription?")) {
      DairyStore.updateSubscriptionStatus(subId, "cancelled");
      loadSubscriptions();
      setFeedbackMsg("Subscription cancelled.");
      setTimeout(() => setFeedbackMsg(""), 3500);
    }
  };

  const handleCreateSubscription = (e: React.FormEvent) => {
    e.preventDefault();

    const activeUser = user || DairyStore.getUser();
    const activeAddress = activeUser.addresses[0];

    const daysLabel =
      frequency === "daily"
        ? ["Daily (Mon - Sun)"]
        : frequency === "alternate"
        ? ["Alternate Days"]
        : customDays;

    const newSub: Subscription = {
      id: `sub-${Date.now()}`,
      subscriptionNumber: `SUB-PAL-${Math.floor(100 + Math.random() * 900)}`,
      userId: activeUser.id,
      customerName: activeUser.fullName,
      customerPhone: activeUser.phone,
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      variantId: selectedVariant.id,
      variantName: selectedVariant.name,
      price: selectedVariant.price,
      quantity,
      frequency,
      deliveryDays: daysLabel,
      deliverySlot: selectedSlot,
      address: activeAddress,
      status: "active",
      startDate: new Date().toISOString().split("T")[0],
      nextDeliveryDate: "Tomorrow Morning",
      paymentMethod: paymentMode,
      createdAt: new Date().toISOString(),
    };

    DairyStore.createSubscription(newSub);
    loadSubscriptions();
    setShowBuilder(false);
    setFeedbackMsg(`Successfully subscribed to ${selectedProduct.name}! First delivery tomorrow morning.`);
    setTimeout(() => setFeedbackMsg(""), 4500);
  };

  const activeCount = subscriptions.filter((s) => s.status === "active").length;

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#fffdf8] flex flex-col justify-between">
      <Header />

      <main className="w-full flex-1 px-4 py-8 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        {/* HERO BANNER */}
        <div className="rounded-[32px] bg-[#173b27] p-6 sm:p-10 text-white relative overflow-hidden mb-8">
          <div className="max-w-2xl relative z-10">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-[#e5b36d] shadow-sm mb-3">
              <Sparkles size={14} /> Never Run Out of Milk
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
              Daily Milk Subscriptions
            </h1>
            <p className="mt-3 text-sm sm:text-base text-white/80 leading-relaxed">
              Harvested fresh at 4:30 AM and delivered to your doorstep before 9:00 AM every single morning. Pause, modify quantity, or skip anytime with 1 click.
            </p>

            <button
              onClick={() => setShowBuilder(!showBuilder)}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-bold text-[#173b27] shadow hover:bg-[#f8efd9]"
            >
              {showBuilder ? "Hide Subscription Form" : "+ Start New Subscription"}
            </button>
          </div>
        </div>

        {feedbackMsg && (
          <div className="mb-6 rounded-2xl bg-emerald-50 p-4 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center gap-2">
            <CheckCircle2 size={18} /> {feedbackMsg}
          </div>
        )}

        {/* SUBSCRIPTION BUILDER FORM */}
        {showBuilder && (
          <form
            onSubmit={handleCreateSubscription}
            className="rounded-3xl border border-black/10 bg-white p-6 sm:p-8 shadow-md mb-10 space-y-6"
          >
            <div className="border-b border-black/5 pb-4">
              <h2 className="text-xl font-black text-[#173b27]">
                Configure Your Daily Milk Plan
              </h2>
              <p className="text-xs text-gray-500">
                Choose pure cow milk, buffalo milk, or traditional curd delivered straight to your door.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* PRODUCT SELECTOR */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-2">
                  1. Select Dairy Product
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {INITIAL_PRODUCTS.slice(0, 4).map((p) => {
                    const isSelected = selectedProduct.id === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleProductChange(p.id)}
                        className={`flex items-center gap-2 rounded-2xl border p-3 text-left transition ${
                          isSelected
                            ? "border-[#126044] bg-[#f8efd9] shadow-sm"
                            : "border-black/10 bg-[#fffdf8] hover:bg-gray-50"
                        }`}
                      >
                        <img
                          src={p.image}
                          alt={p.name}
                          className="h-10 w-10 rounded-lg object-contain bg-white p-1"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#173b27] truncate">
                            {p.name}
                          </p>
                          <p className="text-[10px] text-gray-500">
                            From ₹{p.variants[0]?.price}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* VARIANT & QUANTITY */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-2">
                  2. Select Size &amp; Quantity
                </label>
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedProduct.variants.map((v) => {
                    const isSelected = selectedVariant.id === v.id;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVariant(v)}
                        className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                          isSelected
                            ? "bg-[#173b27] text-white"
                            : "bg-[#fffdf8] border border-black/10 text-gray-700"
                        }`}
                      >
                        {v.name} &bull; ₹{v.price}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-600">Daily Quantity:</span>
                  <div className="flex items-center rounded-full border border-black/10 bg-[#fffdf8] px-2 py-1 shadow-sm">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => (q > 1 ? q - 1 : 1))}
                      className="h-6 w-6 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-8 text-center text-sm font-bold text-[#173b27]">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => q + 1)}
                      className="h-6 w-6 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                  <span className="text-xs text-gray-500">
                    Total: <strong>₹{selectedVariant.price * quantity} / delivery</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* FREQUENCY */}
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-2">
                3. Choose Delivery Frequency
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: "daily", title: "Daily", sub: "Delivered 7 days a week" },
                  { id: "alternate", title: "Alternate Days", sub: "Every 48 hours" },
                  { id: "weekly", title: "Custom Days", sub: "Mon / Wed / Fri" },
                ].map((f) => (
                  <label
                    key={f.id}
                    className={`rounded-2xl border p-3.5 cursor-pointer transition ${
                      frequency === f.id
                        ? "border-[#126044] bg-[#f8efd9] shadow-sm"
                        : "border-black/10 bg-[#fffdf8]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-[#173b27]">{f.title}</span>
                      <input
                        type="radio"
                        name="frequency"
                        checked={frequency === f.id}
                        onChange={() => setFrequency(f.id as SubscriptionFrequency)}
                        className="accent-[#126044]"
                      />
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1">{f.sub}</p>
                  </label>
                ))}
              </div>
            </div>

            {/* DELIVERY SLOT & PAYMENT */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  4. Morning Delivery Slot
                </label>
                <div className="rounded-2xl border border-black/10 bg-[#fffdf8] p-3 text-xs text-[#173b27] flex items-center gap-2 font-semibold">
                  <Clock size={16} className="text-[#126044]" />
                  <span>Morning Slot: 6:00 AM – 9:00 AM (Recommended)</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  5. Payment Preference
                </label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className="w-full rounded-2xl border border-black/10 bg-[#fffdf8] p-3 text-xs font-semibold outline-none"
                >
                  <option value="UPI AutoPay">UPI AutoPay (Automated Monthly)</option>
                  <option value="Weekly Razorpay Link">Weekly Payment Link (WhatsApp)</option>
                  <option value="Cash on Delivery">Cash Collection (Monthly)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-black/5">
              <button
                type="button"
                onClick={() => setShowBuilder(false)}
                className="rounded-full px-6 py-2.5 text-xs font-bold text-gray-500 hover:text-black"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-full bg-[#126044] px-8 py-3 text-sm font-bold text-white shadow hover:bg-[#0e5039]"
              >
                Confirm &amp; Start Daily Delivery
              </button>
            </div>
          </form>
        )}

        {/* ACTIVE SUBSCRIPTIONS LIST */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black text-[#173b27]">
              Your Subscriptions ({activeCount} Active)
            </h2>
          </div>

          {subscriptions.length === 0 ? (
            <div className="rounded-3xl border border-black/5 bg-white p-10 text-center shadow-sm">
              <Calendar size={40} className="mx-auto text-gray-300 mb-2" />
              <p className="text-sm font-bold text-[#173b27]">No active subscriptions</p>
              <p className="text-xs text-gray-500 mt-1">
                Start a fresh milk subscription to receive daily morning doorstep delivery.
              </p>
              <button
                onClick={() => setShowBuilder(true)}
                className="mt-4 rounded-full bg-[#126044] px-6 py-2.5 text-xs font-bold text-white"
              >
                Configure Milk Plan
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {subscriptions.map((sub) => {
                const isPaused = sub.status === "paused";
                const isCancelled = sub.status === "cancelled";

                return (
                  <div
                    key={sub.id}
                    className={`rounded-3xl border p-6 transition shadow-sm ${
                      isCancelled
                        ? "border-gray-200 bg-gray-50 opacity-60"
                        : isPaused
                        ? "border-amber-200 bg-amber-50/40"
                        : "border-black/5 bg-white hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-center justify-between border-b border-black/5 pb-4 mb-4">
                      <div>
                        <span className="text-xs font-bold text-gray-400">
                          #{sub.subscriptionNumber}
                        </span>
                        <h3 className="text-lg font-black text-[#173b27]">
                          {sub.productName}
                        </h3>
                        <p className="text-xs text-[#b77932] font-semibold">
                          {sub.variantName} &bull; {sub.quantity} units per delivery
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
                          isCancelled
                            ? "bg-red-100 text-red-700"
                            : isPaused
                            ? "bg-amber-100 text-amber-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {sub.status}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs text-[#52665d] mb-6">
                      <div className="flex items-center justify-between">
                        <span>Frequency:</span>
                        <strong className="text-[#173b27] capitalize">
                          {sub.frequency} ({sub.deliveryDays.join(", ")})
                        </strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Delivery Slot:</span>
                        <strong className="text-[#173b27]">{sub.deliverySlot}</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Next Delivery:</span>
                        <strong className="text-[#126044]">
                          {isPaused ? "Paused" : isCancelled ? "Ended" : sub.nextDeliveryDate}
                        </strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Cost per drop:</span>
                        <strong className="text-base text-[#c77828]">
                          ₹{sub.price * sub.quantity}
                        </strong>
                      </div>
                    </div>

                    {/* ACTION CONTROLS */}
                    {!isCancelled && (
                      <div className="border-t border-black/5 pt-4 flex flex-wrap items-center justify-between gap-2">
                        {/* QUANTITY CHANGER */}
                        <div className="flex items-center rounded-full border border-black/10 bg-[#fffdf8] px-2 py-0.5">
                          <button
                            onClick={() => handleUpdateQuantity(sub, -1)}
                            disabled={sub.quantity <= 1}
                            className="h-6 w-6 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200"
                            title="Decrease bottles"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-6 text-center text-xs font-bold text-[#173b27]">
                            {sub.quantity}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(sub, 1)}
                            className="h-6 w-6 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200"
                            title="Increase bottles"
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleSkipNext(sub)}
                            disabled={isPaused}
                            className="rounded-full border border-black/10 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 disabled:opacity-40"
                          >
                            Skip Tomorrow
                          </button>

                          <button
                            onClick={() => handleToggleStatus(sub)}
                            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold ${
                              isPaused
                                ? "bg-[#126044] text-white"
                                : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                            }`}
                          >
                            {isPaused ? (
                              <>
                                <Play size={12} /> Resume
                              </>
                            ) : (
                              <>
                                <Pause size={12} /> Pause
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => handleCancelSub(sub.id)}
                            className="text-gray-400 hover:text-red-600 p-1"
                            title="Cancel subscription"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
