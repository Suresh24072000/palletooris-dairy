"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/lib/context/AuthContext";
import { DairyStore } from "@/lib/db/store";
import { Address } from "@/types/dairy";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Package,
  Calendar,
  CreditCard,
  LogOut,
  Plus,
  Trash2,
  CheckCircle2,
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const { user, updateProfile, addAddress, deleteAddress, logout } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [email, setEmail] = useState(user?.email || "");

  // Address Modal
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddress, setNewAddress] = useState<Omit<Address, "id">>({
    fullName: user?.fullName || "",
    phone: user?.phone || "",
    houseFlat: "",
    street: "",
    area: "",
    city: "Hyderabad",
    state: "Telangana",
    pincode: "",
    landmark: "",
    instructions: "",
  });

  const orders = DairyStore.getOrders();
  const subscriptions = DairyStore.getSubscriptions();

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ fullName, email });
    setIsEditing(false);
  };

  const handleAddAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addAddress(newAddress);
    setShowAddressModal(false);
    setNewAddress({
      fullName: user?.fullName || "",
      phone: user?.phone || "",
      houseFlat: "",
      street: "",
      area: "",
      city: "Hyderabad",
      state: "Telangana",
      pincode: "",
      landmark: "",
      instructions: "",
    });
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#fffdf8] flex flex-col justify-between">
      <Header />

      <main className="w-full flex-1 px-4 py-8 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-[#173b27]">
              Customer Profile
            </h1>
            <p className="mt-1 text-sm text-[#52665d]">
              Manage your personal information, delivery addresses, and farm preferences
            </p>
          </div>

          <button
            onClick={() => {
              logout();
              router.push("/");
            }}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold text-red-700 hover:bg-red-100"
          >
            <LogOut size={14} /> Logout
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* LEFT COLUMN: PERSONAL INFO & QUICK STATS */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f8efd9] text-[#173b27]">
                    <User size={24} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#173b27]">
                      {user?.fullName || "Valued Customer"}
                    </h3>
                    <p className="text-xs text-gray-500">Palletoori&apos;s Member</p>
                  </div>
                </div>

                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-xs font-bold text-[#126044] hover:underline"
                  >
                    Edit
                  </button>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={handleSaveProfile} className="space-y-3 pt-2 border-t border-black/5">
                  <div>
                    <label className="text-[11px] font-bold text-gray-500 block mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full rounded-xl border border-black/10 bg-[#fffdf8] p-2 text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-500 block mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-black/10 bg-[#fffdf8] p-2 text-xs outline-none"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      className="rounded-xl bg-[#126044] px-4 py-1.5 text-xs font-bold text-white"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="text-xs text-gray-500 hover:text-black"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-2 text-xs text-[#52665d] border-t border-black/5 pt-3">
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-[#126044]" />
                    <span>+91 {user?.phone || "9876543210"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-[#126044]" />
                    <span>{user?.email || "Not provided"}</span>
                  </div>
                </div>
              )}
            </div>

            {/* QUICK STATS */}
            <div className="rounded-3xl border border-black/5 bg-[#f8efd9] p-6 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#b77932]">
                Your Farm Activity
              </h4>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Total Orders Placed:</span>
                <strong className="text-sm font-bold text-[#173b27]">{orders.length}</strong>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Active Subscriptions:</span>
                <strong className="text-sm font-bold text-[#173b27]">
                  {subscriptions.filter((s) => s.status === "active").length}
                </strong>
              </div>
              <div className="pt-2 border-t border-black/10 flex flex-col gap-2">
                <Link
                  href="/orders"
                  className="rounded-xl bg-white p-2.5 text-center text-xs font-bold text-[#173b27] shadow-sm hover:bg-[#fffdf8]"
                >
                  View All Orders
                </Link>
                <Link
                  href="/subscriptions"
                  className="rounded-xl bg-white p-2.5 text-center text-xs font-bold text-[#173b27] shadow-sm hover:bg-[#fffdf8]"
                >
                  Manage Daily Milk Plan
                </Link>
              </div>
            </div>
          </div>

          {/* RIGHT 2 COLUMNS: SAVED ADDRESSES */}
          <div className="md:col-span-2 space-y-6">
            <div className="rounded-3xl border border-black/5 bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-black text-[#173b27]">
                    Saved Delivery Addresses
                  </h3>
                  <p className="text-xs text-gray-500">
                    Where our delivery vehicle drops your morning milk basket
                  </p>
                </div>

                <button
                  onClick={() => setShowAddressModal(true)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#126044] px-4 py-2 text-xs font-bold text-white shadow hover:bg-[#0e5039]"
                >
                  <Plus size={14} /> Add Address
                </button>
              </div>

              {/* ADDRESSES LIST */}
              <div className="space-y-4">
                {(user?.addresses || []).map((addr) => (
                  <div
                    key={addr.id}
                    className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 rounded-2xl border border-black/10 bg-[#fffdf8] p-4 transition hover:border-[#126044]/30"
                  >
                    <div className="flex items-start gap-3">
                      <MapPin size={18} className="text-[#126044] shrink-0 mt-0.5" />
                      <div className="text-xs text-[#52665d] space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-[#173b27]">
                            {addr.fullName}
                          </p>
                          {addr.isDefault && (
                            <span className="rounded bg-emerald-100 text-emerald-800 px-1.5 py-0.5 text-[10px] font-bold">
                              Default
                            </span>
                          )}
                        </div>
                        <p>{addr.houseFlat}, {addr.street}</p>
                        <p>{addr.area}, {addr.city} - {addr.pincode}</p>
                        <p className="font-semibold text-gray-700">📞 +91 {addr.phone}</p>
                        {addr.instructions && (
                          <p className="text-gray-400 italic">
                            &ldquo;{addr.instructions}&rdquo;
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => deleteAddress(addr.id)}
                      className="self-end sm:self-auto text-gray-400 hover:text-red-600 p-1"
                      title="Delete address"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* ADD ADDRESS MODAL */}
            {showAddressModal && (
              <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-black/5 pb-3">
                  <h4 className="text-base font-black text-[#173b27]">
                    Add New Delivery Address
                  </h4>
                  <button
                    onClick={() => setShowAddressModal(false)}
                    className="text-xs text-gray-400 hover:text-black"
                  >
                    Close
                  </button>
                </div>

                <form onSubmit={handleAddAddressSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-gray-600 block mb-1">
                        Recipient Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={newAddress.fullName}
                        onChange={(e) =>
                          setNewAddress({ ...newAddress, fullName: e.target.value })
                        }
                        className="w-full rounded-xl border border-black/10 bg-[#fffdf8] p-2.5 text-xs outline-none focus:border-[#126044]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-gray-600 block mb-1">
                        Contact Phone *
                      </label>
                      <input
                        type="tel"
                        required
                        value={newAddress.phone}
                        onChange={(e) =>
                          setNewAddress({ ...newAddress, phone: e.target.value })
                        }
                        className="w-full rounded-xl border border-black/10 bg-[#fffdf8] p-2.5 text-xs outline-none focus:border-[#126044]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-gray-600 block mb-1">
                        House / Flat / Villa No. *
                      </label>
                      <input
                        type="text"
                        required
                        value={newAddress.houseFlat}
                        onChange={(e) =>
                          setNewAddress({ ...newAddress, houseFlat: e.target.value })
                        }
                        className="w-full rounded-xl border border-black/10 bg-[#fffdf8] p-2.5 text-xs outline-none focus:border-[#126044]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-gray-600 block mb-1">
                        Street / Colony *
                      </label>
                      <input
                        type="text"
                        required
                        value={newAddress.street}
                        onChange={(e) =>
                          setNewAddress({ ...newAddress, street: e.target.value })
                        }
                        className="w-full rounded-xl border border-black/10 bg-[#fffdf8] p-2.5 text-xs outline-none focus:border-[#126044]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-gray-600 block mb-1">
                        Area / Locality *
                      </label>
                      <input
                        type="text"
                        required
                        value={newAddress.area}
                        onChange={(e) =>
                          setNewAddress({ ...newAddress, area: e.target.value })
                        }
                        className="w-full rounded-xl border border-black/10 bg-[#fffdf8] p-2.5 text-xs outline-none focus:border-[#126044]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-gray-600 block mb-1">
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
                      <label className="text-[11px] font-bold text-gray-600 block mb-1">
                        Pincode *
                      </label>
                      <input
                        type="text"
                        required
                        value={newAddress.pincode}
                        onChange={(e) =>
                          setNewAddress({ ...newAddress, pincode: e.target.value })
                        }
                        className="w-full rounded-xl border border-black/10 bg-[#fffdf8] p-2.5 text-xs outline-none focus:border-[#126044]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-gray-600 block mb-1">
                      Delivery Instructions
                    </label>
                    <input
                      type="text"
                      value={newAddress.instructions}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, instructions: e.target.value })
                      }
                      placeholder="e.g. Ring the bell, leave inside doorstep dairy bag"
                      className="w-full rounded-xl border border-black/10 bg-[#fffdf8] p-2.5 text-xs outline-none focus:border-[#126044]"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddressModal(false)}
                      className="px-4 py-2 text-xs font-bold text-gray-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-full bg-[#126044] px-6 py-2 text-xs font-bold text-white shadow hover:bg-[#0e5039]"
                    >
                      Save Address
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
