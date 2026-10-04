import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const webhookSignature = req.headers.get("x-razorpay-signature");
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // Verify webhook signature
    if (process.env.NODE_ENV === "production" && !webhookSecret) {
      console.error("Razorpay webhook: RAZORPAY_WEBHOOK_SECRET is not configured in production");
      return NextResponse.json({ error: "Webhook secret is not configured" }, { status: 500 });
    }

    if (webhookSecret) {
      if (!webhookSignature) {
        console.error("Razorpay webhook: Missing signature header");
        return NextResponse.json({ error: "Missing webhook signature" }, { status: 400 });
      }

      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(rawBody)
        .digest("hex");

      if (expectedSignature !== webhookSignature) {
        console.error("Razorpay webhook: Invalid signature");
        return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
      }
    }

    const event = JSON.parse(rawBody);

    switch (event.event) {
      case "payment.captured": {
        const payment = event.payload?.payment?.entity;
        if (payment) {
          // Find the order by Razorpay order ID and update payment status
          const { data: order } = await supabaseAdmin
            .from("orders")
            .select("id, user_id, total_amount, payment_status")
            .eq("razorpay_order_id", payment.order_id)
            .single();

          if (order) {
            // Update payment record idempotently
            await supabaseAdmin.from("payments").upsert({
              order_id: order.id,
              user_id: order.user_id,
              provider: "razorpay",
              provider_order_id: payment.order_id,
              provider_payment_id: payment.id,
              amount: payment.amount / 100,
              currency: payment.currency,
              status: "captured",
              gateway: "razorpay",
              gateway_order_id: payment.order_id,
              gateway_payment_id: payment.id,
            }, { onConflict: "order_id" });

            // Confirm order only if currently pending (strictly idempotent)
            const { data: updatedOrders } = await supabaseAdmin
              .from("orders")
              .update({
                payment_status: "paid",
                order_status: "confirmed",
                razorpay_payment_id: payment.id,
                updated_at: new Date().toISOString(),
              })
              .eq("id", order.id)
              .eq("payment_status", "pending")
              .select("id");

            if (updatedOrders && updatedOrders.length > 0) {
              const { error: historyErr1 } = await supabaseAdmin.from("order_status_history").insert({
                order_id: order.id,
                status: "confirmed",
                note: `Payment captured via webhook. Payment ID: ${payment.id}`,
              });
              if (historyErr1) {
                console.warn("Order status history insert warning:", historyErr1);
              }
            }
          }
        }
        break;
      }

      case "payment.failed": {
        const payment = event.payload?.payment?.entity;
        if (payment?.order_id) {
          const { data: order } = await supabaseAdmin
            .from("orders")
            .select("id")
            .eq("razorpay_order_id", payment.order_id)
            .single();

          if (order) {
            await supabaseAdmin
              .from("orders")
              .update({
                payment_status: "failed",
                order_status: "payment_failed",
                updated_at: new Date().toISOString(),
              })
              .eq("id", order.id);

            const { error: historyErr2 } = await supabaseAdmin.from("order_status_history").insert({
              order_id: order.id,
              status: "payment_failed",
              note: `Payment failed. Error: ${payment.error_description || "Unknown error"}`,
            });
            if (historyErr2) {
              console.warn("Order status history insert warning:", historyErr2);
            }
          }
        }
        break;
      }

      case "refund.created":
      case "refund.processed": {
        const refund = event.payload?.refund?.entity;
        if (refund?.payment_id) {
          const { data: order } = await supabaseAdmin
            .from("orders")
            .select("id")
            .eq("razorpay_payment_id", refund.payment_id)
            .single();

          if (order) {
            await supabaseAdmin
              .from("orders")
              .update({
                payment_status: event.event === "refund.processed" ? "refunded" : "pending",
                order_status: event.event === "refund.processed" ? "refunded" : "refund_pending",
                updated_at: new Date().toISOString(),
              })
              .eq("id", order.id);

            const { error: historyErr3 } = await supabaseAdmin.from("order_status_history").insert({
              order_id: order.id,
              status: event.event === "refund.processed" ? "refunded" : "refund_pending",
              note: `Refund ${event.event === "refund.processed" ? "processed" : "initiated"}. Amount: ₹${(refund.amount / 100).toFixed(2)}`,
            });
            if (historyErr3) {
              console.warn("Order status history insert warning:", historyErr3);
            }
          }
        }
        break;
      }

      default:
        // Unhandled event — log but don't fail
        console.log(`Razorpay webhook: Unhandled event ${event.event}`);
    }

    return NextResponse.json({ status: "ok" });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Razorpay webhook error:", error.message);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
