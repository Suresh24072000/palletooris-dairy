import { NextRequest, NextResponse } from "next/server";
import { verifyRazorpaySignature, isRazorpayConfigured } from "@/lib/razorpay/client";
import { supabaseAdmin } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId, // Our internal order ID
      userId,
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id) {
      return NextResponse.json(
        { success: false, error: "Missing required payment identifiers" },
        { status: 400 }
      );
    }

    // Verify user session
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

    if (supabaseUrl && supabaseAnonKey) {
      const authHeader = req.headers.get("authorization");
      const accessToken = authHeader?.replace("Bearer ", "");

      if (accessToken) {
        const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
        const { data: { user }, error: authError } = await supabaseClient.auth.getUser(accessToken);

        if (authError || !user || (userId && user.id !== userId)) {
          return NextResponse.json(
            { success: false, error: "Authentication failed" },
            { status: 401 }
          );
        }
      }
    }

    // Verify Razorpay signature (server-side HMAC verification)
    if (isRazorpayConfigured()) {
      const isValid = verifyRazorpaySignature({
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        signature: razorpay_signature || "",
      });

      if (!isValid) {
        // Store failed payment record
        if (orderId) {
          await supabaseAdmin
            .from("orders")
            .update({
              payment_status: "failed",
              order_status: "payment_failed",
              updated_at: new Date().toISOString(),
            })
            .eq("id", orderId);
        }

        return NextResponse.json(
          {
            success: false,
            error: "Payment signature verification failed. Please contact support if money was deducted.",
          },
          { status: 400 }
        );
      }
    }

    // Save payment record
    if (supabaseUrl && process.env.SUPABASE_SERVICE_ROLE_KEY && orderId) {
      const { error: paymentError } = await supabaseAdmin.from("payments").insert({
        order_id: orderId,
        user_id: userId || null,
        provider: "razorpay",
        provider_order_id: razorpay_order_id,
        provider_payment_id: razorpay_payment_id,
        provider_signature: razorpay_signature || "",
        amount: 0, // Will be updated from order
        currency: "INR",
        status: "captured",
        gateway: "razorpay",
        gateway_order_id: razorpay_order_id,
        gateway_payment_id: razorpay_payment_id,
        gateway_signature: razorpay_signature,
      });

      if (paymentError) {
        console.error("Payment record insert error:", paymentError);
      }

      // Update order status
      if (orderId && userId) {
        const { error: orderUpdateError } = await supabaseAdmin
          .from("orders")
          .update({
            payment_status: "paid",
            order_status: "confirmed",
            razorpay_payment_id: razorpay_payment_id,
            razorpay_order_id: razorpay_order_id,
            updated_at: new Date().toISOString(),
          })
          .eq("id", orderId)
          .eq("user_id", userId);

        if (orderUpdateError) {
          console.error("Order update error:", orderUpdateError);
        }

        // Status history
        const { error: historyError } = await supabaseAdmin.from("order_status_history").insert({
          order_id: orderId,
          status: "confirmed",
          note: `Payment verified. Razorpay Payment ID: ${razorpay_payment_id}`,
          changed_by: userId,
        });

        if (historyError) {
          console.warn("Order status history insert warning:", historyError);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Payment successfully verified",
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      verifiedAt: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Payment verification error:", err.message);
    return NextResponse.json(
      { success: false, error: "Payment verification failed. Please contact support." },
      { status: 500 }
    );
  }
}
