import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"

export type PaymentDetails = {
  bankName: string
  accountName: string
  accountNumber: string
  mobileMoneyNumber: string
  instructions: string
}

/** Bank / MoMo details customers see at checkout. Callers must check store access first. */
export async function savePaymentDetails(storeId: string, d: PaymentDetails) {
  try {
    await db.storePaymentSetting.upsert({
      where: { storeId },
      update: { provider: "MANUAL_TRANSFER", ...d, isActive: true },
      create: { storeId, provider: "MANUAL_TRANSFER", ...d, isActive: true },
    })
    revalidatePath(`/${storeId}/settings/payments`)
    return { success: true as const }
  } catch (error) {
    console.error("Failed to save payment settings:", error)
    return { error: "Failed to save payment settings" }
  }
}
