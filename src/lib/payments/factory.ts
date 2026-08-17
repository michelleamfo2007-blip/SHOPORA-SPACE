import { PaystackProvider } from "./providers/paystack";
import { PaymentProviderStrategy } from "./types";
import { db } from "../db";
import { decrypt } from "../encryption";

// getPaymentProvider removed as we use manual P2P payments
export function getPlatformProvider(): PaymentProviderStrategy {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  
  if (!secretKey) {
    throw new Error("Platform Paystack secret key is not configured in environment variables.");
  }
  
  // We use Paystack for the platform by default
  return new PaystackProvider(secretKey);
}
