"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { DairyStore } from "@/lib/db/store";
import { Order } from "@/types/dairy";
import { Package } from "lucide-react";

export default function OrdersPage() {
  const [orders] = useState<Order[]>(() =>
    typeof window !== "undefined" ? DairyStore.getOrders() : []
  );
  const loading = false;

  const getStatusBadge = (status: Order["orderStatus"]) => {
    switch (status) {
      case "delivered":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "out_for_delivery":
        return "bg-amber-100 text-amber-800 border-amber-200 animate-pulse";
      case "preparing":
      case "packed":
      case "confirmed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#fffdf8] flex flex-col justify-between">
      <Header />

      <main className="w-full flex-1 px-4 py-8 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-[#173b27]">
              My Orders
            </h1>
            <p className="mt-1 text-sm text-[#52665d]">
              Review and track all your fresh farm deliveries
            </p>
          </div>

          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#126044] px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-[#0e5039]"
          >
            Order More Fresh Dairy
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <p className="text-sm text-gray-500 animate-pulse">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-3xl border border-black/5 bg-white p-12 text-center shadow-sm max-w-xl mx-auto my-8">
            <Package size={48} className="mx-auto text-gray-300 mb-3" />
            <h2 className="text-xl font-bold text-[#173b27]">No orders found</h2>
            <p className="mt-1 text-xs text-gray-500">
              You haven&apos;t placed any dairy orders yet. Start your journey with pure milk &amp; bilona ghee today!
            </p>
            <Link
              href="/products"
              className="mt-6 inline-block rounded-full bg-[#126044] px-6 py-2.5 text-xs font-bold text-white"
            >
              Browse Farm Products
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="block rounded-3xl border border-black/5 bg-white p-5 sm:p-6 shadow-sm transition hover:shadow-md hover:border-[#126044]/30"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/5 pb-4 mb-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-base font-black text-[#173b27]">
                        #{order.orderNumber}
                      </span>
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase ${getStatusBadge(
                          order.orderStatus
                        )}`}
                      >
                        {order.orderStatus.replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Placed on{" "}
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-xl font-black text-[#c77828]">
                      ₹{order.totalAmount}
                    </span>
                    <p className="text-[11px] text-gray-500">
                      {order.items.length} {order.items.length === 1 ? "item" : "items"} &bull; {order.paymentMethod.toUpperCase()}
                    </p>
                  </div>
                </div>

                {/* ITEMS PREVIEW */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3 overflow-x-auto">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-10 w-10 rounded-xl object-contain bg-[#f8efd9] p-1 border border-black/5"
                        />
                        <div className="text-xs">
                          <p className="font-semibold text-[#173b27]">{item.name}</p>
                          <p className="text-gray-400">{item.variantName} x {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-1 text-xs font-bold text-[#126044]">
                    <span>Track Status &rarr;</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
