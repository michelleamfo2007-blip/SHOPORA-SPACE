import { db } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Support Tickets</h2>
          <p className="text-muted-foreground">Manage customer inquiries and track issues.</p>
        </div>
        <Link href={`/${storeId}/support/new`}>
          <Button type="button">
            <Plus className="mr-2 h-4 w-4" />
            Log New Issue
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Inquiries</CardTitle>
          <CardDescription>
            Keep track of customer problems and resolve them promptly.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead className="w-1/3">Message</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No support tickets yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  tickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell className="font-medium">
                        {ticket.customer.name}
                        <div className="text-xs text-muted-foreground">{ticket.customer.email}</div>
                      </TableCell>
                      <TableCell className="font-medium">{ticket.subject}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {ticket.message}
                      </TableCell>
                      <TableCell>
                        <Badge variant={ticket.status === "RESOLVED" ? "secondary" : "default"} className={ticket.status === "OPEN" ? "bg-blue-500 hover:bg-blue-600" : ""}>
                          {ticket.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <ResolveTicketButton storeId={storeId} ticketId={ticket.id} isResolved={ticket.status === "RESOLVED"} />
                          <DeleteTicketButton storeId={storeId} ticketId={ticket.id} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
