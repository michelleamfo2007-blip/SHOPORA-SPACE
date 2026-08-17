"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function savePaymentSettings(
  storeId: string,
  bankName: string,
  accountName: string,
  accountNumber: string,
  mobileMoneyNumber: string,
  instructions: string
) {
  try {
    await db.storePaymentSetting.upsert({
      where: { storeId },
      update: {
        provider: "MANUAL_TRANSFER",
        bankName,
        accountName,
        accountNumber,
        mobileMoneyNumber,
        instructions,
        isActive: true, // Auto activate
      },
      create: {
        storeId,
        provider: "MANUAL_TRANSFER",
        bankName,
        accountName,
        accountNumber,
        mobileMoneyNumber,
        instructions,
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
