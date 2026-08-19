import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getStoreByHost } from "@/lib/tenant";

export async function POST(req: NextRequest) {
  try {
    const { domain, isNewVisitor } = await req.json();

    if (!domain) {
      return NextResponse.json({ error: "Domain is required" }, { status: 400 });
    }

    const store = await getStoreByHost(domain);

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    // Get today's date at midnight UTC for aggregation
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // Upsert the analytics record for today
    await db.storeAnalytics.upsert({
      where: {
        storeId_date: {
          storeId: store.id,
          date: today,
        },
      },
      update: {
        pageViews: { increment: 1 },
        visitors: isNewVisitor ? { increment: 1 } : undefined,
      },
      create: {
        storeId: store.id,
        date: today,
        pageViews: 1,
        visitors: isNewVisitor ? 1 : 0,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Analytics tracking error:", error);
    return NextResponse.json(
      { error: "Failed to track analytics" },
      { status: 500 }
    );
  }
}
