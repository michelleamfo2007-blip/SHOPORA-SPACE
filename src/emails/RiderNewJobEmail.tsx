import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Text,
} from "@react-email/components"
import * as React from "react"

interface RiderNewJobEmailProps {
  riderName: string
  storeName: string
  orderNumber: string
  feeAmount: number
  riderPayout: number
  pickupAddress: string
  dropoffAddress: string
  distanceKm?: number | null
  durationMin?: number | null
  dashboardUrl: string
}

function money(amount: number) {
  return `GHS ${amount.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function RiderNewJobEmail({
  riderName,
  storeName,
  orderNumber,
  feeAmount,
  riderPayout,
  pickupAddress,
  dropoffAddress,
  distanceKm,
  durationMin,
  dashboardUrl,
}: RiderNewJobEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>New Accra delivery job · {orderNumber} · {money(feeAmount)}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={eyebrow}>Shopora Delivery · Accra</Text>
          <Heading style={h1}>New delivery job open</Heading>
          <Text style={text}>
            Hi {riderName}, a Shopora delivery is ready to accept. First rider to accept on the dashboard gets the job.
          </Text>

          <Text style={label}>Store</Text>
          <Text style={detail}>{storeName}</Text>
          <Text style={label}>Order</Text>
          <Text style={detail}>{orderNumber}</Text>
          <Text style={label}>Collect from customer</Text>
          <Text style={detail}>{money(feeAmount)} (you keep {money(riderPayout)})</Text>
          <Text style={label}>Pickup</Text>
          <Text style={detail}>{pickupAddress}</Text>
          <Text style={label}>Dropoff</Text>
          <Text style={detail}>{dropoffAddress}</Text>
          {(distanceKm != null || durationMin != null) && (
            <Text style={muted}>
              {distanceKm != null ? `${distanceKm} km` : ""}
              {distanceKm != null && durationMin != null ? " · " : ""}
              {durationMin != null ? `~${Math.round(durationMin)} mins` : ""}
            </Text>
          )}

          <Button href={dashboardUrl} style={button}>
            Open rider dashboard
          </Button>

          <Hr style={hr} />
          <Text style={footer}>If another rider already accepted it, the job will no longer be available.</Text>
        </Container>
      </Body>
    </Html>
  )
}

export default RiderNewJobEmail

const main = {
  backgroundColor: "#f3efe8",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  padding: "24px 0",
}
const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "40px 32px",
  maxWidth: "560px",
}
const eyebrow = {
  color: "#78716c",
  fontSize: "11px",
  letterSpacing: "3px",
  textTransform: "uppercase" as const,
  margin: "0 0 8px",
}
const h1 = {
  color: "#1c1917",
  fontFamily: 'Georgia,"Times New Roman",serif',
  fontSize: "28px",
  fontWeight: "400",
  lineHeight: "36px",
  margin: "0 0 16px",
}
const text = {
  color: "#44403c",
  fontSize: "15px",
  lineHeight: "24px",
  margin: "0 0 24px",
}
const label = {
  color: "#78716c",
  fontSize: "11px",
  letterSpacing: "2px",
  textTransform: "uppercase" as const,
  margin: "16px 0 4px",
}
const detail = {
  color: "#1c1917",
  fontSize: "15px",
  lineHeight: "22px",
  margin: "0",
}
const muted = {
  color: "#78716c",
  fontSize: "13px",
  margin: "12px 0 0",
}
const button = {
  backgroundColor: "#1c1917",
  borderRadius: "999px",
  color: "#ffffff",
  display: "inline-block",
  fontSize: "14px",
  margin: "28px 0 8px",
  padding: "14px 36px",
  textDecoration: "none",
}
const hr = { borderColor: "#f0ece6", margin: "28px 0 16px" }
const footer = {
  color: "#a8a29e",
  fontSize: "12px",
  lineHeight: "20px",
  margin: "0",
}
