import { Body, Button, Container, Head, Heading, Hr, Html, Preview, Text } from "@react-email/components"
import * as React from "react"

export function RiderApplicationReceivedEmail({
  riderName,
}: {
  riderName: string
}) {
  return (
    <Html>
      <Head />
      <Preview>We received your Shopora rider application</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={eyebrow}>Shopora Delivery · Accra</Text>
          <Heading style={h1}>Application received</Heading>
          <Text style={text}>
            Hi {riderName}, thanks for applying to ride with Shopora Space. Our team will review your
            application and email you when your account is approved.
          </Text>
          <Text style={muted}>
            You won’t be able to log in and take jobs until Shopora activates your account.
          </Text>
          <Hr style={hr} />
          <Text style={footer}>Shopora Space · Accra delivery</Text>
        </Container>
      </Body>
    </Html>
  )
}

export function RiderApprovedEmail({
  riderName,
  loginUrl,
}: {
  riderName: string
  loginUrl: string
}) {
  return (
    <Html>
      <Head />
      <Preview>You’re approved — log in and go online</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={eyebrow}>Shopora Delivery · Accra</Text>
          <Heading style={h1}>You’re approved</Heading>
          <Text style={text}>
            Hi {riderName}, your Shopora rider account is now active. Log in, go online, and start
            accepting Accra deliveries.
          </Text>
          <Text style={muted}>
            Remember: Shopora’s commission is 15% of each delivery fee. You keep 85% and settle the
            cut weekly via MoMo.
          </Text>
          <Button href={loginUrl} style={button}>
            Log in to rider dashboard
          </Button>
          <Hr style={hr} />
          <Text style={footer}>Shopora Space · Accra delivery</Text>
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
const eyebrow = {
  color: "#78716c",
  fontSize: "11px",
  letterSpacing: "3px",
  textTransform: "uppercase" as const,
  margin: "0 0 8px",
}
const h1 = {
  color: "#1c1917",
  fontFamily: "Georgia,serif",
  fontSize: "28px",
  fontWeight: "400",
  margin: "0 0 16px",
}
const text = { color: "#44403c", fontSize: "15px", lineHeight: "24px", margin: "0 0 16px" }
const muted = { color: "#78716c", fontSize: "13px", lineHeight: "20px", margin: "0 0 24px" }
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
