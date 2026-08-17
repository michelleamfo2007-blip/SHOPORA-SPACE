import { NextResponse } from "next/server";
import { getPaymentProvider } from "@/lib/payments/factory";
import { db } from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ storeId: string; provider: string }> }
) {
  try {
    const { storeId, provider: providerName } = await params;
    
    // 1. Get Seller's Payment Provider
    const provider = await getPaymentProvider(storeId);
    
    if (!provider) {
      return NextResponse.json(
        { error: "Payment provider not configured for store" },
        { status: 400 }
      );
    }

    const bodyText = await req.text();
    const signature = req.headers.get("x-paystack-signature") || "";

    // 2. Verify Signature using the SELLER'S secret key
    if (!provider.validateWebhookSignature(bodyText, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const payload = JSON.parse(bodyText);
    const event = provider.parseWebhookEvent(payload);

    if (!event) {
      return NextResponse.json({ received: true });
    }

    // 3. Idempotency Check
    const existingEvent = await db.webhookEvent.findUnique({
      where: { providerEventId: event.providerEventId },
    });

    if (existingEvent) {
      return NextResponse.json({ received: true, alreadyProcessed: true });
    }

    await db.webhookEvent.create({
      data: {
        provider: providerName.toUpperCase(),
        providerEventId: event.providerEventId,
        type: event.type,
      },
    });

    // 4. Process Event
    if (event.type === "charge.success") {
      const orderId = event.data.metadata?.orderId;
      
      if (orderId) {
        // Update the order to processing
        await db.order.update({
          where: { id: orderId, storeId },
          data: { status: "PROCESSING" },
        });

        // Record the payment
        await db.payment.create({
          data: {
            orderId,
            provider: providerName.toUpperCase() as any, // "PAYSTACK"
            status: "SUCCESS",
            reference: event.data.reference,
            amount: event.data.amount / 100, // Convert back from kobo/pesewas
          },
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Store Webhook Error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
