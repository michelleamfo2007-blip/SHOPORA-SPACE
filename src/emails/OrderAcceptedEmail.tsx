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
} from '@react-email/components';
import * as React from 'react';

interface OrderAcceptedEmailProps {
  customerName: string;
  orderNumber: string;
  totalAmount: string;
  storeName: string;
}

export const OrderAcceptedEmail = ({
  customerName,
  orderNumber,
  totalAmount,
  storeName,
}: OrderAcceptedEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Your order from {storeName} has been accepted!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Order Accepted</Heading>
          
          <Text style={text}>Hi {customerName},</Text>
          
          <Text style={text}>
            Great news! Your order <strong>#{orderNumber}</strong> from {storeName} has been accepted.
          </Text>

          <Section style={section}>
            <Text style={highlightText}>
              <strong>Order Total:</strong> {totalAmount}
            </Text>
          </Section>

          <Text style={text}>
            Since our delivery is fully manual, we will contact you shortly to arrange a delivery rider. 
            <strong> You will pay the rider directly upon arrival.</strong>
          </Text>
          
          <Hr style={hr} />
          
          <Text style={footer}>
            Thank you for shopping with {storeName}!
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default OrderAcceptedEmail;

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px 20px',
  borderRadius: '8px',
  maxWidth: '600px',
  border: '1px solid #eee',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '40px',
  margin: '0 0 20px',
};

const text = {
  color: '#555',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 20px',
};

const highlightText = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0',
};

const section = {
  backgroundColor: '#f1f5f9',
  padding: '16px',
  borderRadius: '4px',
  margin: '20px 0',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
};

const footer = {
  color: '#8898aa',
  fontSize: '14px',
  lineHeight: '20px',
};
