const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const plans = await prisma.subscriptionPlan.findMany()
  for (const plan of plans) {
    let newPrice = plan.price
    if (plan.name === 'Starter' && plan.price < 150) newPrice = 150
    if (plan.name === 'Professional' && plan.price < 250) newPrice = 250
    if (plan.name === 'Business' && plan.price < 350) newPrice = 350
    
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
