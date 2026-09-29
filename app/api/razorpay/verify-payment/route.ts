import { NextRequest, NextResponse } from "next/server";
import { verifyRazorpaySignature } from "@/lib/razorpay/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id) {
      return NextResponse.json(
        { success: false, error: "Missing required payment identifiers" },
        { status: 400 }
      );
    }

    const isValid = verifyRazorpaySignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature || "",
    });

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Invalid payment signature. Payment could not be verified." },
        { status: 400 }
      );
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
    console.error("Payment verification error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Payment verification failed" },
      { status: 500 }
    );
  }
}
