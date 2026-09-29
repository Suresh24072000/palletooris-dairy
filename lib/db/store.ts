"use client";

import {
  Product,
  Order,
  Subscription,
  DeliveryTask,
  DeliverySlot,
  CustomerUser,
  Address,
  OrderStatus,
  DeliveryStatus,
} from "@/types/dairy";
import {
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_SUBSCRIPTIONS,
  INITIAL_DELIVERY_TASKS,
  INITIAL_DELIVERY_SLOTS,
  INITIAL_ADDRESS,
} from "@/lib/data/mockData";

const KEYS = {
  PRODUCTS: "palletoori_products",
  ORDERS: "palletoori_orders",
  SUBSCRIPTIONS: "palletoori_subscriptions",
  DELIVERIES: "palletoori_deliveries",
  DELIVERY_SLOTS: "palletoori_delivery_slots",
  USER: "palletoori_user",
  ADDRESSES: "palletoori_addresses",
};

function getItem<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event(`store_${key}_updated`));
  } catch (e) {
    console.error("Storage error:", e);
  }
}

export const DairyStore = {
  // Products
  getProducts(): Product[] {
    return getItem<Product[]>(KEYS.PRODUCTS, INITIAL_PRODUCTS);
  },

  getProductBySlug(slug: string): Product | undefined {
    const list = this.getProducts();
    return list.find((p) => p.slug === slug || p.id === slug);
  },

  saveProduct(product: Product): void {
    const list = this.getProducts();
    const idx = list.findIndex((p) => p.id === product.id);
    if (idx >= 0) {
      list[idx] = product;
    } else {
      list.push(product);
    }
    setItem(KEYS.PRODUCTS, list);
  },

  deleteProduct(productId: string): void {
    const list = this.getProducts().filter((p) => p.id !== productId);
    setItem(KEYS.PRODUCTS, list);
  },

  // Orders
  getOrders(): Order[] {
    return getItem<Order[]>(KEYS.ORDERS, INITIAL_ORDERS);
  },

  getOrderById(id: string): Order | undefined {
    return this.getOrders().find(
      (o) => o.id === id || o.orderNumber.toLowerCase() === id.toLowerCase()
    );
  },

  createOrder(order: Order): Order {
    const list = this.getOrders();
    list.unshift(order);
    setItem(KEYS.ORDERS, list);

    // Auto-create delivery task
    const deliveryTask: DeliveryTask = {
      id: `del-${Date.now()}`,
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      addressSummary: `${order.address.houseFlat}, ${order.address.street}, ${order.address.area}`,
      deliverySlot: order.deliverySlot,
      deliveryDate: order.deliveryDate,
      totalAmount: order.totalAmount,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      deliveryStatus: "assigned",
      driverName: "Pending Assignment",
      notes: order.notes || "Standard Farm Delivery",
    };
    const deliveries = this.getDeliveries();
    deliveries.unshift(deliveryTask);
    setItem(KEYS.DELIVERIES, deliveries);

    return order;
  },

  updateOrderStatus(orderId: string, status: OrderStatus): void {
    const list = this.getOrders();
    const item = list.find((o) => o.id === orderId);
    if (item) {
      item.orderStatus = status;
      item.updatedAt = new Date().toISOString();
      setItem(KEYS.ORDERS, list);

      // Also sync delivery task status
      const deliveries = this.getDeliveries();
      const task = deliveries.find((d) => d.orderId === orderId);
      if (task) {
        if (status === "out_for_delivery") task.deliveryStatus = "out_for_delivery";
        if (status === "delivered") task.deliveryStatus = "delivered";
        if (status === "cancelled") task.deliveryStatus = "failed";
        setItem(KEYS.DELIVERIES, deliveries);
      }
    }
  },

  // Subscriptions
  getSubscriptions(): Subscription[] {
    return getItem<Subscription[]>(KEYS.SUBSCRIPTIONS, INITIAL_SUBSCRIPTIONS);
  },

  createSubscription(sub: Subscription): Subscription {
    const list = this.getSubscriptions();
    list.unshift(sub);
    setItem(KEYS.SUBSCRIPTIONS, list);
    return sub;
  },

  updateSubscriptionStatus(id: string, status: "active" | "paused" | "cancelled"): void {
    const list = this.getSubscriptions();
    const item = list.find((s) => s.id === id);
    if (item) {
      item.status = status;
      setItem(KEYS.SUBSCRIPTIONS, list);
    }
  },

  updateSubscriptionQuantity(id: string, quantity: number): void {
    const list = this.getSubscriptions();
    const item = list.find((s) => s.id === id);
    if (item && quantity > 0) {
      item.quantity = quantity;
      setItem(KEYS.SUBSCRIPTIONS, list);
    }
  },

  // Deliveries
  getDeliveries(): DeliveryTask[] {
    return getItem<DeliveryTask[]>(KEYS.DELIVERIES, INITIAL_DELIVERY_TASKS);
  },

  updateDeliveryStatus(id: string, status: DeliveryStatus, driverName?: string): void {
    const list = this.getDeliveries();
    const item = list.find((d) => d.id === id);
    if (item) {
      item.deliveryStatus = status;
      if (driverName) item.driverName = driverName;
      setItem(KEYS.DELIVERIES, list);

      // Sync corresponding order status
      if (item.orderId) {
        if (status === "out_for_delivery") this.updateOrderStatus(item.orderId, "out_for_delivery");
        if (status === "delivered") this.updateOrderStatus(item.orderId, "delivered");
      }
    }
  },

  // Delivery Slots
  getDeliverySlots(): DeliverySlot[] {
    return getItem<DeliverySlot[]>(KEYS.DELIVERY_SLOTS, INITIAL_DELIVERY_SLOTS);
  },

  saveDeliverySlots(slots: DeliverySlot[]): void {
    setItem(KEYS.DELIVERY_SLOTS, slots);
  },

  // User & Addresses
  getUser(): CustomerUser {
    return getItem<CustomerUser>(KEYS.USER, {
      id: "usr-suresh",
      phone: "9876543210",
      fullName: "Suresh Reddy",
      email: "suresh@example.com",
      addresses: [INITIAL_ADDRESS],
      role: "customer",
      createdAt: "2026-01-15T00:00:00Z",
    });
  },

  saveUser(user: CustomerUser): void {
    setItem(KEYS.USER, user);
  },

  addAddress(address: Address): void {
    const user = this.getUser();
    if (address.isDefault) {
      user.addresses.forEach((a) => (a.isDefault = false));
    }
    user.addresses.push(address);
    this.saveUser(user);
  },

  deleteAddress(addressId: string): void {
    const user = this.getUser();
    user.addresses = user.addresses.filter((a) => a.id !== addressId);
    this.saveUser(user);
  },
};
