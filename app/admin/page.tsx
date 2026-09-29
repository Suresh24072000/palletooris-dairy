"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { DairyStore } from "@/lib/db/store";
import {
  Product,
  Order,
  Subscription,
  DeliveryTask,
  OrderStatus,
  DeliveryStatus,
  ProductVariant,
} from "@/types/dairy";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Truck,
  Boxes,
  Users,
  Calendar,
  BarChart3,
  LogOut,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Search,
  ChevronDown,
  ArrowUpRight,
  TrendingUp,
  Menu,
  X,
  ExternalLink,
} from "lucide-react";

type AdminTab =
  | "overview"
  | "products"
  | "orders"
  | "deliveries"
  | "inventory"
  | "customers"
  | "subscriptions"
  | "analytics";

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Data states
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [deliveries, setDeliveries] = useState<DeliveryTask[]>([]);
  const [feedback, setFeedback] = useState("");

  // Product modal state
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: "",
    slug: "",
    category: "Fresh Milk",
    shortDescription: "",
    description: "",
    image: "/milk.png",
    variantName: "1 Litre",
    price: 70,
    stock: 50,
    unit: "L",
    isFeatured: false,
    isAvailable: true,
  });

  const loadData = () => {
    setProducts(DairyStore.getProducts());
    setOrders(DairyStore.getOrders());
    setSubscriptions(DairyStore.getSubscriptions());
    setDeliveries(DairyStore.getDeliveries());
  };

  useEffect(() => {
    loadData();
  }, []);

  const showNotification = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(""), 3500);
  };

  // Status updates
  const handleUpdateOrderStatus = (orderId: string, status: OrderStatus) => {
    DairyStore.updateOrderStatus(orderId, status);
    loadData();
    showNotification(`Order status updated to ${status.replace("_", " ")}`);
  };

  const handleUpdateDeliveryStatus = (taskId: string, status: DeliveryStatus, driver?: string) => {
    DairyStore.updateDeliveryStatus(taskId, status, driver);
    loadData();
    showNotification(`Delivery status updated to ${status.replace("_", " ")}`);
  };

  // Product CRUD
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: "",
      slug: "",
      category: "Fresh Milk",
      shortDescription: "",
      description: "",
      image: "/milk.png",
      variantName: "1 Litre",
      price: 75,
      stock: 50,
      unit: "L",
      isFeatured: false,
      isAvailable: true,
    });
    setShowProductModal(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name,
      slug: prod.slug,
      category: prod.category,
      shortDescription: prod.shortDescription,
      description: prod.description,
      image: prod.image,
      variantName: prod.variants[0]?.name || "Standard",
      price: prod.variants[0]?.price || 0,
      stock: prod.variants[0]?.stock || 0,
      unit: prod.variants[0]?.unit || "unit",
      isFeatured: !!prod.isFeatured,
      isAvailable: prod.isAvailable,
    });
    setShowProductModal(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const slug =
      productForm.slug ||
      productForm.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    if (editingProduct) {
      const updated: Product = {
        ...editingProduct,
        name: productForm.name,
        slug,
        category: productForm.category,
        shortDescription: productForm.shortDescription,
        description: productForm.description,
        image: productForm.image,
        isFeatured: productForm.isFeatured,
        isAvailable: productForm.isAvailable,
        variants: [
          {
            ...editingProduct.variants[0],
            name: productForm.variantName,
            price: Number(productForm.price),
            stock: Number(productForm.stock),
            unit: productForm.unit,
            isAvailable: productForm.isAvailable,
          },
          ...(editingProduct.variants.slice(1) || []),
        ],
      };
      DairyStore.saveProduct(updated);
      showNotification(`Product "${productForm.name}" updated successfully.`);
    } else {
      const newProd: Product = {
        id: `prod-${Date.now()}`,
        name: productForm.name,
        slug,
        category: productForm.category,
        shortDescription: productForm.shortDescription,
        description: productForm.description,
        image: productForm.image,
        isFeatured: productForm.isFeatured,
        isAvailable: productForm.isAvailable,
        variants: [
          {
            id: `var-${Date.now()}`,
            productId: `prod-${Date.now()}`,
            name: productForm.variantName,
            price: Number(productForm.price),
            stock: Number(productForm.stock),
            unit: productForm.unit,
            isAvailable: true,
          },
        ],
      };
      DairyStore.saveProduct(newProd);
      showNotification(`New product "${productForm.name}" added to catalog.`);
    }

    setShowProductModal(false);
    loadData();
  };

  const handleDeleteProduct = (id: string, name: string) => {
    if (confirm(`Are you sure you want to deactivate and remove "${name}"?`)) {
      DairyStore.deleteProduct(id);
      loadData();
      showNotification(`Product "${name}" deleted.`);
    }
  };

  const handleStockReplenish = (prod: Product, variantId: string, addQty: number) => {
    const updatedVariants = prod.variants.map((v) =>
      v.id === variantId ? { ...v, stock: v.stock + addQty } : v
    );
    DairyStore.saveProduct({ ...prod, variants: updatedVariants });
    loadData();
    showNotification(`Restocked ${prod.name} (+${addQty} units)`);
  };

  // Calculations for Overview & Analytics
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const pendingOrdersCount = orders.filter((o) => o.orderStatus === "pending" || o.orderStatus === "confirmed").length;
  const toDeliverCount = orders.filter((o) => o.orderStatus === "out_for_delivery" || o.orderStatus === "packed").length;
  const activeSubsCount = subscriptions.filter((s) => s.status === "active").length;
  const lowStockVariants = products.flatMap((p) =>
    p.variants
      .filter((v) => v.stock <= 40)
      .map((v) => ({ product: p, variant: v }))
  );

  return (
    <div className="min-h-screen bg-[#f4efe4] flex flex-col md:flex-row text-[#173b27]">
      {/* ================= DESKTOP & MOBILE SIDEBAR ================= */}
      <aside
        className={`fixed md:sticky top-0 z-50 h-screen w-64 bg-[#173b27] text-white flex flex-col justify-between p-5 transition-transform duration-300 ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div>
          {/* LOGO */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
            <Link href="/" className="flex items-center gap-2">
              <img
                src="/logo.png"
                alt="Palletoori's"
                className="h-10 w-auto object-contain brightness-0 invert"
              />
            </Link>
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="md:hidden text-white/70 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          <p className="text-[10px] font-bold uppercase tracking-widest text-[#e5b36d] mb-3 px-3">
            Farm Management
          </p>

          {/* NAV ITEMS */}
          <nav className="space-y-1">
            {[
              { id: "overview", label: "Dashboard Overview", icon: LayoutDashboard },
              { id: "orders", label: "Orders Management", icon: ShoppingCart, badge: pendingOrdersCount },
              { id: "deliveries", label: "Delivery Operations", icon: Truck },
              { id: "products", label: "Products & Pricing", icon: Package },
              { id: "inventory", label: "Inventory & Stock", icon: Boxes, badge: lowStockVariants.length },
              { id: "subscriptions", label: "Daily Subscriptions", icon: Calendar, badge: activeSubsCount },
              { id: "customers", label: "Customer Ledger", icon: Users },
              { id: "analytics", label: "Sales Analytics", icon: BarChart3 },
            ].map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as AdminTab);
                    setMobileSidebarOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold transition ${
                    isActive
                      ? "bg-[#126044] text-white shadow"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <item.icon size={16} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge ? (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#c77828] px-1 text-[10px] font-bold text-white">
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>

        {/* BOTTOM USER BAR */}
        <div className="border-t border-white/10 pt-4 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between rounded-xl bg-white/10 px-3.5 py-2 text-xs font-semibold text-white/90 hover:bg-white/20"
          >
            <span className="flex items-center gap-2">
              <ExternalLink size={14} /> View Live Store
            </span>
          </Link>
          <div className="px-3 text-[10px] text-white/50">
            Palletoori&apos;s Operations v2.0
          </div>
        </div>
      </aside>

      {/* ================= MAIN CONTENT AREA ================= */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOP BAR */}
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-black/5 bg-[#fffdf8] px-4 sm:px-8 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg border border-black/10 text-[#173b27]"
            >
              <Menu size={18} />
            </button>
            <h1 className="text-base sm:text-lg font-black text-[#173b27] capitalize">
              {activeTab === "overview" ? "Executive Dashboard" : activeTab.replace("-", " ")}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {feedback && (
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-emerald-100 text-emerald-800 px-3 py-1 text-xs font-bold animate-fade-in">
                <CheckCircle2 size={14} /> {feedback}
              </span>
            )}
            <span className="rounded-full bg-[#f8efd9] px-3 py-1 text-xs font-bold text-[#173b27]">
              Farm Manager Mode
            </span>
          </div>
        </header>

        {/* NOTIFICATION TOAST FOR MOBILE */}
        {feedback && (
          <div className="sm:hidden bg-emerald-600 text-white text-xs font-bold p-2 text-center">
            {feedback}
          </div>
        )}

        {/* TAB CONTENTS */}
        <main className="p-4 sm:p-8 flex-1 overflow-x-hidden">
          {/* 1. OVERVIEW TAB */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              {/* KPI STAT CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Total Revenue
                  </p>
                  <p className="text-3xl font-black text-[#173b27] mt-2">
                    ₹{totalRevenue.toLocaleString("en-IN")}
                  </p>
                  <div className="flex items-center gap-1 text-xs font-bold text-emerald-700 mt-2">
                    <TrendingUp size={14} /> +18.4% from last week
                  </div>
                </div>

                <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Pending Orders
                  </p>
                  <p className="text-3xl font-black text-[#c77828] mt-2">
                    {pendingOrdersCount}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">Requires morning packaging</p>
                </div>

                <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Out for Delivery
                  </p>
                  <p className="text-3xl font-black text-[#126044] mt-2">
                    {toDeliverCount}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">On farm delivery routes</p>
                </div>

                <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Active Milk Subscriptions
                  </p>
                  <p className="text-3xl font-black text-[#173b27] mt-2">
                    {activeSubsCount}
                  </p>
                  <p className="text-xs text-emerald-700 font-semibold mt-2">Daily recurring bottles</p>
                </div>
              </div>

              {/* QUICK DISPATCH & RECENT ORDERS */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* RECENT ORDERS TABLE */}
                <div className="lg:col-span-2 rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-black text-[#173b27]">
                      Today&apos;s Orders Requiring Attention
                    </h3>
                    <button
                      onClick={() => setActiveTab("orders")}
                      className="text-xs font-bold text-[#126044] hover:underline"
                    >
                      View All ({orders.length}) &rarr;
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-black/10 text-gray-400 font-bold uppercase">
                          <th className="pb-3">Order ID</th>
                          <th className="pb-3">Customer</th>
                          <th className="pb-3">Slot</th>
                          <th className="pb-3">Amount</th>
                          <th className="pb-3">Status</th>
                          <th className="pb-3 text-right">Quick Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/5">
                        {orders.slice(0, 5).map((o) => (
                          <tr key={o.id} className="hover:bg-gray-50">
                            <td className="py-3 font-bold text-[#173b27]">
                              #{o.orderNumber}
                            </td>
                            <td className="py-3">
                              <p className="font-semibold text-gray-800">{o.customerName}</p>
                              <p className="text-[10px] text-gray-400">{o.customerPhone}</p>
                            </td>
                            <td className="py-3 text-gray-600">{o.deliverySlot}</td>
                            <td className="py-3 font-bold text-[#c77828]">₹{o.totalAmount}</td>
                            <td className="py-3">
                              <span className="rounded-full bg-[#f8efd9] px-2.5 py-0.5 text-[10px] font-bold text-[#173b27] uppercase">
                                {o.orderStatus.replace("_", " ")}
                              </span>
                            </td>
                            <td className="py-3 text-right">
                              {o.orderStatus === "confirmed" && (
                                <button
                                  onClick={() => handleUpdateOrderStatus(o.id, "preparing")}
                                  className="rounded-lg bg-[#126044] px-2.5 py-1 text-[10px] font-bold text-white"
                                >
                                  Pack &rarr;
                                </button>
                              )}
                              {o.orderStatus === "preparing" && (
                                <button
                                  onClick={() => handleUpdateOrderStatus(o.id, "out_for_delivery")}
                                  className="rounded-lg bg-[#c77828] px-2.5 py-1 text-[10px] font-bold text-white"
                                >
                                  Dispatch &rarr;
                                </button>
                              )}
                              {o.orderStatus === "out_for_delivery" && (
                                <button
                                  onClick={() => handleUpdateOrderStatus(o.id, "delivered")}
                                  className="rounded-lg bg-emerald-700 px-2.5 py-1 text-[10px] font-bold text-white"
                                >
                                  Deliver ✓
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* LOW STOCK ALERT CARD */}
                <div className="space-y-4">
                  <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-2 text-amber-800 font-bold mb-3">
                      <AlertTriangle size={18} className="text-amber-600" />
                      <h4 className="text-sm">Inventory Alerts</h4>
                    </div>

                    {lowStockVariants.length === 0 ? (
                      <p className="text-xs text-gray-500">All product stock levels are healthy.</p>
                    ) : (
                      <div className="space-y-3">
                        {lowStockVariants.map(({ product, variant }) => (
                          <div
                            key={variant.id}
                            className="rounded-2xl border border-amber-200 bg-amber-50/50 p-3 flex items-center justify-between text-xs"
                          >
                            <div>
                              <p className="font-bold text-[#173b27]">{product.name}</p>
                              <p className="text-gray-500">{variant.name} &bull; Only {variant.stock} left</p>
                            </div>
                            <button
                              onClick={() => handleStockReplenish(product, variant.id, 50)}
                              className="rounded-lg bg-[#173b27] text-white px-2.5 py-1 text-[10px] font-bold"
                            >
                              +50 Stock
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="rounded-3xl border border-black/5 bg-[#173b27] p-6 text-white text-xs space-y-2">
                    <h4 className="font-bold text-sm text-[#e5b36d]">Morning Dispatch Checklist</h4>
                    <p>✓ Temperature check on refrigerated cold van (maintained below 4°C)</p>
                    <p>✓ Glass bottle seal inspection completed</p>
                    <p>✓ Delivery routes assigned to Shamshabad &amp; Hyderabad riders</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. ORDERS MANAGEMENT TAB */}
          {activeTab === "orders" && (
            <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-black text-[#173b27]">Customer Orders</h2>
                  <p className="text-xs text-gray-500">Manage fulfillment pipeline from order to doorstep</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-black/10 text-gray-400 font-bold uppercase">
                      <th className="pb-3">Order ID</th>
                      <th className="pb-3">Customer</th>
                      <th className="pb-3">Products</th>
                      <th className="pb-3">Slot &amp; Date</th>
                      <th className="pb-3">Amount</th>
                      <th className="pb-3">Payment</th>
                      <th className="pb-3">Order Status</th>
                      <th className="pb-3 text-right">Update Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {orders.map((o) => (
                      <tr key={o.id} className="hover:bg-gray-50">
                        <td className="py-3.5 font-bold text-[#173b27]">
                          #{o.orderNumber}
                        </td>
                        <td className="py-3.5">
                          <p className="font-bold text-gray-900">{o.customerName}</p>
                          <p className="text-[11px] text-gray-500">📞 {o.customerPhone}</p>
                          <p className="text-[10px] text-gray-400 truncate max-w-[150px]">
                            {o.address.houseFlat}, {o.address.area}
                          </p>
                        </td>
                        <td className="py-3.5">
                          {o.items.map((i, idx) => (
                            <p key={idx} className="text-gray-700">
                              {i.name} ({i.variantName}) x {i.quantity}
                            </p>
                          ))}
                        </td>
                        <td className="py-3.5 text-gray-600">
                          <p>{o.deliveryDate}</p>
                          <p className="text-[10px] text-gray-400">{o.deliverySlot}</p>
                        </td>
                        <td className="py-3.5 font-black text-[#c77828]">
                          ₹{o.totalAmount}
                        </td>
                        <td className="py-3.5">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                              o.paymentStatus === "paid"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {o.paymentStatus} ({o.paymentMethod.toUpperCase()})
                          </span>
                        </td>
                        <td className="py-3.5">
                          <span className="rounded-full bg-[#f8efd9] px-2.5 py-1 text-[11px] font-bold text-[#173b27] uppercase">
                            {o.orderStatus.replace("_", " ")}
                          </span>
                        </td>
                        <td className="py-3.5 text-right">
                          <select
                            value={o.orderStatus}
                            onChange={(e) =>
                              handleUpdateOrderStatus(o.id, e.target.value as OrderStatus)
                            }
                            className="rounded-xl border border-black/10 bg-[#fffdf8] px-2.5 py-1 text-xs font-bold outline-none text-[#173b27]"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="preparing">Preparing</option>
                            <option value="packed">Packed</option>
                            <option value="out_for_delivery">Out for Delivery</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. DELIVERIES TAB */}
          {activeTab === "deliveries" && (
            <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-[#173b27]">Delivery Fleet Operations</h2>
                  <p className="text-xs text-gray-500">Live morning driver assignment and route dispatch</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-black/10 text-gray-400 font-bold uppercase">
                      <th className="pb-3">Order #</th>
                      <th className="pb-3">Customer &amp; Phone</th>
                      <th className="pb-3">Delivery Address</th>
                      <th className="pb-3">Slot</th>
                      <th className="pb-3">Payment</th>
                      <th className="pb-3">Assigned Van / Rider</th>
                      <th className="pb-3">Delivery Status</th>
                      <th className="pb-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {deliveries.map((del) => (
                      <tr key={del.id} className="hover:bg-gray-50">
                        <td className="py-3.5 font-bold text-[#173b27]">
                          #{del.orderNumber}
                        </td>
                        <td className="py-3.5">
                          <p className="font-bold">{del.customerName}</p>
                          <p className="text-gray-500">📞 {del.customerPhone}</p>
                        </td>
                        <td className="py-3.5 text-gray-600 max-w-xs">
                          {del.addressSummary}
                        </td>
                        <td className="py-3.5">{del.deliverySlot}</td>
                        <td className="py-3.5">
                          <span className="font-bold uppercase">
                            ₹{del.totalAmount} ({del.paymentMethod})
                          </span>
                        </td>
                        <td className="py-3.5">
                          <input
                            type="text"
                            defaultValue={del.driverName || "Farm Van #1"}
                            onBlur={(e) =>
                              handleUpdateDeliveryStatus(
                                del.id,
                                del.deliveryStatus,
                                e.target.value
                              )
                            }
                            className="rounded-lg border border-black/10 p-1 text-xs outline-none bg-[#fffdf8]"
                          />
                        </td>
                        <td className="py-3.5">
                          <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold uppercase">
                            {del.deliveryStatus.replace("_", " ")}
                          </span>
                        </td>
                        <td className="py-3.5 text-right">
                          <select
                            value={del.deliveryStatus}
                            onChange={(e) =>
                              handleUpdateDeliveryStatus(
                                del.id,
                                e.target.value as DeliveryStatus,
                                del.driverName
                              )
                            }
                            className="rounded-xl border border-black/10 bg-[#fffdf8] px-2 py-1 text-xs font-bold outline-none"
                          >
                            <option value="assigned">Assigned</option>
                            <option value="picked_up">Picked Up</option>
                            <option value="out_for_delivery">Out for Delivery</option>
                            <option value="delivered">Delivered</option>
                            <option value="failed">Failed Delivery</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 4. PRODUCTS TAB */}
          {activeTab === "products" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-[#173b27]">Dairy Product Catalog</h2>
                  <p className="text-xs text-gray-500">Add products, configure variants, adjust pricing and stock</p>
                </div>
                <button
                  onClick={handleOpenAddProduct}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#126044] px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-[#0e5039]"
                >
                  <Plus size={16} /> Add New Dairy Product
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((prod) => (
                  <div
                    key={prod.id}
                    className="rounded-3xl border border-black/5 bg-white p-5 shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="h-20 w-20 rounded-2xl bg-[#f8efd9] p-2 flex items-center justify-center shrink-0">
                          <img
                            src={prod.image}
                            alt={prod.name}
                            className="h-full w-full object-contain"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#b77932]">
                            {prod.category}
                          </span>
                          <h3 className="text-base font-bold text-[#173b27] truncate">
                            {prod.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            {prod.isFeatured && (
                              <span className="rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5">
                                Featured
                              </span>
                            )}
                            <span
                              className={`rounded text-[10px] font-bold px-1.5 py-0.5 ${
                                prod.isAvailable
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {prod.isAvailable ? "Active" : "Hidden"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 border-t border-black/5 pt-3 space-y-2">
                        <p className="text-xs font-bold text-gray-500">Variants &amp; Pricing:</p>
                        {prod.variants.map((v) => (
                          <div
                            key={v.id}
                            className="flex items-center justify-between text-xs rounded-xl bg-[#fffdf8] border border-black/5 p-2"
                          >
                            <span className="font-semibold text-gray-700">{v.name}</span>
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-[#c77828]">₹{v.price}</span>
                              <span className="text-gray-400">Stock: {v.stock}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 border-t border-black/5 pt-3 flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEditProduct(prod)}
                        className="inline-flex items-center gap-1 rounded-xl border border-black/10 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                      >
                        <Edit size={12} /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(prod.id, prod.name)}
                        className="inline-flex items-center gap-1 rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. INVENTORY TAB */}
          {activeTab === "inventory" && (
            <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-[#173b27]">Inventory &amp; Stock Levels</h2>
                  <p className="text-xs text-gray-500">Track on-hand units and restock morning batches with 1 click</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-black/10 text-gray-400 font-bold uppercase">
                      <th className="pb-3">Product Name</th>
                      <th className="pb-3">Variant Size</th>
                      <th className="pb-3">Current Stock</th>
                      <th className="pb-3">Threshold</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right">Quick Restock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {products.flatMap((prod) =>
                      prod.variants.map((v) => {
                        const isLow = v.stock <= 40;
                        return (
                          <tr key={v.id} className="hover:bg-gray-50">
                            <td className="py-3.5 font-bold text-[#173b27]">
                              {prod.name}
                            </td>
                            <td className="py-3.5 text-gray-600">{v.name}</td>
                            <td className="py-3.5 font-black text-sm">
                              {v.stock} units
                            </td>
                            <td className="py-3.5 text-gray-400">40 units</td>
                            <td className="py-3.5">
                              {isLow ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                                  <AlertTriangle size={10} /> Low Stock
                                </span>
                              ) : (
                                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                                  Adequate
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 text-right space-x-1.5">
                              <button
                                onClick={() => handleStockReplenish(prod, v.id, 20)}
                                className="rounded-lg bg-gray-100 hover:bg-gray-200 px-2 py-1 text-[11px] font-semibold"
                              >
                                +20
                              </button>
                              <button
                                onClick={() => handleStockReplenish(prod, v.id, 50)}
                                className="rounded-lg bg-[#126044] text-white hover:bg-[#0e5039] px-2.5 py-1 text-[11px] font-bold"
                              >
                                +50
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 6. SUBSCRIPTIONS TAB */}
          {activeTab === "subscriptions" && (
            <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-[#173b27]">All Customer Subscriptions</h2>
                  <p className="text-xs text-gray-500">Recurring morning milk delivery contracts</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-black/10 text-gray-400 font-bold uppercase">
                      <th className="pb-3">Sub #</th>
                      <th className="pb-3">Customer</th>
                      <th className="pb-3">Product &amp; Size</th>
                      <th className="pb-3">Frequency</th>
                      <th className="pb-3">Slot</th>
                      <th className="pb-3">Payment</th>
                      <th className="pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {subscriptions.map((s) => (
                      <tr key={s.id} className="hover:bg-gray-50">
                        <td className="py-3.5 font-bold text-[#173b27]">
                          #{s.subscriptionNumber}
                        </td>
                        <td className="py-3.5">
                          <p className="font-bold">{s.customerName}</p>
                          <p className="text-gray-400">📞 {s.customerPhone}</p>
                        </td>
                        <td className="py-3.5">
                          <p className="font-bold text-[#173b27]">{s.productName}</p>
                          <p className="text-gray-500">
                            {s.variantName} &bull; Qty: {s.quantity}
                          </p>
                        </td>
                        <td className="py-3.5 capitalize font-semibold">
                          {s.frequency} ({s.deliveryDays.join(", ")})
                        </td>
                        <td className="py-3.5 text-gray-600">{s.deliverySlot}</td>
                        <td className="py-3.5">{s.paymentMethod}</td>
                        <td className="py-3.5">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                              s.status === "active"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {s.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 7. CUSTOMERS TAB */}
          {activeTab === "customers" && (
            <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm space-y-4">
              <div>
                <h2 className="text-lg font-black text-[#173b27]">Customer Management</h2>
                <p className="text-xs text-gray-500">Customer spending history, contacts, and active subscriptions</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-black/10 text-gray-400 font-bold uppercase">
                      <th className="pb-3">Customer Name</th>
                      <th className="pb-3">Phone</th>
                      <th className="pb-3">Location / Area</th>
                      <th className="pb-3">Total Orders</th>
                      <th className="pb-3">Total Spent</th>
                      <th className="pb-3">Subscription</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {[
                      {
                        name: "Suresh Reddy",
                        phone: "9876543210",
                        area: "Banjara Hills, Hyderabad",
                        orders: 4,
                        spent: "₹1,840",
                        sub: "Active (Cow Milk 1L)",
                      },
                      {
                        name: "Ananya Rao",
                        phone: "9845112233",
                        area: "Kondapur, Hyderabad",
                        orders: 2,
                        spent: "₹1,250",
                        sub: "None",
                      },
                      {
                        name: "Venkat Rao",
                        phone: "9701234567",
                        area: "Gachibowli, Hyderabad",
                        orders: 3,
                        spent: "₹920",
                        sub: "Active (Buffalo Milk 1L)",
                      },
                      {
                        name: "Pooja Sharma",
                        phone: "9123456780",
                        area: "Madhapur, Hyderabad",
                        orders: 1,
                        spent: "₹540",
                        sub: "None",
                      },
                    ].map((cust, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="py-3.5 font-bold text-[#173b27]">{cust.name}</td>
                        <td className="py-3.5 text-gray-600">+91 {cust.phone}</td>
                        <td className="py-3.5 text-gray-500">{cust.area}</td>
                        <td className="py-3.5 font-bold">{cust.orders} orders</td>
                        <td className="py-3.5 font-black text-[#c77828]">{cust.spent}</td>
                        <td className="py-3.5">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              cust.sub.includes("Active")
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {cust.sub}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 8. ANALYTICS TAB */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
                  <p className="text-xs font-bold text-gray-500 uppercase">Average Order Value (AOV)</p>
                  <p className="text-3xl font-black text-[#173b27] mt-2">₹343</p>
                  <p className="text-xs text-emerald-700 mt-2 font-bold">+12% vs last month</p>
                </div>
                <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
                  <p className="text-xs font-bold text-gray-500 uppercase">Monthly Projected Sales</p>
                  <p className="text-3xl font-black text-[#126044] mt-2">₹1,45,000</p>
                  <p className="text-xs text-gray-500 mt-2">Based on current active subscriptions</p>
                </div>
                <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
                  <p className="text-xs font-bold text-gray-500 uppercase">Subscription Retention Rate</p>
                  <p className="text-3xl font-black text-[#c77828] mt-2">94.8%</p>
                  <p className="text-xs text-emerald-700 mt-2 font-bold">Top tier customer loyalty</p>
                </div>
              </div>

              {/* TOP SELLING PRODUCTS */}
              <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
                <h3 className="text-base font-black text-[#173b27] mb-4">
                  Top-Selling Products by Volume
                </h3>
                <div className="space-y-3">
                  {[
                    { name: "Pure Cow Milk (1 Litre)", units: 1450, rev: "₹1,04,400", pct: "42%" },
                    { name: "Rich Buffalo Milk (1 Litre)", units: 920, rev: "₹80,960", pct: "31%" },
                    { name: "Pure Desi Danedar Bilona Ghee (500 ml)", units: 180, rev: "₹97,200", pct: "18%" },
                    { name: "Traditional Farm Curd (500 g)", units: 410, rev: "₹16,400", pct: "9%" },
                  ].map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-bold text-[#173b27]">{item.name}</span>
                        <span className="font-bold text-gray-600">{item.units} units sold &bull; {item.rev}</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full bg-[#126044] rounded-full"
                          style={{ width: item.pct }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ================= ADD / EDIT PRODUCT MODAL ================= */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between border-b border-black/5 pb-3 mb-4">
              <h3 className="text-lg font-black text-[#173b27]">
                {editingProduct ? "Edit Product" : "Add New Dairy Product"}
              </h3>
              <button
                onClick={() => setShowProductModal(false)}
                className="text-gray-400 hover:text-black"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="e.g. Pure Desi A2 Cow Milk"
                  className="w-full rounded-xl border border-black/10 bg-[#fffdf8] p-2.5 outline-none focus:border-[#126044]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Category *</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full rounded-xl border border-black/10 bg-[#fffdf8] p-2.5 outline-none"
                  >
                    <option value="Fresh Milk">Fresh Milk</option>
                    <option value="Curd & Buttermilk">Curd &amp; Buttermilk</option>
                    <option value="Ghee & Butter">Ghee &amp; Butter</option>
                    <option value="Fresh Paneer">Fresh Paneer</option>
                    <option value="Farm Milkshakes">Farm Milkshakes</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Product Image</label>
                  <select
                    value={productForm.image}
                    onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                    className="w-full rounded-xl border border-black/10 bg-[#fffdf8] p-2.5 outline-none"
                  >
                    <option value="/milk.png">Milk (/milk.png)</option>
                    <option value="/Curd.png">Curd (/Curd.png)</option>
                    <option value="/Ghee.png">Ghee (/Ghee.png)</option>
                    <option value="/Butter.png">Butter (/Butter.png)</option>
                    <option value="/Buttermilk.png">Buttermilk (/Buttermilk.png)</option>
                    <option value="/Paneer.png">Paneer (/Paneer.png)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Short Description</label>
                <input
                  type="text"
                  required
                  value={productForm.shortDescription}
                  onChange={(e) =>
                    setProductForm({ ...productForm, shortDescription: e.target.value })
                  }
                  placeholder="Brief tagline for product card"
                  className="w-full rounded-xl border border-black/10 bg-[#fffdf8] p-2.5 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Detailed Description</label>
                <textarea
                  rows={3}
                  value={productForm.description}
                  onChange={(e) =>
                    setProductForm({ ...productForm, description: e.target.value })
                  }
                  placeholder="Full health and nutritional story..."
                  className="w-full rounded-xl border border-black/10 bg-[#fffdf8] p-2.5 outline-none"
                />
              </div>

              {/* VARIANT CONFIG */}
              <div className="rounded-2xl border border-black/10 bg-[#f8efd9]/50 p-3 space-y-3">
                <p className="font-bold text-[#173b27]">Primary Variant Configuration</p>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-gray-600 block mb-1">Variant Name</label>
                    <input
                      type="text"
                      required
                      value={productForm.variantName}
                      onChange={(e) =>
                        setProductForm({ ...productForm, variantName: e.target.value })
                      }
                      placeholder="1 Litre"
                      className="w-full rounded-lg border border-black/10 bg-white p-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-600 block mb-1">Price (₹)</label>
                    <input
                      type="number"
                      required
                      value={productForm.price}
                      onChange={(e) =>
                        setProductForm({ ...productForm, price: Number(e.target.value) })
                      }
                      className="w-full rounded-lg border border-black/10 bg-white p-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-600 block mb-1">Stock</label>
                    <input
                      type="number"
                      required
                      value={productForm.stock}
                      onChange={(e) =>
                        setProductForm({ ...productForm, stock: Number(e.target.value) })
                      }
                      className="w-full rounded-lg border border-black/10 bg-white p-2 text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-700">
                  <input
                    type="checkbox"
                    checked={productForm.isFeatured}
                    onChange={(e) =>
                      setProductForm({ ...productForm, isFeatured: e.target.checked })
                    }
                    className="accent-[#126044]"
                  />
                  Mark as Featured Product
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-700">
                  <input
                    type="checkbox"
                    checked={productForm.isAvailable}
                    onChange={(e) =>
                      setProductForm({ ...productForm, isAvailable: e.target.checked })
                    }
                    className="accent-[#126044]"
                  />
                  Available for Sale
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-black/5">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="rounded-full px-5 py-2 font-bold text-gray-500 hover:text-black"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-[#126044] px-7 py-2.5 font-bold text-white shadow hover:bg-[#0e5039]"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
