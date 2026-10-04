"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCart } from "@/lib/context/CartContext";
import { useAuth } from "@/lib/context/AuthContext";
import { DairyStore } from "@/lib/db/store";
import { Address, DeliverySlot, Order, PaymentMethod } from "@/types/dairy";
import {
  Check,
  MapPin,
  Clock,
  CreditCard,
  ShieldCheck,
  AlertCircle,
  Plus,
} from "lucide-react";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay?: any;
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, subtotal, deliveryFee, discount, appliedCoupon, totalAmount, clearCart, isLoaded } = useCart();
  const { user } = useAuth();

  const [step, setStep] = useState<number>(1);
  const [deliverySlots] = useState<DeliverySlot[]>(() =>
    typeof window !== "undefined" ? DairyStore.getDeliverySlots() : []
  );

  // Step 1: Customer Info — lazily initialized from user or DairyStore defaults
  const [fullName, setFullName] = useState(() => {
    if (user) return user.fullName || "";
    if (typeof window !== "undefined") return DairyStore.getUser().fullName;
    return "";
  });
  const [phone, setPhone] = useState(() => {
    if (user) return user.phone || "";
    if (typeof window !== "undefined") return DairyStore.getUser().phone;
    return "";
  });
  const [email, setEmail] = useState(() => {
    if (user) return user.email || "";
    if (typeof window !== "undefined") return DairyStore.getUser().email || "";
    return "";
  });

  // Step 2: Address — lazily initialized
  const [savedAddresses] = useState<Address[]>(() => {
    if (user) return user.addresses || [];
    if (typeof window !== "undefined") return DairyStore.getUser().addresses;
    return [];
  });
  const [selectedAddressId, setSelectedAddressId] = useState<string>(() => {
    const addresses = user?.addresses ?? (typeof window !== "undefined" ? DairyStore.getUser().addresses : []);
    return addresses.length > 0 ? addresses[0].id : "";
  });
  const [isAddingNewAddress, setIsAddingNewAddress] = useState<boolean>(() => {
    const addresses = user?.addresses ?? (typeof window !== "undefined" ? DairyStore.getUser().addresses : []);
    return addresses.length === 0;
  });
  const [newAddress, setNewAddress] = useState<Omit<Address, "id">>({
    fullName: "",
    phone: "",
    houseFlat: "",
    street: "",
    area: "",
    city: "Hyderabad",
    state: "Telangana",
    pincode: "",
    landmark: "",
    instructions: "",
  });

  // Step 3: Slot
  const [selectedSlot, setSelectedSlot] = useState<string>("Morning (6:00 AM \u2013 9:00 AM)");
  const [deliveryDate, setDeliveryDate] = useState<string>("Tomorrow Morning");

  // Step 5: Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("online");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");


  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#fffdf8] flex items-center justify-center">
        <p className="text-gray-500 font-bold animate-pulse">Loading checkout...</p>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#fffdf8] flex flex-col justify-between">
        <Header />
        <div className="max-w-md mx-auto text-center py-20 px-4">
          <p className="text-5xl mb-4">🛒</p>
          <h2 className="text-2xl font-black text-[#173b27]">Your cart is empty</h2>
          <p className="text-sm text-gray-500 mt-2">
            Please add some dairy products to your cart before proceeding to checkout.
          </p>
          <Link
            href="/products"
            className="mt-6 inline-block rounded-full bg-[#126044] px-8 py-3 text-sm font-bold text-white shadow"
          >
            Explore Products
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Get active address object
  const activeAddress: Address = isAddingNewAddress
    ? {
        ...newAddress,
        id: "new-address-entry",
        fullName: newAddress.fullName || fullName,
        phone: newAddress.phone || phone,
      }
    : savedAddresses.find((a) => a.id === selectedAddressId) || savedAddresses[0] || {
        id: "addr-fallback",
        fullName,
        phone,
        houseFlat: "Plot 42",
        street: "Road 12",
        area: "Banjara Hills",
        city: "Hyderabad",
        state: "Telangana",
        pincode: "500034",
      };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    setErrorMessage("");

    try {
      // Generate unique order identifiers inside the async handler (not during render)
      const generateOrderNumber = () => `PDF-${Math.floor(10000 + Math.random() * 90000)}`;
      const generateOrderId = () => `ord-${Date.now()}`;
      const orderNumber = generateOrderNumber();
      const orderId = generateOrderId();

      // 1. If Online Payment via Razorpay
      if (paymentMethod === "online") {
        // Call order creation API with validated items
        const createRes = await fetch("/api/razorpay/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: totalAmount,
            receipt: orderNumber,
            items: cart.map((i) => ({
              productId: i.productId,
              variantId: i.variantId,
              quantity: i.quantity,
              price: i.price,
            })),
            couponCode: appliedCoupon || undefined,
            notes: {
              customer_name: fullName,
              phone: phone,
              slot: selectedSlot,
            },
          }),
        });

        const orderData = await createRes.json();

        if (!orderData.success) {
          throw new Error(orderData.error || "Unable to initiate payment");
        }

        // Check if Razorpay SDK script is loaded
        if (typeof window !== "undefined" && window.Razorpay) {
          const options = {
            key: orderData.key,
            amount: orderData.amount,
            currency: orderData.currency,
            name: "Palletoori's Dairy Farm",
            description: `Payment for fresh dairy order ${orderNumber}`,
            image: "/logo.png",
            order_id: orderData.orderId,
            handler: async function (response: {
              razorpay_order_id: string;
              razorpay_payment_id: string;
              razorpay_signature: string;
            }) {
              // Server-side signature verification
              const verifyRes = await fetch("/api/razorpay/verify-payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  ...response,
                  orderId,
                  userId: user?.id,
                }),
              });

              const verifyData = await verifyRes.json();
              if (verifyData.success) {
                completeOrderCreation(orderId, orderNumber, "paid", response.razorpay_payment_id);
              } else {
                setErrorMessage(verifyData.error || "Payment verification failed. Please contact support.");
                setIsProcessing(false);
              }
            },
            prefill: {
              name: fullName,
              email: email,
              contact: phone,
            },
            theme: {
              color: "#173b27",
            },
          };

          const rzp = new window.Razorpay(options);
          rzp.on("payment.failed", function (resp: { error: { description: string } }) {
            setErrorMessage(`Payment failed: ${resp.error.description}`);
            setIsProcessing(false);
          });
          rzp.open();
        } else {
          setErrorMessage("Razorpay payment checkout is unavailable. Please check your connection or choose Cash on Delivery.");
          setIsProcessing(false);
        }
      } else {
        // Cash on Delivery (COD)
        setTimeout(() => {
          completeOrderCreation(orderId, orderNumber, "pending");
        }, 800);
      }
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMessage(error.message || "An unexpected error occurred during checkout.");
      setIsProcessing(false);
    }
  };

  const completeOrderCreation = (
    orderId: string,
    orderNumber: string,
    paymentStatus: "paid" | "pending",
    paymentId?: string
  ) => {
    const newOrder: Order = {
      id: orderId,
      orderNumber,
      userId: user?.id || "guest",
      customerName: fullName,
      customerPhone: phone,
      customerEmail: email,
      address: activeAddress,
      deliverySlot: selectedSlot,
      deliveryDate: deliveryDate,
      items: cart.map((i) => ({
        productId: i.productId,
        variantId: i.variantId,
        name: i.name,
        variantName: i.variantName,
        price: i.price,
        quantity: i.quantity,
        total: i.price * i.quantity,
        image: i.image,
      })),
      subtotal,
      deliveryFee,
      discount,
      couponCode: appliedCoupon || undefined,
      totalAmount,
      paymentMethod,
      paymentStatus,
      orderStatus: "confirmed",
      razorpayPaymentId: paymentId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    DairyStore.createOrder(newOrder);
    clearCart();
    setIsProcessing(false);
    router.push(`/orders/${orderId}`);
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#fffdf8] flex flex-col justify-between">
      {/* Razorpay Checkout Script */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <Header />

      <main className="w-full flex-1 px-4 py-8 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* CHECKOUT PROGRESS TABS */}
        <div className="mb-8 overflow-x-auto pb-2 scrollbar-none">
          <div className="flex items-center justify-between min-w-[500px] max-w-3xl mx-auto">
            {[
              { num: 1, label: "Customer Info" },
              { num: 2, label: "Delivery Address" },
              { num: 3, label: "Delivery Slot" },
              { num: 4, label: "Review & Pay" },
            ].map((s) => {
              const isPassed = step > s.num;
              const isCurrent = step === s.num;
              return (
                <div key={s.num} className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (isPassed) setStep(s.num);
                    }}
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition ${
                      isPassed
                        ? "bg-[#126044] text-white"
                        : isCurrent
                        ? "border-2 border-[#126044] bg-[#f8efd9] text-[#173b27]"
                        : "border border-gray-300 text-gray-400 bg-white"
                    }`}
                  >
                    {isPassed ? <Check size={14} /> : s.num}
                  </button>
                  <span
                    className={`text-xs font-bold whitespace-nowrap ${
                      isCurrent || isPassed ? "text-[#173b27]" : "text-gray-400"
                    }`}
                  >
                    {s.label}
                  </span>
                  {s.num < 4 && (
                    <div className="w-8 sm:w-16 h-0.5 bg-gray-200 mx-2" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {errorMessage && (
          <div className="mb-6 rounded-2xl bg-red-50 p-4 border border-red-200 flex items-center gap-3 text-red-700 text-sm max-w-3xl mx-auto">
            <AlertCircle size={20} className="shrink-0" />
            <p>{errorMessage}</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* LEFT 2 COLUMNS: CHECKOUT STEP CONTENT */}
          <div className="lg:col-span-2 space-y-6">
            {/* STEP 1: CUSTOMER INFORMATION */}
            <div className="rounded-3xl border border-black/5 bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#173b27] text-xs font-bold text-white">
                    1
                  </span>
                  <h2 className="text-xl font-black text-[#173b27]">
                    Customer Information
                  </h2>
                </div>
                {step > 1 && (
                  <button
                    onClick={() => setStep(1)}
                    className="text-xs font-bold text-[#126044] hover:underline"
                  >
                    Edit
                  </button>
                )}
              </div>

              {step === 1 ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Suresh Reddy"
                      className="w-full rounded-2xl border border-black/10 bg-[#fffdf8] p-3 text-sm outline-none focus:border-[#126044]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">
                        Mobile Number * (For Delivery Updates)
                      </label>
                      <div className="flex items-center rounded-2xl border border-black/10 bg-[#fffdf8] px-3">
                        <span className="text-xs font-bold text-gray-500 mr-2">+91</span>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="9876543210"
                          className="w-full bg-transparent py-3 text-sm outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">
                        Email Address (Optional)
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="suresh@example.com"
                        className="w-full rounded-2xl border border-black/10 bg-[#fffdf8] p-3 text-sm outline-none focus:border-[#126044]"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (!fullName || !phone) {
                        setErrorMessage("Please enter your name and 10-digit mobile number.");
                        return;
                      }
                      setErrorMessage("");
                      setStep(2);
                    }}
                    className="mt-2 rounded-full bg-[#126044] px-8 py-3 text-sm font-bold text-white shadow hover:bg-[#0e5039]"
                  >
                    Continue to Delivery Address
                  </button>
                </div>
              ) : (
                <div className="text-sm text-[#52665d]">
                  <p className="font-bold text-[#173b27]">{fullName}</p>
                  <p>+91 {phone} {email && `• ${email}`}</p>
                </div>
              )}
            </div>

            {/* STEP 2: DELIVERY ADDRESS */}
            <div className="rounded-3xl border border-black/5 bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#173b27] text-xs font-bold text-white">
                    2
                  </span>
                  <h2 className="text-xl font-black text-[#173b27]">
                    Delivery Address
                  </h2>
                </div>
                {step > 2 && (
                  <button
                    onClick={() => setStep(2)}
                    className="text-xs font-bold text-[#126044] hover:underline"
                  >
                    Edit
                  </button>
                )}
              </div>

              {step === 2 ? (
                <div className="space-y-4">
                  {/* Saved Addresses List */}
                  {savedAddresses.length > 0 && !isAddingNewAddress && (
                    <div className="space-y-3">
                      <p className="text-xs font-bold text-gray-500">Choose a saved address:</p>
                      {savedAddresses.map((addr) => (
                        <label
                          key={addr.id}
                          className={`flex items-start gap-3 rounded-2xl border p-4 cursor-pointer transition ${
                            selectedAddressId === addr.id
                              ? "border-[#126044] bg-[#f8efd9]/50 shadow-sm"
                              : "border-black/10 bg-[#fffdf8] hover:bg-gray-50"
                          }`}
                        >
                          <input
                            type="radio"
                            name="delivery_address"
                            checked={selectedAddressId === addr.id}
                            onChange={() => setSelectedAddressId(addr.id)}
                            className="mt-1 accent-[#126044]"
                          />
                          <div className="text-xs leading-relaxed text-[#52665d]">
                            <p className="font-bold text-[#173b27] text-sm">{addr.fullName} &bull; {addr.phone}</p>
                            <p>{addr.houseFlat}, {addr.street}</p>
                            <p>{addr.area}, {addr.city} - {addr.pincode}</p>
                            {addr.landmark && <p className="text-gray-400">Landmark: {addr.landmark}</p>}
                          </div>
                        </label>
                      ))}

                      <button
                        type="button"
                        onClick={() => setIsAddingNewAddress(true)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#126044] hover:underline"
                      >
                        <Plus size={14} /> Add New Address
                      </button>
                    </div>
                  )}

                  {/* Add New Address Form */}
                  {(isAddingNewAddress || savedAddresses.length === 0) && (
                    <div className="space-y-4 border-t border-black/5 pt-4">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-[#173b27]">Enter New Address details:</p>
                        {savedAddresses.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setIsAddingNewAddress(false)}
                            className="text-xs font-bold text-gray-500 hover:text-black"
                          >
                            Cancel
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-semibold text-gray-700 block mb-1">
                            Flat / House No. / Building *
                          </label>
                          <input
                            type="text"
                            required
                            value={newAddress.houseFlat}
                            onChange={(e) =>
                              setNewAddress({ ...newAddress, houseFlat: e.target.value })
                            }
                            placeholder="e.g. Flat 301, Lakeview Appt"
                            className="w-full rounded-xl border border-black/10 bg-[#fffdf8] p-2.5 text-xs outline-none focus:border-[#126044]"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-700 block mb-1">
                            Street / Colony *
                          </label>
                          <input
                            type="text"
                            required
                            value={newAddress.street}
                            onChange={(e) =>
                              setNewAddress({ ...newAddress, street: e.target.value })
                            }
                            placeholder="e.g. Road No. 12"
                            className="w-full rounded-xl border border-black/10 bg-[#fffdf8] p-2.5 text-xs outline-none focus:border-[#126044]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-xs font-semibold text-gray-700 block mb-1">
                            Area / Locality *
                          </label>
                          <input
                            type="text"
                            required
                            value={newAddress.area}
                            onChange={(e) =>
                              setNewAddress({ ...newAddress, area: e.target.value })
                            }
                            placeholder="e.g. Banjara Hills"
                            className="w-full rounded-xl border border-black/10 bg-[#fffdf8] p-2.5 text-xs outline-none focus:border-[#126044]"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-700 block mb-1">
                            City
                          </label>
                          <input
                            type="text"
                            value={newAddress.city}
                            onChange={(e) =>
                              setNewAddress({ ...newAddress, city: e.target.value })
                            }
                            className="w-full rounded-xl border border-black/10 bg-[#fffdf8] p-2.5 text-xs outline-none focus:border-[#126044]"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-700 block mb-1">
                            Pincode *
                          </label>
                          <input
                            type="text"
                            required
                            value={newAddress.pincode}
                            onChange={(e) =>
                              setNewAddress({ ...newAddress, pincode: e.target.value })
                            }
                            placeholder="500034"
                            className="w-full rounded-xl border border-black/10 bg-[#fffdf8] p-2.5 text-xs outline-none focus:border-[#126044]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-gray-700 block mb-1">
                          Delivery Instructions for Rider (Optional)
                        </label>
                        <input
                          type="text"
                          value={newAddress.instructions}
                          onChange={(e) =>
                            setNewAddress({ ...newAddress, instructions: e.target.value })
                          }
                          placeholder="e.g. Ring the bell, place bag on doorstep hook"
                          className="w-full rounded-xl border border-black/10 bg-[#fffdf8] p-2.5 text-xs outline-none focus:border-[#126044]"
                        />
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      if (isAddingNewAddress) {
                        if (!newAddress.houseFlat || !newAddress.street || !newAddress.area || !newAddress.pincode) {
                          setErrorMessage("Please complete all required address fields.");
                          return;
                        }
                      }
                      setErrorMessage("");
                      setStep(3);
                    }}
                    className="mt-2 rounded-full bg-[#126044] px-8 py-3 text-sm font-bold text-white shadow hover:bg-[#0e5039]"
                  >
                    Continue to Delivery Slot
                  </button>
                </div>
              ) : (
                <div className="text-sm text-[#52665d]">
                  <p className="font-bold text-[#173b27] flex items-center gap-1.5">
                    <MapPin size={16} className="text-[#126044]" />
                    {activeAddress.houseFlat}, {activeAddress.street}, {activeAddress.area}, {activeAddress.city} - {activeAddress.pincode}
                  </p>
                </div>
              )}
            </div>

            {/* STEP 3: DELIVERY SLOT */}
            <div className="rounded-3xl border border-black/5 bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#173b27] text-xs font-bold text-white">
                    3
                  </span>
                  <h2 className="text-xl font-black text-[#173b27]">
                    Choose Delivery Slot
                  </h2>
                </div>
                {step > 3 && (
                  <button
                    onClick={() => setStep(3)}
                    className="text-xs font-bold text-[#126044] hover:underline"
                  >
                    Edit
                  </button>
                )}
              </div>

              {step === 3 ? (
                <div className="space-y-4">
                  <p className="text-xs text-[#52665d]">
                    Our temperature-controlled farm vehicles dispatch fresh batches twice daily.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {deliverySlots.map((slot) => {
                      const isSelected = selectedSlot.includes(slot.timeRange);
                      return (
                        <label
                          key={slot.id}
                          className={`flex flex-col justify-between rounded-2xl border p-4 cursor-pointer transition ${
                            isSelected
                              ? "border-[#126044] bg-[#f8efd9]/50 shadow-md ring-2 ring-[#126044]/30"
                              : "border-black/10 bg-[#fffdf8] hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-black text-[#173b27]">
                              {slot.title}
                            </span>
                            <input
                              type="radio"
                              name="delivery_slot"
                              checked={isSelected}
                              onChange={() =>
                                setSelectedSlot(`${slot.title} (${slot.timeRange})`)
                              }
                              className="accent-[#126044]"
                            />
                          </div>
                          <div className="flex items-center gap-1.5 text-sm font-bold text-[#126044]">
                            <Clock size={16} /> {slot.timeRange}
                          </div>
                          <p className="text-[11px] text-gray-500 mt-2">
                            {slot.cutoffTime}
                          </p>
                        </label>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <span className="text-xs font-bold text-gray-700">Delivery Date:</span>
                    <select
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      className="rounded-xl border border-black/10 bg-[#fffdf8] px-3 py-1.5 text-xs font-semibold text-[#173b27] outline-none"
                    >
                      <option value="Tomorrow Morning">Tomorrow (First Available)</option>
                      <option value="Day after Tomorrow">Day after Tomorrow</option>
                      <option value="This Weekend">This Weekend</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="mt-4 rounded-full bg-[#126044] px-8 py-3 text-sm font-bold text-white shadow hover:bg-[#0e5039]"
                  >
                    Review Order &amp; Proceed to Pay
                  </button>
                </div>
              ) : (
                <div className="text-sm text-[#52665d] flex items-center gap-2">
                  <Clock size={16} className="text-[#126044]" />
                  <span>{selectedSlot} &bull; <strong>{deliveryDate}</strong></span>
                </div>
              )}
            </div>

            {/* STEP 4 & 5: REVIEW & PAYMENT METHOD */}
            {step === 4 && (
              <div className="rounded-3xl border border-black/5 bg-white p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#173b27] text-xs font-bold text-white">
                    4
                  </span>
                  <h2 className="text-xl font-black text-[#173b27]">
                    Select Payment Method
                  </h2>
                </div>

                <div className="space-y-3">
                  {/* RAZORPAY ONLINE */}
                  <label
                    className={`flex items-start justify-between rounded-2xl border p-4 cursor-pointer transition ${
                      paymentMethod === "online"
                        ? "border-[#126044] bg-[#f8efd9]/50 shadow-md ring-2 ring-[#126044]/30"
                        : "border-black/10 bg-[#fffdf8] hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="payment_method"
                        checked={paymentMethod === "online"}
                        onChange={() => setPaymentMethod("online")}
                        className="mt-1 accent-[#126044]"
                      />
                      <div>
                        <p className="text-sm font-bold text-[#173b27] flex items-center gap-2">
                          <CreditCard size={18} className="text-[#126044]" />
                          Online Payment (Razorpay UPI, Cards, Netbanking)
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Google Pay, PhonePe, Paytm, Any UPI, Credit/Debit Cards, Netbanking.
                        </p>
                        <span className="inline-block mt-2 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5">
                          ✓ Contactless &amp; Instant Confirmation
                        </span>
                      </div>
                    </div>
                  </label>

                  {/* CASH ON DELIVERY */}
                  <label
                    className={`flex items-start justify-between rounded-2xl border p-4 cursor-pointer transition ${
                      paymentMethod === "cod"
                        ? "border-[#126044] bg-[#f8efd9]/50 shadow-md ring-2 ring-[#126044]/30"
                        : "border-black/10 bg-[#fffdf8] hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="payment_method"
                        checked={paymentMethod === "cod"}
                        onChange={() => setPaymentMethod("cod")}
                        className="mt-1 accent-[#126044]"
                      />
                      <div>
                        <p className="text-sm font-bold text-[#173b27]">
                          💵 Cash on Delivery (COD)
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Pay by cash or scan QR upon morning delivery to your doorstep.
                        </p>
                      </div>
                    </div>
                  </label>
                </div>

                {/* PLACE ORDER FINAL BUTTON */}
                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={isProcessing}
                  className="w-full flex h-14 items-center justify-center gap-2 rounded-full bg-[#126044] px-8 text-base font-bold text-white shadow-xl transition hover:bg-[#0e5039] disabled:bg-gray-300"
                >
                  {isProcessing ? (
                    <span className="flex items-center gap-2">
                      Processing Payment...
                    </span>
                  ) : paymentMethod === "online" ? (
                    <>Pay ₹{totalAmount} via Razorpay</>
                  ) : (
                    <>Confirm Cash on Delivery Order (₹{totalAmount})</>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* RIGHT 1 COLUMN: ORDER SUMMARY CARD */}
          <div className="space-y-4">
            <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm sticky top-24">
              <h3 className="text-lg font-black text-[#173b27] mb-4">
                Items in Order ({cart.length})
              </h3>

              <div className="max-h-60 overflow-y-auto space-y-3 border-b border-black/5 pb-4 mb-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-10 w-10 rounded-lg object-contain bg-[#f8efd9] p-1"
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-[#173b27] truncate">{item.name}</p>
                        <p className="text-gray-400">
                          {item.variantName} x {item.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-[#173b27]">
                      ₹{item.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 text-xs text-[#52665d] border-b border-black/5 pb-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-[#173b27]">₹{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Doorstep Delivery</span>
                  <span>
                    {deliveryFee === 0 ? (
                      <strong className="text-[#126044]">FREE</strong>
                    ) : (
                      `₹${deliveryFee}`
                    )}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-[#126044] font-bold">
                    <span>Coupon ({appliedCoupon})</span>
                    <span>-₹{discount}</span>
                  </div>
                )}
              </div>

              <div className="flex items-baseline justify-between pt-4">
                <span className="text-sm font-bold text-[#173b27]">Total Amount</span>
                <span className="text-2xl font-black text-[#c77828]">
                  ₹{totalAmount}
                </span>
              </div>

              <div className="mt-4 rounded-xl bg-[#f8efd9] p-3 text-[11px] text-[#52665d] flex items-center gap-2">
                <ShieldCheck size={16} className="text-[#126044] shrink-0" />
                <span>Palletoori&apos;s Farm Fresh Purity Guarantee included.</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
