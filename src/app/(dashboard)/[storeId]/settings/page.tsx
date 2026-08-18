import { db } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SettingsForm } from "./SettingsForm"

export default async function SettingsPage({ params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params;
  const store = await db.store.findUnique({
    where: { id: storeId }
  })

  if (!store) {
    return null
  }

  return (
    <div className="grid gap-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-slate-500">Manage your store preferences, branding, and details.</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Store Details & Branding</CardTitle>
          <CardDescription>Update your store information, colors, and logo.</CardDescription>
        </CardHeader>
        <CardContent>
          <SettingsForm store={store} />
        </CardContent>
      </Card>
    </div>
  )
}
