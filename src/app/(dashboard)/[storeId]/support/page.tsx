import { db } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"
import { ResolveTicketButton, DeleteTicketButton } from "./SupportClient"

export default async function SupportPage({
  params
}: {
  params: Promise<{ storeId: string }>
}) {
  const { storeId } = await params

  const tickets = await db.supportTicket.findMany({
    where: { storeId },
    include: { customer: true },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <Plus className="w-8 h-8 text-indigo-500" />
            Support Tickets
          </h2>
          <p className="text-slate-500 mt-1">Manage customer inquiries and track issues.</p>
        </div>
        <Link href={`/${storeId}/support/new`}>
          <Button className="bg-slate-900 text-white rounded-xl px-5 py-2.5 font-bold hover:bg-slate-800 transition-colors shadow-sm flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Log New Issue
          </Button>
        </Link>
      </div>

      <Card className="border-0 shadow-sm bg-white overflow-hidden rounded-xl">
        <CardHeader className="px-6 py-5 border-b border-slate-100 bg-slate-50/30">
          <CardTitle className="text-lg font-bold text-slate-900">Customer Inquiries</CardTitle>
          <p className="text-sm text-slate-500 mt-1">Keep track of customer problems and resolve them promptly.</p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs font-bold text-slate-400 bg-slate-50/50 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Subject</th>
                  <th className="px-6 py-4 w-1/3">Message</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tickets.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium">
                      No support tickets yet.
                    </td>
                  </tr>
                ) : (
                  tickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{ticket.customer.name}</div>
                        <div className="text-xs font-medium text-slate-500 mt-0.5">{ticket.customer.email}</div>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-700">{ticket.subject}</td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-500">
                        {ticket.message}
                      </td>
                      <td className="px-6 py-4">
                        {ticket.status === "RESOLVED" ? (
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600 ring-1 ring-inset ring-slate-500/10">
                            Resolved
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 ring-1 ring-inset ring-blue-600/20">
                            Open
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <ResolveTicketButton storeId={storeId} ticketId={ticket.id} isResolved={ticket.status === "RESOLVED"} />
                          <DeleteTicketButton storeId={storeId} ticketId={ticket.id} />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
