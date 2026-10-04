"use server";

import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabase/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

// Product/catalog queries — using anon key since products are public
const supabasePublic = createClient(supabaseUrl, supabaseAnonKey);

export interface DbProduct {
  id: string;
  category_id: string;
  category_name?: string;
  name: string;
  slug: string;
  short_description: string;
  description: string;
  image_url: string;
  ingredients?: string;
  shelf_life?: string;
  storage_instructions?: string;
  fat_content?: string;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  categories?: { name: string; slug: string };
  product_variants?: DbVariant[];
}

export interface DbVariant {
  id: string;
  product_id: string;
  name: string;
  price: number;
  original_price?: number;
  stock: number;
  unit: string;
  is_available: boolean;
  sku?: string;
  low_stock_threshold?: number;
}

export async function getActiveProducts(): Promise<DbProduct[]> {
  if (!supabaseUrl || !supabaseAnonKey) {
    return [];
  }

  const { data, error } = await supabasePublic
    .from("products")
    .select(`
      *,
      categories ( name, slug ),
      product_variants ( * )
    `)
    .eq("is_active", true)
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching products:", error);
    return [];
  }

  return (data as DbProduct[]) || [];
}

export async function getProductBySlug(slug: string): Promise<DbProduct | null> {
  if (!supabaseUrl || !supabaseAnonKey) return null;

  const { data, error } = await supabasePublic
    .from("products")
    .select(`
      *,
      categories ( name, slug ),
      product_variants ( * )
    `)
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error) {
    console.error("Error fetching product:", error);
    return null;
  }

  return data as DbProduct;
}

export async function getFeaturedProducts(): Promise<DbProduct[]> {
  if (!supabaseUrl || !supabaseAnonKey) return [];

  const { data, error } = await supabasePublic
    .from("products")
    .select(`
      *,
      categories ( name, slug ),
      product_variants ( * )
    `)
    .eq("is_active", true)
    .eq("is_featured", true)
    .order("created_at", { ascending: true })
    .limit(8);

  if (error) {
    console.error("Error fetching featured products:", error);
    return [];
  }

  return (data as DbProduct[]) || [];
}

export async function getActiveCategories() {
  if (!supabaseUrl || !supabaseAnonKey) return [];

  const { data, error } = await supabasePublic
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Error fetching categories:", error);
    return [];
  }

  return data || [];
}

export async function getDeliverySlots() {
  if (!supabaseUrl || !supabaseAnonKey) return [];

  const { data, error } = await supabasePublic
    .from("delivery_slots")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching delivery slots:", error);
    return [];
  }

  return data || [];
}

export async function checkServiceability(pincode: string): Promise<{
  serviceable: boolean;
  area?: string;
  deliveryCharge?: number;
  minimumOrderValue?: number;
  message: string;
}> {
  if (!supabaseUrl || !supabaseAnonKey) {
    // Fallback: all pincodes serviceable if Supabase not configured
    return {
      serviceable: true,
      area: "Your area",
      deliveryCharge: 0,
      minimumOrderValue: 149,
      message: "Delivery available",
    };
  }

  const { data, error } = await supabasePublic
    .from("serviceability_pincodes")
    .select("*")
    .eq("pincode", pincode.trim())
    .eq("is_active", true)
    .single();

  if (error || !data) {
    return {
      serviceable: false,
      message: "We don't currently deliver to this PIN code. Check back soon!",
    };
  }

  return {
    serviceable: true,
    area: data.area_name,
    deliveryCharge: data.delivery_charge,
    minimumOrderValue: data.minimum_order_value,
    message: `Delivery available in ${data.area_name}`,
  };
}

export async function validateCoupon(
  code: string,
  subtotal: number,
  userId: string
): Promise<{
  valid: boolean;
  discountAmount: number;
  message: string;
  couponId?: string;
}> {
  if (!supabaseUrl || !supabaseAnonKey) {
    return { valid: false, discountAmount: 0, message: "Service unavailable." };
  }

  const { data: coupon, error } = await supabasePublic
    .from("coupons")
    .select("*")
    .eq("code", code.trim().toUpperCase())
    .eq("is_active", true)
    .single();

  if (error || !coupon) {
    return { valid: false, discountAmount: 0, message: "Invalid coupon code." };
  }

  // Check dates
  const now = new Date();
  if (coupon.start_date && new Date(coupon.start_date) > now) {
    return { valid: false, discountAmount: 0, message: "This coupon is not active yet." };
  }
  if (coupon.valid_until && new Date(coupon.valid_until) < now) {
    return { valid: false, discountAmount: 0, message: "This coupon has expired." };
  }

  // Check minimum order value
  if (coupon.min_order_value && subtotal < coupon.min_order_value) {
    return {
      valid: false,
      discountAmount: 0,
      message: `Minimum order of ₹${coupon.min_order_value} required for this coupon.`,
    };
  }

  // Check usage limit
  if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
    return { valid: false, discountAmount: 0, message: "This coupon has reached its usage limit." };
  }

  // Check user usage (server-side, cannot bypass)
  if (userId) {
    const { count } = await supabasePublic
      .from("coupon_usages")
      .select("id", { count: "exact", head: true })
      .eq("coupon_id", coupon.id)
      .eq("user_id", userId);

    if (count && count >= (coupon.user_usage_limit || 1)) {
      return { valid: false, discountAmount: 0, message: "You have already used this coupon." };
    }
  }

  // Calculate discount
  let discountAmount = 0;
  if (coupon.discount_type === "percentage") {
    discountAmount = Math.round((subtotal * coupon.discount_value) / 100);
    if (coupon.maximum_discount) {
      discountAmount = Math.min(discountAmount, coupon.maximum_discount);
    }
  } else {
    discountAmount = coupon.discount_value;
  }

  return {
    valid: true,
    discountAmount,
    message: `₹${discountAmount} discount applied!`,
    couponId: coupon.id,
  };
}

// Admin-only: get all products including inactive
export async function adminGetAllProducts(): Promise<DbProduct[]> {
  const { data, error } = await supabaseAdmin
    .from("products")
    .select(`
      *,
      categories ( name, slug ),
      product_variants ( * )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching all products:", error);
    return [];
  }

  return (data as DbProduct[]) || [];
}

// Admin-only: get variant stock info
export async function adminGetLowStockVariants() {
  const { data, error } = await supabaseAdmin
    .from("product_variants")
    .select(`
      *,
      products ( name, image_url )
    `)
    .filter("stock", "lte", 20)
    .eq("is_available", true);

  if (error) {
    console.error("Error fetching low stock:", error);
    return [];
  }

  return data || [];
}
