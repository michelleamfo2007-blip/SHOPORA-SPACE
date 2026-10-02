import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components"
import * as React from "react"

type OrderStatusKind = "SHIPPED" | "DELIVERED" | "REFUNDED"

interface OrderStatusEmailProps {
  kind: OrderStatusKind
  customerName: string
  orderNumber: string
  totalAmount: string
  storeName: string
}

const copy: Record<OrderStatusKind, { heading: string; preview: string; message: string }> = {
  SHIPPED: {
    heading: "Order shipped",
    preview: "Your order is on the way",
    message: "has been shipped. The rider will bring it to you. Pay the rider when it arrives.",
  },
  DELIVERED: {
    heading: "Order delivered",
    preview: "Your order was delivered",
    message: "has been marked as delivered.",
  },
  REFUNDED: {
    heading: "Order refunded",
    preview: "Your order was refunded",
    message: "has been refunded.",
  },
}

export const OrderStatusEmail = ({
  kind,
  customerName,
  orderNumber,
  totalAmount,
  storeName,
}: OrderStatusEmailProps) => {
  const details = copy[kind]

  return (
    <Html>
      <Head />
      <Preview>{details.preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>{details.heading}</Heading>
          <Text style={text}>Hi {customerName},</Text>
          <Text style={text}>
            Your order <strong>#{orderNumber}</strong> from {storeName} {details.message}
          </Text>
          <Section style={section}>
            <Text style={highlightText}>
              <strong>Order total:</strong> {totalAmount}
            </Text>
          </Section>
          <Hr style={hr} />
          <Text style={footer}>Thank you for shopping with {storeName}.</Text>
        </Container>
      </Body>
    </Html>
  )
}

export default OrderStatusEmail

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "40px 20px",
  borderRadius: "8px",
  maxWidth: "600px",
  border: "1px solid #eee",
}

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "600",
  lineHeight: "40px",
  margin: "0 0 20px",
}

const text = {
  color: "#555",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0 0 20px",
}

const highlightText = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0",
}

const section = {
  backgroundColor: "#f1f5f9",
  padding: "16px",
  borderRadius: "4px",
  margin: "20px 0",
}

const hr = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
}

const footer = {
  color: "#8898aa",
  fontSize: "14px",
  lineHeight: "20px",
}
