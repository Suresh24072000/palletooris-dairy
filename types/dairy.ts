export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string; // e.g. "500 ml", "1 L", "250 g", "500 g", "1 kg"
  price: number;
  originalPrice?: number;
  stock: number;
  isAvailable: boolean;
  unit: string; // e.g. "ml", "L", "g", "kg"
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  shortDescription: string;
  image: string;
  ingredients?: string;
  shelfLife?: string;
  storageInstructions?: string;
  fatContent?: string;
  isFeatured?: boolean;
  isAvailable: boolean;
  variants: ProductVariant[];
}

export interface CartItem {
  id: string; // unique item key: `${productId}-${variantId}`
  productId: string;
  variantId: string;
  name: string;
  variantName: string;
  price: number;
  image: string;
  quantity: number;
  unit: string;
}

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  houseFlat: string;
  street: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  instructions?: string;
  isDefault?: boolean;
}

export interface DeliverySlot {
  id: string;
  title: string;
  timeRange: string;
  cutoffTime: string;
  isActive: boolean;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "packed"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type PaymentMethod = "online" | "cod";

export interface OrderItem {
  productId: string;
  variantId: string;
  name: string;
  variantName: string;
  price: number;
  quantity: number;
  total: number;
  image: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  address: Address;
  deliverySlot: string;
  deliveryDate: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  couponCode?: string;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export type SubscriptionFrequency = "daily" | "alternate" | "weekly";
export type SubscriptionStatus = "active" | "paused" | "cancelled";

export interface Subscription {
  id: string;
  subscriptionNumber: string;
  userId: string;
  customerName: string;
  customerPhone: string;
  productId: string;
  productName: string;
  variantId: string;
  variantName: string;
  price: number;
  quantity: number;
  frequency: SubscriptionFrequency;
  deliveryDays: string[]; // e.g. ["Mon", "Wed", "Fri"] or ["Everyday"]
  deliverySlot: string;
  address: Address;
  status: SubscriptionStatus;
  startDate: string;
  nextDeliveryDate: string;
  paymentMethod: string;
  createdAt: string;
}

export type DeliveryStatus =
  | "assigned"
  | "picked_up"
  | "out_for_delivery"
  | "delivered"
  | "failed";

export interface DeliveryTask {
  id: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  addressSummary: string;
  deliverySlot: string;
  deliveryDate: string;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  deliveryStatus: DeliveryStatus;
  driverName?: string;
  driverPhone?: string;
  notes?: string;
}

export interface InventoryItem {
  id: string;
  productId: string;
  productName: string;
  variantId: string;
  variantName: string;
  currentStock: number;
  lowStockThreshold: number;
  unitsSold: number;
  lastUpdated: string;
}

export interface CustomerUser {
  id: string;
  phone: string;
  fullName: string;
  email?: string;
  addresses: Address[];
  role: "customer" | "admin" | "delivery";
  createdAt: string;
}
