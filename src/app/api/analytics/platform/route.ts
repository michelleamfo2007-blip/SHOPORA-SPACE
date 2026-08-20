import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { isNewVisitor } = body;

    const today = new Date();
    // Normalize to start of day
    today.setUTCHours(0, 0, 0, 0);

    await db.platformAnalytics.upsert({
      where: {
        date: today,
      },
      update: {
        pageViews: { increment: 1 },
        visitors: isNewVisitor ? { increment: 1 } : undefined,
      },
      create: {
        date: today,
        pageViews: 1,
        visitors: isNewVisitor ? 1 : 0,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Platform analytics tracking error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
