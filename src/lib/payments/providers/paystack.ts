import crypto from "crypto";
import {
  CheckoutSessionOptions,
  CheckoutSessionResponse,
  PaymentProviderStrategy,
  WebhookEventPayload,
} from "../types";

export class PaystackProvider implements PaymentProviderStrategy {
  private secretKey: string;
  private baseUrl = "https://api.paystack.co";

  constructor(secretKey: string) {
    this.secretKey = secretKey;
  }

  async createCheckoutSession(
    options: CheckoutSessionOptions
  ): Promise<CheckoutSessionResponse> {
    const response = await fetch(`${this.baseUrl}/transaction/initialize`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: Math.round(options.amount * 100), // Paystack expects amount in kobo/pesewas
        email: options.customerEmail,
        currency: options.currency,
        reference: options.reference,
        callback_url: options.callbackUrl,
        metadata: options.metadata,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.status) {
      throw new Error(data.message || "Failed to initialize Paystack checkout");
    }

    return {
      checkoutUrl: data.data.authorization_url,
      reference: data.data.reference,
    };
  }

  async verifyPayment(reference: string): Promise<boolean> {
    const response = await fetch(
      `${this.baseUrl}/transaction/verify/${encodeURIComponent(reference)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();
    
    if (!response.ok || !data.status) {
      return false;
    }

    return data.data.status === "success";
  }

  validateWebhookSignature(payload: any, signature: string): boolean {
    const hash = crypto
      .createHmac("sha512", this.secretKey)
      .update(typeof payload === "string" ? payload : JSON.stringify(payload))
      .digest("hex");
      
    return hash === signature;
  }

  parseWebhookEvent(payload: any): WebhookEventPayload | null {
    if (!payload || !payload.event) return null;
    
    // In Paystack, the event ID isn't directly provided as a unique top-level field usually,
    // so we use a combination of reference and event type or rely on Paystack's transaction ID.
    const providerEventId = payload.data?.id 
      ? `${payload.event}_${payload.data.id}` 
      : `${payload.event}_${Date.now()}`; // Fallback if no ID

    return {
      type: payload.event,
      data: payload.data,
      providerEventId,
    };
  }
}
