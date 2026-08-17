import { PaystackProvider } from "./providers/paystack";
import { PaymentProviderStrategy } from "./types";
import { db } from "../db";
import { decrypt } from "../encryption";

export async function getPaymentProvider(
  storeId: string
): Promise<PaymentProviderStrategy | null> {
  const setting = await db.storePaymentSetting.findUnique({
    where: { storeId },
  });

  if (!setting || !setting.isActive || !setting.secretKey) {
    return null;
  }

  const secretKey = decrypt(setting.secretKey);

  switch (setting.provider) {
    case "PAYSTACK":
      return new PaystackProvider(secretKey);
    // case "STRIPE":
    //   return new StripeProvider(secretKey);
    default:
      throw new Error(`Unsupported payment provider: ${setting.provider}`);
  }
}

export function getPlatformProvider(): PaymentProviderStrategy {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  
  if (!secretKey) {
    throw new Error("Platform Paystack secret key is not configured in environment variables.");
  }
  
  // We use Paystack for the platform by default
  return new PaystackProvider(secretKey);
}
