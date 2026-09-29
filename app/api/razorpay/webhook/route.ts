import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const webhookSignature = req.headers.get("x-razorpay-signature");
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (webhookSecret && webhookSignature) {
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(rawBody)
        .digest("hex");

      if (expectedSignature !== webhookSignature) {
        return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
      }
    }

    const event = JSON.parse(rawBody);

    switch (event.event) {
      case "payment.captured":
        // Payment successfully captured by Razorpay
        console.log("Razorpay Webhook: Payment captured", event.payload.payment.entity.id);
        break;

      case "payment.failed":
        console.warn("Razorpay Webhook: Payment failed", event.payload.payment.entity.id);
        break;

      case "order.paid":
        console.log("Razorpay Webhook: Order paid", event.payload.order.entity.id);
        break;

      default:
        console.log(`Razorpay Webhook: Unhandled event ${event.event}`);
    }

    return NextResponse.json({ status: "ok" });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Razorpay webhook processing error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
