"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import OrderTimeline from "@/components/OrderTimeline";
import { DairyStore } from "@/lib/db/store";
import { Order } from "@/types/dairy";
import {
  CheckCircle2,
  Package,
  Calendar,
  Clock,
  MapPin,
  Phone,
  ArrowRight,
  Download,
  Share2,
} from "lucide-react";

export default function OrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const found = DairyStore.getOrderById(id);
    if (found) {
      setOrder(found);
    }
    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fffdf8] flex items-center justify-center">
        <p className="text-gray-500 font-bold animate-pulse">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#fffdf8] flex flex-col justify-between">
        <Header />
        <div className="max-w-md mx-auto text-center py-20 px-4">
          <p className="text-5xl mb-4">🔍</p>
          <h2 className="text-2xl font-black text-[#173b27]">Order Not Found</h2>
          <p className="text-sm text-gray-500 mt-2">
            We couldn&apos;t find an order matching #{id}. Please verify your order number.
          </p>
          <Link
            href="/orders"
            className="mt-6 inline-block rounded-full bg-[#126044] px-8 py-3 text-sm font-bold text-white shadow"
          >
            View All Orders
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const isRecentOrder =
    new Date().getTime() - new Date(order.createdAt).getTime() < 10 * 60 * 1000;

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#fffdf8] flex flex-col justify-between">
      <Header />

      <main className="w-full flex-1 px-4 py-8 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        {/* SUCCESS CELEBRATION HEADER (if placed within last 10 mins) */}
        {isRecentOrder && (
          <div className="rounded-3xl bg-[#f8efd9] p-6 sm:p-8 text-center mb-8 border border-black/5 shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#126044] text-white shadow-md mb-3">
              <CheckCircle2 size={32} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#173b27]">
              Order Placed Successfully!
            </h1>
            <p className="mt-2 text-sm text-[#52665d] max-w-lg mx-auto">
              Thank you for ordering with Palletoori&apos;s Dairy Farm. Our farm staff has received your order and will prepare it fresh for morning delivery.
            </p>
          </div>
        )}

        {/* ORDER INFO BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/10 pb-6 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-[#173b27]">
                Order #{order.orderNumber}
              </h2>
              <span className="rounded-full bg-[#126044]/10 text-[#126044] px-3 py-0.5 text-xs font-bold uppercase">
                {order.orderStatus.replace("_", " ")}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", {
                weekday: "long",
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-bold text-[#173b27] shadow-sm hover:bg-gray-50"
            >
              <Download size={14} /> Print Invoice
            </button>
            <Link
              href="/orders"
              className="inline-flex items-center gap-1.5 rounded-full bg-[#173b27] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#126044]"
            >
              My Orders &rarr;
            </Link>
          </div>
        </div>

        {/* TIMELINE */}
        <div className="rounded-3xl border border-black/5 bg-white p-6 sm:p-8 shadow-sm mb-8">
          <h3 className="text-base font-black text-[#173b27] mb-2">
            Live Order Tracking Timeline
          </h3>
          <p className="text-xs text-gray-500 mb-6">
            Real-time fulfillment stages from milking to your porch
          </p>

          <OrderTimeline currentStatus={order.orderStatus} />
        </div>

        {/* DETAILS GRID */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* ITEMS LIST (2 COLUMNS) */}
          <div className="md:col-span-2 space-y-4">
            <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-black text-[#173b27] mb-4">
                Purchased Products ({order.items.length})
              </h3>

              <div className="divide-y divide-black/5">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-14 w-14 rounded-2xl bg-[#f8efd9] p-2 flex items-center justify-center shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#173b27]">{item.name}</p>
                        <p className="text-xs text-gray-500">
                          {item.variantName} &bull; Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-black text-[#173b27]">
                      ₹{item.total}
                    </p>
                  </div>
                ))}
              </div>

              {/* PAYMENT BREAKDOWN */}
              <div className="border-t border-black/5 pt-4 mt-4 space-y-2 text-xs text-[#52665d]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-[#173b27]">₹{order.subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charge</span>
                  <span>{order.deliveryFee === 0 ? "FREE" : `₹${order.deliveryFee}`}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-[#126044] font-bold">
                    <span>Discount {order.couponCode && `(${order.couponCode})`}</span>
                    <span>-₹{order.discount}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-black/5 pt-2 text-base font-black text-[#173b27]">
                  <span>Total Paid</span>
                  <span className="text-[#c77828]">₹{order.totalAmount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* DELIVERY & ADDRESS CARD */}
          <div className="space-y-4">
            <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm space-y-4 text-xs">
              <div>
                <h4 className="font-black text-[#173b27] text-sm uppercase tracking-wider mb-2">
                  Delivery Details
                </h4>
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <Clock size={16} className="text-[#126044]" />
                  <span>Slot: <strong>{order.deliverySlot}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar size={16} className="text-[#126044]" />
                  <span>Date: <strong>{order.deliveryDate}</strong></span>
                </div>
              </div>

              <div className="border-t border-black/5 pt-4">
                <h4 className="font-black text-[#173b27] text-sm uppercase tracking-wider mb-2">
                  Delivery Address
                </h4>
                <p className="font-bold text-[#173b27]">{order.customerName}</p>
                <p className="text-gray-500 mt-0.5">{order.address.houseFlat}, {order.address.street}</p>
                <p className="text-gray-500">{order.address.area}, {order.address.city} - {order.address.pincode}</p>
                <p className="text-gray-600 font-semibold mt-1">📞 +91 {order.customerPhone}</p>
                {order.address.instructions && (
                  <p className="mt-2 rounded-xl bg-[#f8efd9] p-2 text-gray-600">
                    Note: {order.address.instructions}
                  </p>
                )}
              </div>

              <div className="border-t border-black/5 pt-4">
                <h4 className="font-black text-[#173b27] text-sm uppercase tracking-wider mb-2">
                  Payment Details
                </h4>
                <p className="text-gray-600">
                  Method: <strong className="uppercase">{order.paymentMethod}</strong>
                </p>
                <p className="text-gray-600">
                  Status: <strong className="text-emerald-700 uppercase">{order.paymentStatus}</strong>
                </p>
                {order.razorpayPaymentId && (
                  <p className="text-[10px] text-gray-400 mt-1 font-mono truncate">
                    Ref: {order.razorpayPaymentId}
                  </p>
                )}
              </div>
            </div>

            {/* FARM CONTACT HELP */}
            <div className="rounded-2xl bg-[#f8efd9] p-4 text-xs text-[#52665d]">
              <p className="font-bold text-[#173b27] mb-1">Need help with this order?</p>
              <p>Our dispatch manager is available from 5:00 AM to 9:00 PM.</p>
              <a
                href="tel:+919876543210"
                className="mt-2 inline-flex items-center gap-1.5 font-bold text-[#126044] hover:underline"
              >
                <Phone size={14} /> Call Farm Desk: +91 98765 43210
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
