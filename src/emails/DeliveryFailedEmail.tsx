import { Body, Container, Head, Heading, Hr, Html, Preview, Text } from "@react-email/components"
import * as React from "react"

export function DeliveryFailedEmail({
  recipientName,
  storeName,
  orderNumber,
  reason,
  notes,
  riderName,
  dropoffAddress,
}: {
  recipientName: string
  storeName: string
  orderNumber: string
  reason: string
  notes?: string | null
  riderName: string
  dropoffAddress: string
}) {
  return (
    <Html>
      <Head />
      <Preview>Delivery failed for {orderNumber}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={eyebrow}>Shopora Delivery</Text>
          <Heading style={h1}>Delivery could not be completed</Heading>
          <Text style={text}>
            Hi {recipientName}, rider {riderName} reported a failed delivery for order {orderNumber} from {storeName}.
          </Text>
          <Text style={label}>Reason</Text>
          <Text style={detail}>{reason}</Text>
          {notes && (
            <>
              <Text style={label}>Notes</Text>
              <Text style={detail}>{notes}</Text>
            </>
          )}
          <Text style={label}>Address</Text>
          <Text style={detail}>{dropoffAddress}</Text>
          <Hr style={hr} />
          <Text style={footer}>Shopora admin can reopen this job for another rider from the deliveries board.</Text>
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
const label = { color: "#78716c", fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase" as const, margin: "16px 0 4px" }
const detail = { color: "#1c1917", fontSize: "15px", margin: "0" }
const hr = { borderColor: "#f0ece6", margin: "28px 0 16px" }
const footer = { color: "#a8a29e", fontSize: "12px", margin: "0" }

export default DeliveryFailedEmail
