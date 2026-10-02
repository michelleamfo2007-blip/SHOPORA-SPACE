type SubscriptionState = {
  status: string
  currentPeriodEnd: Date | string | null
} | null | undefined

export function isSubscriptionLapsed(subscription: SubscriptionState) {
  if (!subscription) return false
  if (subscription.status === "PAST_DUE") return true
  return !!subscription.currentPeriodEnd && new Date(subscription.currentPeriodEnd) < new Date()
}

export function formatBillingDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Africa/Accra",
  })
}
