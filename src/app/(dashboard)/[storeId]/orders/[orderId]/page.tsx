import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { OrderStatusUpdater } from "./OrderStatusUpdater"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { ORDER_SOURCE_LABELS } from "@/lib/manual-order"
import { orderPaymentReminder } from "@/lib/payment-reminder"

export default async function OrderDetailsPage({
  params
}: {
  params: Promise<{ storeId: string, orderId: string }>
}) {
  const { storeId, orderId } = await params

  const store = await db.store.findUnique({
    where: { id: storeId }
  })

  if (!store) notFound()

  const order = await db.order.findUnique({
    where: { id: orderId, storeId },
    include: {
      customer: true,
      orderItems: {
        include: {
          variant: {
            include: {
              product: true
            }
          }
        }
      },
      payments: true
    }
  })

  if (!order) notFound()

  const payment = order.payments?.[0]
  const paymentSetting = await db.storePaymentSetting.findUnique({
    where: { storeId },
    select: { mobileMoneyNumber: true, accountName: true, bankName: true, accountNumber: true },
  })
  const reminder = orderPaymentReminder(order, store, paymentSetting)

  return (
    <div className="grid gap-6">
      <div className="flex items-center gap-4 mb-4">
        <Link href={`/${storeId}/orders`} className="text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h2 className="text-3xl font-bold tracking-tight">Order #{order.orderNumber}</h2>
        <Badge variant="outline" className="ml-2 text-sm">{new Date(order.createdAt).toLocaleString()}</Badge>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-bold">Order Items</CardTitle>
              <OrderStatusUpdater storeId={store.id} orderId={order.id} initialStatus={order.status} />
            </CardHeader>
            <CardContent className="pt-6">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.orderItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="font-medium">{item.variant?.product?.name || "Deleted Product"}</div>
                          <div className="text-sm text-slate-500">{item.variant?.name}</div>
                        </TableCell>
                        <TableCell className="text-right">{store.currency} {item.price.toFixed(2)}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right font-medium">
                          {store.currency} {(item.price * item.quantity).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex justify-end mt-6">
                <div className="w-64 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Subtotal</span>
                    <span>{store.currency} {(order.totalAmount - order.taxAmount - order.shippingAmount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">
                      {order.deliveryMethod === "SHOPORA" ? "Shopora Delivery (rider)" : "Delivery"}
                    </span>
                    <span>{store.currency} {order.shippingAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Tax</span>
                    <span>{store.currency} {order.taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-3 border-t">
                    <span>{order.deliveryMethod === "SHOPORA" ? "Paid to you" : "Total"}</span>
                    <span>{store.currency} {order.totalAmount.toFixed(2)}</span>
                  </div>
                  {order.deliveryMethod === "SHOPORA" && order.shippingAmount > 0 && (
                    <p className="text-xs text-slate-500 pt-1">
                      Customer pays {store.currency} {order.shippingAmount.toFixed(2)} to the Shopora rider on arrival.
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold">Customer Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-medium text-slate-900">{order.customer.name}</p>
                {order.customer.email && <p className="text-sm text-slate-500">{order.customer.email}</p>}
                {order.customer.phone && <p className="text-sm text-slate-500">{order.customer.phone}</p>}
              </div>
              <p className="text-sm text-slate-500">
                Order from: <span className="font-medium text-slate-900">{ORDER_SOURCE_LABELS[order.source] ?? order.source}</span>
              </p>
              {order.notes && (
                <p className="rounded-lg bg-stone-50 p-3 text-sm text-slate-700">
                  <span className="block text-xs font-medium uppercase tracking-wide text-slate-400">Your note</span>
                  {order.notes}
                </p>
              )}
              {reminder && (
                <a
                  href={reminder.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-10 w-full items-center justify-center rounded-full bg-emerald-600 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  Remind to pay on WhatsApp
                </a>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold">Delivery Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm font-medium text-slate-900">
                {order.deliveryMethod === "SHOPORA" ? "Shopora Delivery" : "Store arranges delivery"}
              </p>
              {order.deliveryMethod === "SHOPORA" && (
                <p className="text-sm text-slate-500">
                  Live quote: {store.currency} {order.shippingAmount.toFixed(2)}
                  {order.deliveryDistanceKm != null && ` · ${order.deliveryDistanceKm} km`}
                  {order.deliveryDurationMin != null && ` · ~${Math.round(order.deliveryDurationMin)} mins`}
                </p>
              )}
              {order.shippingAddress ? (
                <div className="space-y-1 text-sm font-medium text-slate-600">
                  {order.shippingAddress.split(', ').map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              ) : (
                <p className="text-sm italic text-slate-500">No delivery details provided</p>
              )}
              {order.dropoffLat != null && order.dropoffLng != null && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${order.dropoffLat},${order.dropoffLng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex text-sm font-medium text-slate-900 underline underline-offset-4"
                >
                  Open the customer’s exact pin in Google Maps
                </a>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold">Payment Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {payment ? (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Method</span>
                    <span className="font-medium">{payment.provider.replace("_", " ")}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Status</span>
                    <Badge variant={payment.status === "COMPLETED" ? "default" : "secondary"}>
                      {payment.status}
                    </Badge>
                  </div>
                  {payment.reference && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Reference</span>
                      <span className="font-mono text-xs">{payment.reference}</span>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-slate-500 italic">No payment record found.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
