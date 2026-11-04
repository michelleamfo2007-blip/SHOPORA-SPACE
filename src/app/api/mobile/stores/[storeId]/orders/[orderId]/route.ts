import { db } from "@/lib/db"
import { requireMobileStoreAccess } from "@/lib/mobile-auth"
import { DEFAULT_VARIANT_NAME } from "@/lib/product-variants"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ storeId: string; orderId: string }> }
) {
  const { storeId, orderId } = await params
  const access = await requireMobileStoreAccess(req, storeId)
  if ("error" in access) return Response.json({ error: access.error }, { status: access.status })

  const order = await db.order.findUnique({
    where: { id: orderId, storeId },
    include: {
      customer: { select: { name: true, email: true, phone: true } },
      orderItems: {
        include: {
          variant: {
            select: {
              name: true,
              imageUrl: true,
              product: { select: { name: true, images: true } },
            },
          },
        },
      },
      payments: { orderBy: { createdAt: "desc" } },
      deliveryJob: {
        select: {
          status: true,
          rider: { select: { name: true, phone: true } },
        },
      },
    },
  })
  if (!order) return Response.json({ error: "Order not found." }, { status: 404 })

  const payment = order.payments[0]

  return Response.json({
    currency: access.store.currency,
    order: {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      createdAt: order.createdAt,
      totalAmount: order.totalAmount,
      taxAmount: order.taxAmount,
      shippingAmount: order.shippingAmount,
      subtotal: order.totalAmount - order.taxAmount - order.shippingAmount,
      deliveryMethod: order.deliveryMethod,
      deliveryDistanceKm: order.deliveryDistanceKm,
      deliveryDurationMin: order.deliveryDurationMin,
      shippingAddress: order.shippingAddress,
      dropoffLat: order.dropoffLat,
      dropoffLng: order.dropoffLng,
      customer: order.customer,
      items: order.orderItems.map((item) => ({
        id: item.id,
        name: item.variant?.product?.name || "Deleted product",
        variantName:
          item.variant?.name && item.variant.name !== DEFAULT_VARIANT_NAME ? item.variant.name : null,
        imageUrl: item.variant?.imageUrl || item.variant?.product?.images?.[0] || null,
        quantity: item.quantity,
        price: item.price,
      })),
      payment: payment
        ? {
            provider: payment.provider,
            status: payment.status,
            reference: payment.reference,
            amount: payment.amount,
          }
        : null,
      delivery: order.deliveryJob
        ? {
            status: order.deliveryJob.status,
            riderName: order.deliveryJob.rider?.name ?? null,
            riderPhone: order.deliveryJob.rider?.phone ?? null,
          }
        : null,
    },
  })
}
