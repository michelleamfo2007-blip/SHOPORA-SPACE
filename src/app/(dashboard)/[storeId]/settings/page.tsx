import { db } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SettingsForm } from "./SettingsForm"
import { Settings } from "lucide-react"

export default async function SettingsPage({ params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params;
  const store = await db.store.findUnique({
    where: { id: storeId }
  })

  if (!store) {
    return null
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <Settings className="w-8 h-8 text-slate-500" />
            Settings
          </h2>
          <p className="text-slate-500 mt-1">Manage your store preferences, branding, and details.</p>
        </div>
      </div>

      <Card className="max-w-2xl border-0 shadow-sm bg-white overflow-hidden rounded-xl">
        <CardHeader className="px-6 py-5 border-b border-slate-100 bg-slate-50/30">
          <CardTitle className="text-lg font-bold text-slate-900">Store Details & Branding</CardTitle>
          <p className="text-sm text-slate-500 mt-1">Update your store information, colors, and logo.</p>
        </CardHeader>
        <CardContent className="p-6">
          <SettingsForm store={store} />
        </CardContent>
      </Card>
    </div>
  )
}
