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

export type OrderStatusKind = 'ACCEPTED' | 'SHIPPED' | 'DELIVERED' | 'REFUNDED';

interface OrderStatusEmailProps {
  kind: OrderStatusKind;
  customerFirstName: string;
  storeName: string;
  orderNumber: string;
  currency: string;
  totalAmount: number;
  items: { name: string; quantity: number; price: number }[];
  shippingAddress?: string | null;
  storeUrl: string;
  storeWhatsapp?: string | null;
  storeEmail?: string | null;
}

const copy: Record<
  OrderStatusKind,
  { preview: (store: string) => string; heading: string; message: (store: string, order: string) => string; note?: string }
> = {
  ACCEPTED: {
    preview: (store) => `${store} has confirmed your order`,
    heading: 'Your order is confirmed',
    message: (store, order) =>
      `${store} has received your payment and confirmed order ${order}. They will contact you shortly to arrange delivery.`,
    note: 'The delivery fee is paid to the rider when your order arrives.',
  },
  SHIPPED: {
    preview: () => 'Your order is on the way',
    heading: 'Your order is on the way',
    message: (store, order) => `Good news. Order ${order} has left ${store} and is on its way to you.`,
    note: 'Please have the delivery fee ready to pay the rider on arrival.',
  },
  DELIVERED: {
    preview: () => 'Your order has arrived',
    heading: 'Your order has arrived',
    message: (store, order) => `Order ${order} from ${store} has been delivered. We hope you love it.`,
  },
  REFUNDED: {
    preview: (store) => `${store} has refunded your order`,
    heading: 'Your order has been refunded',
    message: (store, order) =>
      `${store} has refunded order ${order}. If you have any questions about the refund, message the store directly.`,
  },
};

function money(currency: string, amount: number) {
  return `${currency} ${amount.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export const OrderStatusEmail = ({
  kind,
  customerFirstName,
  storeName,
  orderNumber,
  currency,
  totalAmount,
  items,
  shippingAddress,
  storeUrl,
  storeWhatsapp,
  storeEmail,
}: OrderStatusEmailProps) => {
  const details = copy[kind];
  const waNumber = storeWhatsapp?.replace(/[^0-9]/g, '');
  const waHref = waNumber
    ? `https://wa.me/${waNumber}?text=${encodeURIComponent(`Hi ${storeName}, I'm asking about my order ${orderNumber}.`)}`
    : null;

  return (
    <Html>
      <Head />
      <Preview>{details.preview(storeName)}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={eyebrow}>{storeName}</Text>
          <Heading style={h1}>{details.heading}</Heading>
          <Text style={text}>
            Hi {customerFirstName}, {details.message(storeName, orderNumber)}
          </Text>

          <Section style={totalBox}>
            <Text style={label}>{kind === 'REFUNDED' ? 'Order value' : 'Order total'}</Text>
            <Text style={totalText}>{money(currency, totalAmount)}</Text>
            {details.note && <Text style={muted}>{details.note}</Text>}
          </Section>

          {items.length > 0 && (
            <>
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
            </>
          )}

          {shippingAddress && kind !== 'REFUNDED' && (
            <>
              <Text style={sectionTitle}>{kind === 'DELIVERED' ? 'Delivered to' : 'Delivering to'}</Text>
              <Text style={detail}>{shippingAddress}</Text>
            </>
          )}

          <Section style={{ textAlign: 'center', margin: '32px 0 8px' }}>
            {kind === 'DELIVERED' ? (
              <Button href={storeUrl} style={button}>
                Shop {storeName} again
              </Button>
            ) : waHref ? (
              <Button href={waHref} style={button}>
                Message {storeName}
              </Button>
            ) : storeEmail ? (
              <Button href={`mailto:${storeEmail}`} style={button}>
                Email {storeName}
              </Button>
            ) : (
              <Button href={storeUrl} style={button}>
                Visit {storeName}
              </Button>
            )}
          </Section>

          <Hr style={hr} />
          <Text style={footer}>
            Order {orderNumber}. You can reply to this email to reach {storeName}.
            <br />
            <Link href={storeUrl} style={footerLink}>Visit the store</Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default OrderStatusEmail;

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
