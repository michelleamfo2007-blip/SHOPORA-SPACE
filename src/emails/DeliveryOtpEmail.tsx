import { Body, Button, Container, Head, Heading, Hr, Html, Preview, Text } from "@react-email/components"
import * as React from "react"

export function DeliveryOtpEmail({
  customerFirstName,
  storeName,
  orderNumber,
  otp,
  trackingUrl,
}: {
  customerFirstName: string
  storeName: string
  orderNumber: string
  otp: string
  trackingUrl: string
}) {
  return (
    <Html>
      <Head />
      <Preview>Your Shopora delivery code for {orderNumber}: {otp}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={eyebrow}>{storeName}</Text>
          <Heading style={h1}>Your delivery code</Heading>
          <Text style={text}>
            Hi {customerFirstName}, your order {orderNumber} has been picked up. Give this code to the Shopora rider
            when they arrive — do not share it earlier.
          </Text>
          <Text style={otpStyle}>{otp}</Text>
          <Text style={muted}>Pay the delivery fee to the rider on arrival.</Text>
          <Button href={trackingUrl} style={button}>
            Track delivery
          </Button>
          <Hr style={hr} />
          <Text style={footer}>If you did not place this order, reply to this email.</Text>
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
const otpStyle = {
  color: "#1c1917",
  fontSize: "36px",
  letterSpacing: "8px",
  fontWeight: "600" as const,
  textAlign: "center" as const,
  margin: "8px 0 16px",
}
const muted = { color: "#78716c", fontSize: "13px", margin: "0 0 24px", textAlign: "center" as const }
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

export default DeliveryOtpEmail
