import { db } from "@/lib/db"

/** Lock-screen notifications to the Shopora mobile app via the Expo Push Service. Never throws. */

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send"

export type PushMessage = {
  title: string
  body: string
  /** Opened by the app when the notification is tapped, e.g. { screen: "order", orderId } */
  data?: Record<string, string>
}

type ExpoTicket = { status: "ok" | "error"; details?: { error?: string } }

async function sendToTokens(tokens: string[], message: PushMessage) {
  const unique = [...new Set(tokens)].filter((t) => t.startsWith("ExponentPushToken[") || t.startsWith("ExpoPushToken["))
  if (unique.length === 0) return

  for (let i = 0; i < unique.length; i += 100) {
    const batch = unique.slice(i, i + 100)
    try {
      const res = await fetch(EXPO_PUSH_URL, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(
          batch.map((to) => ({
            to,
            title: message.title,
            body: message.body,
            data: message.data ?? {},
            sound: "default",
            priority: "high",
            channelId: "default",
          }))
        ),
      })
      const json = (await res.json().catch(() => null)) as { data?: ExpoTicket[] } | null
      const dead = (json?.data ?? [])
        .map((ticket, idx) => (ticket.details?.error === "DeviceNotRegistered" ? batch[idx] : null))
        .filter((t): t is string => !!t)
      if (dead.length) await db.pushToken.deleteMany({ where: { token: { in: dead } } })
    } catch (err) {
      console.error("Expo push send failed:", err)
    }
  }
}

export async function pushToStoreMembers(storeId: string, message: PushMessage) {
  try {
    const tokens = await db.pushToken.findMany({
      where: { user: { storeMembers: { some: { storeId } } } },
      select: { token: true },
    })
    await sendToTokens(
      tokens.map((t) => t.token),
      message
    )
  } catch (err) {
    console.error("pushToStoreMembers", err)
  }
}

export async function pushToOnlineRiders(message: PushMessage) {
  try {
    const tokens = await db.pushToken.findMany({
      where: { rider: { status: "ACTIVE", isOnline: true } },
      select: { token: true },
    })
    await sendToTokens(
      tokens.map((t) => t.token),
      message
    )
  } catch (err) {
    console.error("pushToOnlineRiders", err)
  }
}

export async function pushToRider(riderId: string, message: PushMessage) {
  try {
    const tokens = await db.pushToken.findMany({ where: { riderId }, select: { token: true } })
    await sendToTokens(
      tokens.map((t) => t.token),
      message
    )
  } catch (err) {
    console.error("pushToRider", err)
  }
}
