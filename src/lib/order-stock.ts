import type { Prisma } from "@prisma/client"

/** Puts an order's items back in stock (cancel/refund). Only for orders that took stock at checkout. */
export async function releaseOrderStock(tx: Prisma.TransactionClient, orderId: string) {
  const order = await tx.order.findUnique({
    where: { id: orderId },
    select: {
      stockReserved: true,
      orderItems: {
        select: {
          quantity: true,
          variantId: true,
          variant: { select: { productId: true, product: { select: { _count: { select: { options: true } } } } } },
        },
      },
    },
  })
  if (!order?.stockReserved) return

  for (const item of order.orderItems) {
    await tx.productVariant.update({
      where: { id: item.variantId },
      data: { stockCount: { increment: item.quantity } },
    })
    if (item.variant.product._count.options === 0) {
      await tx.product.update({
        where: { id: item.variant.productId },
        data: { stockCount: { increment: item.quantity } },
      })
    }
  }
  await tx.order.update({ where: { id: orderId }, data: { stockReserved: false } })
}

/** Takes stock again when a cancelled/refunded order is reopened. Throws "OUT_OF_STOCK:<name>" if short. */
export async function reserveOrderStock(tx: Prisma.TransactionClient, orderId: string) {
  const order = await tx.order.findUnique({
    where: { id: orderId },
    select: {
      stockReserved: true,
      orderItems: {
        select: {
          quantity: true,
          variantId: true,
          variant: {
            select: { productId: true, product: { select: { name: true, _count: { select: { options: true } } } } },
          },
        },
      },
    },
  })
  if (!order || order.stockReserved) return

  for (const item of order.orderItems) {
    const reserved = await tx.productVariant.updateMany({
      where: { id: item.variantId, stockCount: { gte: item.quantity } },
      data: { stockCount: { decrement: item.quantity } },
    })
    if (reserved.count === 0) throw new Error(`OUT_OF_STOCK:${item.variant.product.name}`)
    if (item.variant.product._count.options === 0) {
      await tx.product.update({
        where: { id: item.variant.productId },
        data: { stockCount: { decrement: item.quantity } },
      })
    }
  }
  await tx.order.update({ where: { id: orderId }, data: { stockReserved: true } })
}
