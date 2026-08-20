import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const plans = await db.subscriptionPlan.findMany()
  for (const plan of plans) {
    let newPrice = plan.price
    if (plan.name === 'Starter' && plan.price < 150) newPrice = 150
    if (plan.name === 'Professional' && plan.price < 250) newPrice = 250
    if (plan.name === 'Business' && plan.price < 350) newPrice = 350
    
    await db.subscriptionPlan.update({
      where: { id: plan.id },
      data: {
        price: newPrice,
        currency: 'GHS'
      }
    })
  }
  return NextResponse.json({ success: true })
}
