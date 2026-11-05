"use server";

import { getStoreManagerAccess } from "@/lib/store-access";
import { savePaymentDetails } from "@/lib/payment-settings";

export async function savePaymentSettings(
  storeId: string,
  bankName: string,
  accountName: string,
  accountNumber: string,
  mobileMoneyNumber: string,
  instructions: string
) {
  const access = await getStoreManagerAccess(storeId);
  if ("error" in access) return { error: access.error };

  return savePaymentDetails(storeId, { bankName, accountName, accountNumber, mobileMoneyNumber, instructions });
}
