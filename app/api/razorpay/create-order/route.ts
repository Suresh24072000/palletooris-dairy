import { NextRequest, NextResponse } from "next/server";
import { razorpayClient, isRazorpayConfigured } from "@/lib/razorpay/client";
import { createClient } from "@supabase/supabase-js";
import { INITIAL_PRODUCTS } from "@/lib/data/mockData";

interface CartItemInput {
  productId: string;
  variantId: string;
  quantity: number;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      amount: clientAmount,
      currency = "INR",
      items,
      couponCode,
      receipt: clientReceipt,
      notes = {},
    } = body;

    // Optional Supabase session validation if token provided
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

    if (supabaseUrl && supabaseAnonKey) {
      const authHeader = req.headers.get("authorization");
      const accessToken = authHeader?.replace("Bearer ", "");

      if (accessToken) {
        const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
        const {
          data: { user },
          error: authError,
        } = await supabaseClient.auth.getUser(accessToken);

        if (authError || !user) {
          return NextResponse.json(
            { success: false, error: "Invalid or expired user session" },
            { status: 401 }
          );
        }
      }
    }

    // SERVER-SIDE PRICING VALIDATION (Never trust client prices)
    let validatedTotal = 0;

    if (Array.isArray(items) && items.length > 0) {
      let subtotal = 0;

      for (const item of items as CartItemInput[]) {
        const product = INITIAL_PRODUCTS.find((p) => p.id === item.productId);
        const variant = product?.variants.find((v) => v.id === item.variantId);

        if (!product || !variant) {
          return NextResponse.json(
            {
              success: false,
              error: `Invalid product or variant detected: ${item.productId}`,
            },
            { status: 400 }
          );
        }

        const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1));
        subtotal += variant.price * quantity;
      }

      // Delivery rule: Free delivery for orders >= ₹500, else ₹40
      const deliveryFee = subtotal >= 500 ? 0 : 40;

      // Coupon discount verification
      let discount = 0;
      if (couponCode === "PALLETOORI50" && subtotal >= 200) {
        discount = 50;
      }

      validatedTotal = Math.max(1, subtotal + deliveryFee - discount);
    } else if (clientAmount && Number(clientAmount) > 0) {
      // Fallback if raw amount passed without itemized cart
      validatedTotal = Number(clientAmount);
    } else {
      return NextResponse.json(
        { success: false, error: "Cart is empty or order amount is invalid" },
        { status: 400 }
      );
    }

    // Convert amount to paise (1 INR = 100 paise)
    const amountInPaise = Math.round(validatedTotal * 100);

    // REAL RAZORPAY ORDER CREATION
    if (!isRazorpayConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Razorpay payment gateway is not configured. Please set NEXT_PUBLIC_RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in environment variables, or select Cash on Delivery.",
        },
        { status: 503 }
      );
    }

    const receipt = clientReceipt || `rcpt_${Date.now()}`;
    const order = await razorpayClient.orders.create({
      amount: amountInPaise,
      currency,
      receipt,
      notes: {
        ...notes,
        calculated_total: validatedTotal.toString(),
      },
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Razorpay order creation error:", err.message);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create payment order. Please try again or use Cash on Delivery.",
      },
      { status: 500 }
    );
  }
}
