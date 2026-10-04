"use server";

import { supabaseAdmin } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { validateCoupon } from "./products";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";
const supabasePublic = createClient(supabaseUrl, supabaseAnonKey);

export interface CreateOrderPayload {
  userId: string;
  addressId?: string;
  addressJson: {
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
  };
  deliverySlot: string;
  deliveryDate: string;
  items: {
    productId: string;
    variantId: string;
    quantity: number;
  }[];
  couponCode?: string;
  couponId?: string;
  paymentMethod: "online" | "cod";
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  notes?: string;
}

export interface CreateOrderResult {
  success: boolean;
  orderId?: string;
  orderNumber?: string;
  error?: string;
}

/**
 * SERVER-SIDE order creation.
 * Validates all prices and inventory from the database.
 * Never trusts prices from the client.
 */
export async function createOrder(
  payload: CreateOrderPayload
): Promise<CreateOrderResult> {
  try {
    if (!payload.userId) {
      return { success: false, error: "Authentication required." };
    }

    if (!payload.items || payload.items.length === 0) {
      return { success: false, error: "Order must contain at least one item." };
    }

    // 1. Validate all products/variants and get SERVER-SIDE prices
    const validatedItems: {
      productId: string;
      variantId: string;
      productName: string;
      variantName: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
      imageUrl: string;
    }[] = [];

    let serverSubtotal = 0;

    for (const item of payload.items) {
      if (item.quantity <= 0) {
        return { success: false, error: "Invalid item quantity." };
      }

      const { data: variant, error: variantError } = await supabasePublic
        .from("product_variants")
        .select(`
          id, name, price, stock, is_available,
          products ( id, name, image_url, is_active )
        `)
        .eq("id", item.variantId)
        .single();

      if (variantError || !variant) {
        return { success: false, error: `Product variant not found.` };
      }

      type VariantWithProduct = {
        id: string;
        name: string;
        price: number;
        stock: number;
        is_available: boolean;
        products: {
          id: string;
          name: string;
          image_url: string;
          is_active: boolean;
        } | null;
      };
      const v = variant as unknown as VariantWithProduct;
      const product = v.products;
      if (!product || !product.is_active) {
        return { success: false, error: `Product "${product?.name || 'Unknown'}" is no longer available.` };
      }

      if (!variant.is_available) {
        return { success: false, error: `"${variant.name}" of "${product.name}" is not available.` };
      }

      if (variant.stock < item.quantity) {
        return {
          success: false,
          error: `Insufficient stock for "${product.name} - ${variant.name}". Only ${variant.stock} units available.`,
        };
      }

      const unitPrice = Number(variant.price);
      const totalPrice = unitPrice * item.quantity;
      serverSubtotal += totalPrice;

      validatedItems.push({
        productId: product.id,
        variantId: variant.id,
        productName: product.name,
        variantName: variant.name,
        quantity: item.quantity,
        unitPrice,
        totalPrice,
        imageUrl: product.image_url,
      });
    }

    // 2. Validate coupon server-side
    let discountAmount = 0;
    let appliedCouponId: string | undefined;

    if (payload.couponCode) {
      const couponResult = await validateCoupon(
        payload.couponCode,
        serverSubtotal,
        payload.userId
      );

      if (!couponResult.valid) {
        return { success: false, error: `Coupon error: ${couponResult.message}` };
      }

      discountAmount = couponResult.discountAmount;
      appliedCouponId = couponResult.couponId;
    }

    // 3. Calculate delivery fee
    const deliveryFee = serverSubtotal >= 199 ? 0 : 25;

    // 4. Calculate total
    const totalAmount = Math.max(0, serverSubtotal + deliveryFee - discountAmount);

    // 5. Generate order number
    const orderNumber = `PDF-${Date.now().toString(36).toUpperCase().slice(-6)}${Math.floor(100 + Math.random() * 900)}`;

    // 6. Create the order in Supabase
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        order_number: orderNumber,
        user_id: payload.userId,
        customer_name: payload.addressJson.fullName,
        customer_phone: payload.addressJson.phone,
        address_id: payload.addressId || null,
        address_json: payload.addressJson,
        delivery_slot: payload.deliverySlot,
        delivery_date: payload.deliveryDate,
        subtotal: serverSubtotal,
        delivery_fee: deliveryFee,
        discount: discountAmount,
        coupon_code: payload.couponCode || null,
        total_amount: totalAmount,
        payment_method: payload.paymentMethod,
        payment_status: payload.paymentMethod === "cod" ? "pending" : "pending",
        order_status: "pending",
        razorpay_order_id: payload.razorpayOrderId || null,
        notes: payload.notes || null,
      })
      .select("id, order_number")
      .single();

    if (orderError || !order) {
      console.error("Order creation error:", orderError);
      return { success: false, error: "Failed to create order. Please try again." };
    }

    // 7. Create order items
    const orderItems = validatedItems.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      variant_id: item.variantId,
      name: item.productName,
      variant_name: item.variantName,
      price: item.unitPrice,
      quantity: item.quantity,
      total: item.totalPrice,
      image_url: item.imageUrl,
    }));

    const { error: itemsError } = await supabaseAdmin
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error("Order items error:", itemsError);
      // Rollback: delete the order
      await supabaseAdmin.from("orders").delete().eq("id", order.id);
      return { success: false, error: "Failed to save order items. Please try again." };
    }

    // 8. Create status history entry
    await supabaseAdmin.from("order_status_history").insert({
      order_id: order.id,
      status: "pending",
      note: "Order created",
      changed_by: payload.userId,
    });

    // 9. Decrement stock for each variant
    for (const item of validatedItems) {
      const { error: rpcError } = await supabaseAdmin.rpc("decrement_stock", {
        p_variant_id: item.variantId,
        p_quantity: item.quantity,
      });

      if (rpcError) {
        // If RPC fails or doesn't exist, do fallback update
        const { data: variantData } = await supabaseAdmin
          .from("product_variants")
          .select("stock")
          .eq("id", item.variantId)
          .single();

        if (variantData) {
          const newStock = Math.max(0, (variantData.stock || 0) - item.quantity);
          await supabaseAdmin
            .from("product_variants")
            .update({ stock: newStock })
            .eq("id", item.variantId);
        }
      }
    }

    // 10. Track coupon usage
    if (appliedCouponId && payload.userId) {
      const { error: couponUsageErr } = await supabaseAdmin.from("coupon_usages").insert({
        coupon_id: appliedCouponId,
        user_id: payload.userId,
        order_id: order.id,
        discount_applied: discountAmount,
      });

      if (couponUsageErr) {
        console.warn("Coupon usage tracking error:", couponUsageErr);
      }

      // Increment coupon usage count
      const { data: couponData } = await supabaseAdmin
        .from("coupons")
        .select("usage_count")
        .eq("id", appliedCouponId)
        .single();

      if (couponData) {
        const { error: couponUpdateErr } = await supabaseAdmin
          .from("coupons")
          .update({ usage_count: (couponData.usage_count || 0) + 1 })
          .eq("id", appliedCouponId);

        if (couponUpdateErr) {
          console.warn("Coupon usage increment error:", couponUpdateErr);
        }
      }
    }

    return {
      success: true,
      orderId: order.id,
      orderNumber: order.order_number,
    };
  } catch (err) {
    console.error("createOrder unexpected error:", err);
    return { success: false, error: "An unexpected error occurred. Please try again." };
  }
}

/**
 * Confirm payment after Razorpay verification.
 * Only called server-side after signature verification.
 */
export async function confirmOrderPayment(
  orderId: string,
  razorpayPaymentId: string,
  razorpayOrderId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Update order to paid/confirmed status
    const { error } = await supabaseAdmin
      .from("orders")
      .update({
        payment_status: "paid",
        order_status: "confirmed",
        razorpay_payment_id: razorpayPaymentId,
        razorpay_order_id: razorpayOrderId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .eq("user_id", userId); // Security: ensure order belongs to user

    if (error) {
      console.error("Failed to confirm payment:", error);
      return { success: false, error: "Failed to confirm payment." };
    }

    // Create status history
    await supabaseAdmin.from("order_status_history").insert({
      order_id: orderId,
      status: "confirmed",
      note: `Payment confirmed. Razorpay Payment ID: ${razorpayPaymentId}`,
      changed_by: userId,
    });

    return { success: true };
  } catch (err) {
    console.error("confirmOrderPayment error:", err);
    return { success: false, error: "Payment confirmation failed." };
  }
}

/**
 * Get orders for the authenticated user.
 */
export async function getUserOrders(userId: string) {
  if (!userId) return [];

  const { data, error } = await supabaseAdmin
    .from("orders")
    .select(`
      *,
      order_items (
        id, name, variant_name, price, quantity, total, image_url,
        product_id, variant_id
      ),
      order_status_history (
        status, note, created_at
      )
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching user orders:", error);
    return [];
  }

  return data || [];
}

/**
 * Get a single order for the authenticated user.
 */
export async function getUserOrder(orderId: string, userId: string) {
  if (!userId || !orderId) return null;

  const { data, error } = await supabaseAdmin
    .from("orders")
    .select(`
      *,
      order_items (
        id, name, variant_name, price, quantity, total, image_url,
        product_id, variant_id
      ),
      order_status_history (
        status, note, created_at, changed_by
      )
    `)
    .eq("id", orderId)
    .eq("user_id", userId) // Security: user can only see their own orders
    .single();

  if (error) {
    console.error("Error fetching order:", error);
    return null;
  }

  return data;
}

/**
 * Cancel an order (customer can only cancel pending/confirmed orders).
 */
export async function cancelOrder(
  orderId: string,
  userId: string,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  // Get the order first to check status
  const { data: order } = await supabaseAdmin
    .from("orders")
    .select("order_status, payment_status, user_id")
    .eq("id", orderId)
    .single();

  if (!order || order.user_id !== userId) {
    return { success: false, error: "Order not found." };
  }

  const cancellableStatuses = ["pending", "confirmed"];
  if (!cancellableStatuses.includes(order.order_status)) {
    return {
      success: false,
      error: `Cannot cancel an order that is already ${order.order_status.replace("_", " ")}.`,
    };
  }

  const { error } = await supabaseAdmin
    .from("orders")
    .update({
      order_status: "cancelled",
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId)
    .eq("user_id", userId);

  if (error) {
    return { success: false, error: "Failed to cancel order." };
  }

  await supabaseAdmin.from("order_status_history").insert({
    order_id: orderId,
    status: "cancelled",
    note: reason || "Cancelled by customer",
    changed_by: userId,
  });

  return { success: true };
}

/**
 * Admin: Get all orders with filters.
 */
export async function adminGetOrders(filters?: {
  status?: string;
  paymentStatus?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}) {
  const page = filters?.page || 1;
  const pageSize = filters?.pageSize || 25;
  const offset = (page - 1) * pageSize;

  let query = supabaseAdmin
    .from("orders")
    .select(`
      *,
      order_items ( id, name, variant_name, price, quantity, total, image_url ),
      profiles ( full_name, phone, email )
    `, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (filters?.status) {
    query = query.eq("order_status", filters.status);
  }
  if (filters?.paymentStatus) {
    query = query.eq("payment_status", filters.paymentStatus);
  }
  if (filters?.dateFrom) {
    query = query.gte("created_at", filters.dateFrom);
  }
  if (filters?.dateTo) {
    query = query.lte("created_at", filters.dateTo);
  }
  if (filters?.search) {
    query = query.or(
      `order_number.ilike.%${filters.search}%,customer_name.ilike.%${filters.search}%,customer_phone.ilike.%${filters.search}%`
    );
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("Admin get orders error:", error);
    return { orders: [], total: 0 };
  }

  return { orders: data || [], total: count || 0 };
}

/**
 * Admin: Update order status.
 */
export async function adminUpdateOrderStatus(
  orderId: string,
  newStatus: string,
  adminUserId: string,
  note?: string
): Promise<{ success: boolean; error?: string }> {
  const validStatuses = [
    "pending", "confirmed", "packing", "ready_for_dispatch",
    "out_for_delivery", "delivered", "cancelled", "payment_failed",
    "delivery_failed", "refund_pending", "refunded"
  ];

  if (!validStatuses.includes(newStatus)) {
    return { success: false, error: "Invalid order status." };
  }

  const { error } = await supabaseAdmin
    .from("orders")
    .update({
      order_status: newStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (error) {
    return { success: false, error: "Failed to update order status." };
  }

  await supabaseAdmin.from("order_status_history").insert({
    order_id: orderId,
    status: newStatus,
    note: note || `Status updated to ${newStatus}`,
    changed_by: adminUserId,
  });

  return { success: true };
}

/**
 * Admin: Dashboard statistics from real database.
 */
export async function adminGetDashboardStats(dateFilter?: {
  from: string;
  to: string;
}) {
  const now = new Date();
  const todayStart = dateFilter?.from || new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const todayEnd = dateFilter?.to || new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString();

  const [
    ordersResult,
    revenueResult,
    subscriptionsResult,
    customersResult,
    lowStockResult,
  ] = await Promise.all([
    // Orders by status for today
    supabaseAdmin
      .from("orders")
      .select("order_status, total_amount, payment_status")
      .gte("created_at", todayStart)
      .lte("created_at", todayEnd),

    // Total revenue (paid orders)
    supabaseAdmin
      .from("orders")
      .select("total_amount")
      .eq("payment_status", "paid")
      .gte("created_at", todayStart)
      .lte("created_at", todayEnd),

    // Active subscriptions
    supabaseAdmin
      .from("subscriptions")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),

    // New customers today
    supabaseAdmin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "customer")
      .gte("created_at", todayStart)
      .lte("created_at", todayEnd),

    // Low stock variants
    supabaseAdmin
      .from("product_variants")
      .select("id, name, stock, low_stock_threshold, products(name)", { count: "exact" })
      .lte("stock", 20)
      .eq("is_available", true),
  ]);

  const orders = ordersResult.data || [];
  const todayRevenue = (revenueResult.data || []).reduce(
    (sum: number, o: { total_amount: number }) => sum + Number(o.total_amount),
    0
  );

  return {
    todayRevenue,
    todayOrders: orders.length,
    pendingOrders: orders.filter((o: { order_status: string }) =>
      ["pending", "confirmed"].includes(o.order_status)
    ).length,
    packingOrders: orders.filter((o: { order_status: string }) =>
      ["packing", "ready_for_dispatch"].includes(o.order_status)
    ).length,
    outForDelivery: orders.filter((o: { order_status: string }) => o.order_status === "out_for_delivery").length,
    delivered: orders.filter((o: { order_status: string }) => o.order_status === "delivered").length,
    activeSubscriptions: subscriptionsResult.count || 0,
    newCustomers: customersResult.count || 0,
    lowStockProducts: lowStockResult.data || [],
    lowStockCount: (lowStockResult.data || []).length,
  };
}
