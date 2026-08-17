"use server";

import { db } from "@/lib/db";
import { encrypt } from "@/lib/encryption";
import { revalidatePath } from "next/cache";

export async function savePaymentSettings(
  storeId: string,
  provider: "PAYSTACK" | "STRIPE",
  publicKey: string,
  secretKey: string
) {
  try {
    const encryptedSecret = encrypt(secretKey);

    await db.storePaymentSetting.upsert({
      where: { storeId },
      update: {
        provider,
        publicKey,
        secretKey: encryptedSecret,
        isActive: true, // Auto activate for now
      },
      create: {
        storeId,
        provider,
        publicKey,
        secretKey: encryptedSecret,
        isActive: true,
      },
    });

    revalidatePath(`/${storeId}/settings/payments`);
    return { success: true };
  } catch (error) {
    console.error("Failed to save payment settings:", error);
    return { error: "Failed to save payment settings" };
  }
}
