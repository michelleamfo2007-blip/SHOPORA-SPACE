"use server"

import { requestAccountDeletion } from "@/lib/account-deletion"

export async function requestAccountDeletionAction(input: {
  accountType: string
  email: string
  name: string
  reason: string
}) {
  const accountType = input.accountType === "rider" ? "rider" : input.accountType === "customer" ? "customer" : "seller"
  return requestAccountDeletion({ accountType, email: input.email, name: input.name, reason: input.reason, source: "website" })
}
