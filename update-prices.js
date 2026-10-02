const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const plans = await prisma.subscriptionPlan.findMany()
  for (const plan of plans) {
    let newPrice = plan.price
    if (plan.name === 'Starter' && plan.interval === 'month') newPrice = 100
    if (plan.name === 'Starter' && plan.interval === 'year') newPrice = 1100
    if (plan.name === 'Professional' && plan.interval === 'month') newPrice = 200
    if (plan.name === 'Professional' && plan.interval === 'year') newPrice = 2200
    if (plan.name === 'Business' && plan.interval === 'month') newPrice = 300
    if (plan.name === 'Business' && plan.interval === 'year') newPrice = 3300
    
    await prisma.subscriptionPlan.update({
      where: { id: plan.id },
      data: {
        price: newPrice,
        currency: 'GHS'
      }
    })
    console.log(`Updated plan ${plan.name} to GHS ${newPrice}`)
  }
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
