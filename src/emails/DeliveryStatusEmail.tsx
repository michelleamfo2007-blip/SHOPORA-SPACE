import { Body, Button, Container, Head, Heading, Hr, Html, Preview, Text } from "@react-email/components"
import * as React from "react"

export type DeliveryStatusKind =
  | "RIDER_ACCEPTED"
  | "PICKED_UP"
  | "DELIVERED"
  | "FAILED"
  | "VENDOR_ASSIGNED"
  | "VENDOR_PICKED_UP"
  | "VENDOR_DELIVERED"
  | "VENDOR_FAILED"

export function DeliveryStatusEmail({
  kind,
  recipientName,
  storeName,
  orderNumber,
  riderName,
  trackingUrl,
  note,
}: {
  kind: DeliveryStatusKind
  recipientName: string
  storeName: string
  orderNumber: string
  riderName?: string
  trackingUrl?: string | null
  note?: string
}) {
  const copy: Record<DeliveryStatusKind, { preview: string; heading: string; body: string }> = {
    RIDER_ACCEPTED: {
      preview: `A rider accepted ${orderNumber}`,
      heading: "A rider is on the way to the store",
      body: `A Shopora rider${riderName ? ` (${riderName})` : ""} has accepted your order ${orderNumber} from ${storeName} and is heading to pick it up.`,
    },
    PICKED_UP: {
      preview: `${orderNumber} has been picked up`,
      heading: "Your order is on the way",
      body: `Order ${orderNumber} has left ${storeName}. Have your delivery fee ready, and share your 6-digit code only when the rider arrives.`,
    },
    DELIVERED: {
      preview: `${orderNumber} delivered`,
      heading: "Delivered",
      body: `Order ${orderNumber} from ${storeName} has been delivered. Thank you for shopping with Shopora Delivery.`,
    },
    FAILED: {
      preview: `Delivery issue with ${orderNumber}`,
      heading: "Delivery could not be completed",
      body: `We could not complete delivery for order ${orderNumber} from ${storeName}. The store and Shopora have been notified.`,
    },
    VENDOR_ASSIGNED: {
      preview: `Rider assigned for ${orderNumber}`,
      heading: "Rider assigned",
      body: `A Shopora rider${riderName ? ` (${riderName})` : ""} accepted order ${orderNumber} and is coming to pick up.`,
    },
    VENDOR_PICKED_UP: {
      preview: `${orderNumber} picked up`,
      heading: "Order picked up",
      body: `Order ${orderNumber} was picked up by the Shopora rider and is heading to the customer.`,
    },
    VENDOR_DELIVERED: {
      preview: `${orderNumber} delivered`,
      heading: "Delivery completed",
      body: `Order ${orderNumber} was delivered successfully.`,
    },
    VENDOR_FAILED: {
      preview: `Delivery failed · ${orderNumber}`,
      heading: "Delivery failed",
      body: `The rider could not complete order ${orderNumber}. Shopora can reopen it for another rider from the admin board.`,
    },
  }
  const c = copy[kind]

  return (
    <Html>
      <Head />
      <Preview>{c.preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={eyebrow}>{storeName}</Text>
          <Heading style={h1}>{c.heading}</Heading>
          <Text style={text}>
            Hi {recipientName}, {c.body}
          </Text>
          {note && <Text style={muted}>{note}</Text>}
          {trackingUrl && (
            <Button href={trackingUrl} style={button}>
              Track delivery
            </Button>
          )}
          <Hr style={hr} />
          <Text style={footer}>Shopora Delivery · Accra</Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: "#f3efe8",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif',
  padding: "24px 0",
}
const container = { backgroundColor: "#fff", margin: "0 auto", padding: "40px 32px", maxWidth: "560px" }
const eyebrow = { color: "#78716c", fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase" as const, margin: "0 0 8px" }
const h1 = { color: "#1c1917", fontFamily: "Georgia,serif", fontSize: "28px", fontWeight: "400", margin: "0 0 16px" }
const text = { color: "#44403c", fontSize: "15px", lineHeight: "24px", margin: "0 0 20px" }
const muted = { color: "#78716c", fontSize: "13px", margin: "0 0 20px" }
const button = {
  backgroundColor: "#1c1917",
  borderRadius: "999px",
  color: "#fff",
  display: "inline-block",
  fontSize: "14px",
  padding: "14px 36px",
  textDecoration: "none",
}
const hr = { borderColor: "#f0ece6", margin: "28px 0 16px" }
const footer = { color: "#a8a29e", fontSize: "12px", margin: "0" }

export default DeliveryStatusEmail
