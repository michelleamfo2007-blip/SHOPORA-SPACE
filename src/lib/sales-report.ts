import { db } from "@/lib/db"
import { DEFAULT_VARIANT_NAME } from "@/lib/product-variants"
import { ORDER_SOURCE_LABELS } from "@/lib/manual-order"
import { PAID_ORDER_STATUSES } from "@/lib/store-roles"

const DAY_MS = 24 * 60 * 60 * 1000
const MAX_DAYS = 366

export const REPORT_PRESETS = [
  { value: "today", label: "Today" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "month", label: "This month" },
  { value: "lastmonth", label: "Last month" },
] as const

function startOfDay(d: Date) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
}

function isoDay(d: Date) {
  return d.toISOString().slice(0, 10)
}

function parseDay(value: string | null | undefined) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const d = new Date(`${value}T00:00:00Z`)
  return Number.isNaN(d.getTime()) ? null : d
}

/** Turns ?range=…&from=…&to=… into a date window. Ghana is on UTC, so days are UTC days. `to` is exclusive. */
export function resolveReportRange(params: { range?: string | null; from?: string | null; to?: string | null }) {
  const today = startOfDay(new Date())
  const customFrom = parseDay(params.from)
  const customTo = parseDay(params.to)

  if (customFrom && customTo && customTo >= customFrom) {
    const to = new Date(customTo.getTime() + DAY_MS)
    const from = to.getTime() - customFrom.getTime() > MAX_DAYS * DAY_MS ? new Date(to.getTime() - MAX_DAYS * DAY_MS) : customFrom
    return { range: "custom", from, to, label: `${isoDay(from)} to ${isoDay(customTo)}` }
  }

  const range = REPORT_PRESETS.some((p) => p.value === params.range) ? params.range! : "30d"
  const tomorrow = new Date(today.getTime() + DAY_MS)
  if (range === "today") return { range, from: today, to: tomorrow, label: "Today" }
  if (range === "7d") return { range, from: new Date(tomorrow.getTime() - 7 * DAY_MS), to: tomorrow, label: "Last 7 days" }
  if (range === "month") {
    return { range, from: new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1)), to: tomorrow, label: "This month" }
  }
  if (range === "lastmonth") {
    const from = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - 1, 1))
    const to = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1))
    return { range, from, to, label: "Last month" }
  }
  return { range: "30d", from: new Date(tomorrow.getTime() - 30 * DAY_MS), to: tomorrow, label: "Last 30 days" }
}

async function loadOrders(storeId: string, from: Date, to: Date) {
  return db.order.findMany({
    where: { storeId, createdAt: { gte: from, lt: to } },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      source: true,
      totalAmount: true,
      createdAt: true,
      customer: { select: { name: true, phone: true } },
      orderItems: {
        select: {
          quantity: true,
          price: true,
          costPrice: true,
          variant: {
            select: {
              name: true,
              costPrice: true,
              product: { select: { id: true, name: true, costPrice: true } },
            },
          },
        },
      },
    },
  })
}

type LoadedOrder = Awaited<ReturnType<typeof loadOrders>>[number]
type LoadedItem = LoadedOrder["orderItems"][number]

function itemName(item: LoadedItem) {
  const v = item.variant
  return v.name && v.name !== DEFAULT_VARIANT_NAME ? `${v.product.name} (${v.name})` : v.product.name
}

function itemCost(item: LoadedItem) {
  return item.costPrice ?? item.variant.costPrice ?? item.variant.product.costPrice ?? null
}

const isPaid = (status: string) => (PAID_ORDER_STATUSES as readonly string[]).includes(status)
const isPending = (status: string) => status === "PENDING" || status === "PENDING_VERIFICATION"

export async function getSalesReport(storeId: string, from: Date, to: Date) {
  const orders = await loadOrders(storeId, from, to)
  const paid = orders.filter((o) => isPaid(o.status))

  let revenue = 0
  let profit = 0
  let costedRevenue = 0
  const missingCost = new Set<string>()
  const sources = new Map<string, { orders: number; revenue: number }>()
  const products = new Map<string, { name: string; quantity: number; revenue: number; profit: number | null }>()
  const days = new Map<string, { revenue: number; orders: number }>()

  for (let t = from.getTime(); t < to.getTime(); t += DAY_MS) days.set(isoDay(new Date(t)), { revenue: 0, orders: 0 })

  for (const order of paid) {
    revenue += order.totalAmount
    const src = sources.get(order.source) ?? { orders: 0, revenue: 0 }
    src.orders += 1
    src.revenue += order.totalAmount
    sources.set(order.source, src)

    const day = days.get(isoDay(order.createdAt))
    if (day) {
      day.revenue += order.totalAmount
      day.orders += 1
    }

    for (const item of order.orderItems) {
      const lineRevenue = item.price * item.quantity
      const cost = itemCost(item)
      const lineProfit = cost == null ? null : (item.price - cost) * item.quantity
      if (lineProfit == null) missingCost.add(item.variant.product.id)
      else {
        profit += lineProfit
        costedRevenue += lineRevenue
      }

      const name = itemName(item)
      const p = products.get(name) ?? { name, quantity: 0, revenue: 0, profit: 0 }
      p.quantity += item.quantity
      p.revenue += lineRevenue
      p.profit = p.profit == null || lineProfit == null ? null : p.profit + lineProfit
      products.set(name, p)
    }
  }

  const pendingOrders = orders.filter((o) => isPending(o.status))

  return {
    totals: {
      revenue,
      orders: paid.length,
      averageOrder: paid.length ? revenue / paid.length : 0,
      profit,
      margin: costedRevenue > 0 ? profit / costedRevenue : null,
      productsMissingCost: missingCost.size,
      pendingOrders: pendingOrders.length,
      pendingAmount: pendingOrders.reduce((sum, o) => sum + o.totalAmount, 0),
      cancelledOrders: orders.filter((o) => o.status === "CANCELLED" || o.status === "REFUNDED").length,
    },
    bySource: [...sources.entries()]
      .map(([source, s]) => ({ source, label: ORDER_SOURCE_LABELS[source] ?? source, ...s }))
      .sort((a, b) => b.revenue - a.revenue),
    byDay: [...days.entries()].map(([date, d]) => ({ date, ...d })),
    topProducts: [...products.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 10),
  }
}

export type SalesReport = Awaited<ReturnType<typeof getSalesReport>>

function csvCell(value: string | number | null | undefined) {
  const s = value == null ? "" : String(value)
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

/** One row per item sold, ready for Excel or Google Sheets. */
export async function salesReportCsv(storeId: string, from: Date, to: Date) {
  const orders = await loadOrders(storeId, from, to)
  const header = [
    "Date",
    "Order",
    "Status",
    "Source",
    "Customer",
    "Phone",
    "Product",
    "Quantity",
    "Unit price",
    "Line total",
    "Unit cost",
    "Line profit",
  ]
  const rows = orders.flatMap((o) =>
    o.orderItems.map((item) => {
      const cost = itemCost(item)
      return [
        o.createdAt.toISOString().slice(0, 16).replace("T", " "),
        o.orderNumber,
        o.status,
        ORDER_SOURCE_LABELS[o.source] ?? o.source,
        o.customer.name,
        o.customer.phone ?? "",
        itemName(item),
        item.quantity,
        item.price.toFixed(2),
        (item.price * item.quantity).toFixed(2),
        cost == null ? "" : cost.toFixed(2),
        cost == null ? "" : ((item.price - cost) * item.quantity).toFixed(2),
      ]
    })
  )
  return [header, ...rows].map((r) => r.map(csvCell).join(",")).join("\r\n")
}

export function reportFileName(storeSlug: string, from: Date, to: Date) {
  const last = new Date(to.getTime() - DAY_MS)
  return `${storeSlug}-sales-${isoDay(from)}-to-${isoDay(last)}.csv`
}
