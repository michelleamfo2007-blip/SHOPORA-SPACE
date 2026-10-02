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

interface NewOrderEmailProps {
  merchantName: string;
  storeName: string;
  orderNumber: string;
  orderUrl: string;
  currency: string;
  totalAmount: number;
  items: { name: string; quantity: number; price: number }[];
  customer: { name: string; phone: string; email: string };
  shippingAddress: string;
  paymentReference: string;
}

function money(currency: string, amount: number) {
  return `${currency} ${amount.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function whatsappNumber(phone: string) {
  const digits = phone.replace(/[^0-9]/g, '');
  if (digits.length === 10 && digits.startsWith('0')) return `233${digits.slice(1)}`;
  return digits;
}

export const NewOrderEmail = ({
  merchantName,
  storeName,
  orderNumber,
  orderUrl,
  currency,
  totalAmount,
  items,
  customer,
  shippingAddress,
  paymentReference,
}: NewOrderEmailProps) => {
  const total = money(currency, totalAmount);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const waNumber = whatsappNumber(customer.phone);

  return (
    <Html>
      <Head />
      <Preview>{`${customer.name} ordered ${itemCount} ${itemCount === 1 ? 'item' : 'items'} · ${total}`}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={eyebrow}>{storeName}</Text>
          <Heading style={h1}>You have a new order</Heading>
          <Text style={text}>
            Hi {merchantName}, {customer.name} just placed order <strong>{orderNumber}</strong>.
          </Text>

          <Section style={totalBox}>
            <Text style={label}>Order total</Text>
            <Text style={totalText}>{total}</Text>
            <Text style={muted}>Delivery fee not included. The customer pays the rider.</Text>
          </Section>

          <Text style={sectionTitle}>Items</Text>
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

          <Hr style={hr} />

          <Text style={sectionTitle}>Customer</Text>
          <Text style={detail}>{customer.name}</Text>
          <Text style={detail}>
            <Link href={`tel:${customer.phone}`} style={link}>{customer.phone}</Link>
            {waNumber && (
              <>
                {'  ·  '}
                <Link href={`https://wa.me/${waNumber}`} style={link}>WhatsApp</Link>
              </>
            )}
          </Text>
          <Text style={detail}>
            <Link href={`mailto:${customer.email}`} style={link}>{customer.email}</Link>
          </Text>

          <Text style={sectionTitle}>Deliver to</Text>
          <Text style={detail}>{shippingAddress}</Text>

          <Text style={sectionTitle}>Payment</Text>
          <Text style={detail}>
            Reference: <strong>{paymentReference}</strong>
          </Text>
          <Section style={noteBox}>
            <Text style={noteText}>
              Before you confirm, check your Mobile Money or bank account for <strong>{total}</strong> with this
              reference.
            </Text>
          </Section>

          <Section style={{ textAlign: 'center', margin: '32px 0 8px' }}>
            <Button href={orderUrl} style={button}>
              Review order
            </Button>
          </Section>

          <Hr style={hr} />
          <Text style={footer}>Sent by Shopora for {storeName}</Text>
        </Container>
      </Body>
    </Html>
  );
};

export default NewOrderEmail;

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

const link = {
  color: '#1c1917',
  textDecoration: 'underline',
};

const noteBox = {
  borderLeft: '2px solid #1c1917',
  backgroundColor: '#faf8f5',
  padding: '4px 16px',
  margin: '12px 0 0',
};

const noteText = {
  color: '#44403c',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '8px 0',
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
  lineHeight: '18px',
  textAlign: 'center' as const,
  margin: '0',
};
