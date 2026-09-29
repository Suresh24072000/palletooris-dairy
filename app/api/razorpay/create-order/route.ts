import { NextRequest, NextResponse } from "next/server";
import { razorpayClient, isRazorpayConfigured } from "@/lib/razorpay/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, receipt, notes } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid order amount" },
        { status: 400 }
      );
    }

    // Convert amount to paise (1 INR = 100 paise)
    const amountInPaise = Math.round(Number(amount) * 100);

    if (isRazorpayConfigured()) {
      const order = await razorpayClient.orders.create({
        amount: amountInPaise,
        currency: "INR",
        receipt: receipt || `receipt_${Date.now()}`,
        notes: notes || {},
      });

      return NextResponse.json({
        success: true,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID,
      });
    }

    // Fallback development mock order response
    const mockOrderId = `order_mock_${Date.now()}`;
    return NextResponse.json({
      success: true,
      orderId: mockOrderId,
      amount: amountInPaise,
      currency: "INR",
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_mock_mode",
      isMock: true,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Razorpay order creation error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create payment order" },
      { status: 500 }
    );
  }
}
