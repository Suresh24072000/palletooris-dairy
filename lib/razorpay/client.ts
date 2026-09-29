import Razorpay from "razorpay";
import crypto from "crypto";

const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_placeholder";
const keySecret = process.env.RAZORPAY_KEY_SECRET || "placeholder_secret";

export const razorpayClient = new Razorpay({
  key_id: keyId,
  key_secret: keySecret,
});

export function isRazorpayConfigured(): boolean {
  return (
    !!process.env.RAZORPAY_KEY_ID &&
    process.env.RAZORPAY_KEY_ID !== "rzp_test_placeholder" &&
    !!process.env.RAZORPAY_KEY_SECRET &&
    process.env.RAZORPAY_KEY_SECRET !== "placeholder_secret"
  );
}

export function verifyRazorpaySignature({
  orderId,
  paymentId,
  signature,
}: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  if (!isRazorpayConfigured()) {
    // In mock/test environment without keys, accept test signatures
    return true;
  }

  const generatedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return generatedSignature === signature;
}
