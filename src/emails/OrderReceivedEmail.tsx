import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface OrderReceivedEmailProps {
  customerFirstName: string;
  storeName: string;
  orderNumber: string;
  currency: string;
  totalAmount: number;
  items: { name: string; quantity: number; price: number }[];
  shippingAddress: string;
  paymentReference: string;
  storeUrl: string;
  storeWhatsapp?: string | null;
  storeEmail?: string | null;
}

function money(currency: string, amount: number) {
  return `${currency} ${amount.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export const OrderReceivedEmail = ({
  customerFirstName,
  storeName,
  orderNumber,
  currency,
  totalAmount,
  items,
  shippingAddress,
  paymentReference,
  storeUrl,
  storeWhatsapp,
  storeEmail,
}: OrderReceivedEmailProps) => {
  const total = money(currency, totalAmount);
  const waNumber = storeWhatsapp?.replace(/[^0-9]/g, '');
  const waHref = waNumber
    ? `https://wa.me/${waNumber}?text=${encodeURIComponent(`Hi ${storeName}, I'm asking about my order ${orderNumber}.`)}`
    : null;

  return (
    <Html>
      <Head />
      <Preview>{`We've received your order ${orderNumber} from ${storeName}`}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={eyebrow}>{storeName}</Text>
          <Heading style={h1}>Thank you for your order</Heading>
          <Text style={text}>
            Hi {customerFirstName}, we&apos;ve received your order <strong>{orderNumber}</strong>. {storeName} is now
            checking your payment and will confirm your order shortly.
          </Text>

          <Section style={totalBox}>
            <Text style={label}>Order total</Text>
            <Text style={totalText}>{total}</Text>
            <Text style={muted}>Delivery fee not included. You pay the rider when your order arrives.</Text>
          </Section>

          <Text style={sectionTitle}>Your items</Text>
          {items.map((item, index) => (
            <Row key={index} style={itemRow}>
              <Column>
                <Text style={itemName}>{item.name}</Text>
                <Text style={muted}>
                  {item.quantity} × {money(currency, item.price)}
                </Text>
              </Column>
              <Column align="right" style={{ verticalAlign: 'top' }}>
                <Text style={itemName}>{money(currency, item.price * item.quantity)}</Text>
              </Column>
            </Row>
          ))}

          <Text style={sectionTitle}>Delivering to</Text>
          <Text style={detail}>{shippingAddress}</Text>

          <Text style={sectionTitle}>Payment reference</Text>
          <Text style={detail}>{paymentReference}</Text>

          <Hr style={hr} />

          <Text style={sectionTitle}>What happens next</Text>
          <Text style={step}>1. {storeName} checks that your payment has arrived.</Text>
          <Text style={step}>2. You get an email when your order is confirmed.</Text>
          <Text style={step}>3. The store contacts you to arrange delivery.</Text>

          {(waHref || storeEmail) && (
            <Section style={{ textAlign: 'center', margin: '32px 0 8px' }}>
              {waHref ? (
                <Button href={waHref} style={button}>
                  Message {storeName}
                </Button>
              ) : (
                <Button href={`mailto:${storeEmail}`} style={button}>
                  Email {storeName}
                </Button>
              )}
            </Section>
          )}

          <Hr style={hr} />
          <Text style={footer}>
            Keep this email for your records. You can reply to it to reach {storeName}.
            <br />
            <Link href={storeUrl} style={footerLink}>Visit the store</Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default OrderReceivedEmail;

const main = {
  backgroundColor: '#f3efe8',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  padding: '24px 0',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px 32px',
  maxWidth: '560px',
};

const eyebrow = {
  color: '#78716c',
  fontSize: '11px',
  letterSpacing: '3px',
  textTransform: 'uppercase' as const,
  margin: '0 0 8px',
};

const h1 = {
  color: '#1c1917',
  fontFamily: 'Georgia,"Times New Roman",serif',
  fontSize: '30px',
  fontWeight: '400',
  lineHeight: '38px',
  margin: '0 0 16px',
};

const text = {
  color: '#44403c',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0 0 24px',
};

const totalBox = {
  backgroundColor: '#faf8f5',
  padding: '20px 24px',
  margin: '0 0 28px',
};

const label = {
  color: '#78716c',
  fontSize: '11px',
  letterSpacing: '2px',
  textTransform: 'uppercase' as const,
  margin: '0',
};

const totalText = {
  color: '#1c1917',
  fontFamily: 'Georgia,"Times New Roman",serif',
  fontSize: '32px',
  lineHeight: '40px',
  margin: '4px 0',
};

const sectionTitle = {
  ...label,
  margin: '24px 0 8px',
};

const itemRow = {
  borderBottom: '1px solid #f0ece6',
};

const itemName = {
  color: '#1c1917',
  fontSize: '15px',
  lineHeight: '22px',
  margin: '10px 0 0',
};

const muted = {
  color: '#78716c',
  fontSize: '13px',
  lineHeight: '20px',
  margin: '0 0 10px',
};

const detail = {
  color: '#1c1917',
  fontSize: '15px',
  lineHeight: '22px',
  margin: '0 0 4px',
};

const step = {
  color: '#44403c',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0 0 6px',
};

const button = {
  backgroundColor: '#1c1917',
  borderRadius: '999px',
  color: '#ffffff',
  fontSize: '14px',
  letterSpacing: '0.5px',
  padding: '14px 36px',
  textDecoration: 'none',
};

const hr = {
  borderColor: '#f0ece6',
  margin: '28px 0 16px',
};

const footer = {
  color: '#a8a29e',
  fontSize: '12px',
  lineHeight: '20px',
  textAlign: 'center' as const,
  margin: '0',
};

const footerLink = {
  color: '#78716c',
  textDecoration: 'underline',
};
