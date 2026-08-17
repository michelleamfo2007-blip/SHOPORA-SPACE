import { db } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createSupportTicketAction } from "@/server/actions/support"
import Link from "next/link"

export default async function NewSupportTicketPage({
  params
}: {
  params: Promise<{ storeId: string }>
}) {
  const { storeId } = await params

  const customers = await db.customer.findMany({
    where: { storeId },
    orderBy: { name: 'asc' }
  })

  const createTicket = createSupportTicketAction.bind(null, storeId)

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Log Support Issue</h2>
        <p className="text-muted-foreground">Record a customer inquiry or complaint.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Issue Details</CardTitle>
          <CardDescription>
            Log the details of the problem for internal tracking.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createTicket} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customerId">Customer</Label>
              <Select name="customerId" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} {c.email ? `(${c.email})` : ""}
                    </SelectItem>
                  ))}
                  {customers.length === 0 && (
                    <SelectItem value="none" disabled>No customers found</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" name="subject" placeholder="e.g. Missing Item, Return Request" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message / Details</Label>
              <Textarea 
                id="message" 
                name="message" 
                placeholder="Describe the issue the customer is experiencing..." 
                required 
                className="min-h-[150px]"
              />
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t">
              <Link href={`/${storeId}/support`}>
                <Button variant="outline" type="button">Cancel</Button>
              </Link>
              <Button type="submit" disabled={customers.length === 0}>
                Log Ticket
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
