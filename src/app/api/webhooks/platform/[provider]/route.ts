import { NextResponse } from "next/server";
import { getPlatformProvider } from "@/lib/payments/factory";
import { db } from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider: providerName } = await params;
  try {
    const bodyText = await req.text();
    const signature = req.headers.get("x-paystack-signature") || ""; // Adapt based on provider later

    const paymentProvider = getPlatformProvider();
    
    // 1. Verify Signature
    if (!paymentProvider.validateWebhookSignature(bodyText, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const payload = JSON.parse(bodyText);
    const event = paymentProvider.parseWebhookEvent(payload);

    if (!event) {
      return NextResponse.json({ received: true });
    }

    // 2. Idempotency Check
    const existingEvent = await db.webhookEvent.findUnique({
      where: { providerEventId: event.providerEventId },
    });

    if (existingEvent) {
      return NextResponse.json({ received: true, alreadyProcessed: true });
    }

    await db.webhookEvent.create({
      data: {
        provider: String(providerName).toUpperCase(),
        providerEventId: event.providerEventId,
        type: event.type,
      },
    });

    // 3. Process Event
    // Paystack: charge.success, subscription.create, etc.
    if (event.type === "charge.success") {
      const metadata = event.data.metadata;
      if (metadata?.storeId && metadata?.planId) {
        // Handle subscription payment success
        await db.subscription.upsert({
          where: { storeId: metadata.storeId },
          update: {
            status: "ACTIVE",
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            planId: metadata.planId,
          },
          create: {
            storeId: metadata.storeId,
            planId: metadata.planId,
            status: "ACTIVE",
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          }
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Platform Webhook Error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
