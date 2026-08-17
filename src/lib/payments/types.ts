export interface CheckoutSessionOptions {
  amount: number;
  currency: string;
  reference: string;
  customerEmail: string;
  customerName?: string;
  metadata?: Record<string, any>;
  callbackUrl: string;
}

export interface CheckoutSessionResponse {
  checkoutUrl: string;
  reference: string;
}

export interface WebhookEventPayload {
  type: string;
  data: any;
  providerEventId: string;
}

export interface PaymentProviderStrategy {
  createCheckoutSession(options: CheckoutSessionOptions): Promise<CheckoutSessionResponse>;
  verifyPayment(reference: string): Promise<boolean>;
  validateWebhookSignature(payload: any, signature: string): boolean;
  parseWebhookEvent(payload: any): WebhookEventPayload | null;
}
