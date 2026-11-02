import { Body, Button, Container, Head, Heading, Hr, Html, Preview, Text } from "@react-email/components"
import * as React from "react"

export type RiderJobUpdateKind = "ASSIGNED" | "CANCELLED" | "REASSIGNED" | "PICKUP_WARN"

export function RiderJobUpdateEmail({
  riderName,
  kind,
  orderNumber,
  storeName,
  note,
  dashboardUrl,
}: {
  riderName: string
  kind: RiderJobUpdateKind
  orderNumber: string
  storeName?: string
  note?: string
  dashboardUrl: string
}) {
  const copy: Record<RiderJobUpdateKind, { preview: string; heading: string; body: string }> = {
    ASSIGNED: {
      preview: `You accepted ${orderNumber}`,
      heading: "Delivery assigned to you",
      body: `You accepted order ${orderNumber}${storeName ? ` from ${storeName}` : ""}. Head to the store for pickup before the timeout window ends.`,
    },
    CANCELLED: {
      preview: `${orderNumber} was cancelled`,
      heading: "Delivery cancelled",
      body: `Order ${orderNumber} is no longer an active Shopora delivery.`,
    },
    REASSIGNED: {
      preview: `${orderNumber} was reassigned`,
      heading: "Delivery reassigned",
      body: `Order ${orderNumber} was released from you and is open for other riders again.`,
    },
    PICKUP_WARN: {
      preview: `Pickup reminder for ${orderNumber}`,
      heading: "Pickup reminder",
      body: `Please pick up order ${orderNumber} soon. If you do not mark it picked up in time, Shopora will reopen it for other riders.`,
    },
  }
  const c = copy[kind]

  return (
    <Html>
      <Head />
      <Preview>{c.preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={eyebrow}>Shopora Delivery · Accra</Text>
          <Heading style={h1}>{c.heading}</Heading>
          <Text style={text}>
            Hi {riderName}, {c.body}
          </Text>
          {note && <Text style={muted}>{note}</Text>}
          <Button href={dashboardUrl} style={button}>
            Open rider dashboard
          </Button>
          <Hr style={hr} />
          <Text style={footer}>Shopora riders · Accra</Text>
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

export default RiderJobUpdateEmail
