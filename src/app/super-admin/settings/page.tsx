"use client"

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Save, Settings } from "lucide-react"
import { useState } from "react"

export default function SettingsPage() {
  const [loading, setLoading] = useState(false)

  const handleSave = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      alert("Settings saved successfully!")
    }, 1000)
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <Settings className="w-8 h-8 text-slate-500" />
            Platform Settings
          </h2>
          <p className="text-slate-500 mt-1">Manage global configurations for the Shopora Space platform.</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* General Settings */}
        <Card className="border-0 shadow-sm bg-white overflow-hidden rounded-xl">
          <CardHeader className="px-6 py-5 border-b border-slate-100 bg-slate-50/30">
            <CardTitle className="text-lg font-bold text-slate-900">General Configuration</CardTitle>
            <p className="text-sm text-slate-500 mt-1">Basic settings for the entire platform.</p>
          </CardHeader>
          <CardContent className="space-y-6 px-6 py-6">
            <div className="space-y-2">
              <Label htmlFor="platformName" className="font-bold text-slate-700">Platform Name</Label>
              <Input id="platformName" defaultValue="Shopora Space" className="border-slate-200 focus-visible:ring-slate-500" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supportEmail" className="font-bold text-slate-700">Support Email</Label>
              <Input id="supportEmail" defaultValue="support@shopora.space" className="border-slate-200 focus-visible:ring-slate-500" />
            </div>
          </CardContent>
        </Card>

        {/* Feature Flags */}
        <Card className="border-0 shadow-sm bg-white overflow-hidden rounded-xl">
          <CardHeader className="px-6 py-5 border-b border-slate-100 bg-slate-50/30">
            <CardTitle className="text-lg font-bold text-slate-900">Feature Toggles</CardTitle>
            <p className="text-sm text-slate-500 mt-1">Enable or disable core platform features.</p>
          </CardHeader>
          <CardContent className="space-y-6 px-6 py-6">
            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-1">
                <Label htmlFor="new-signups" className="font-bold text-slate-700">Allow New Vendor Signups</Label>
                <p className="text-sm font-medium text-slate-500">Enable or disable new store registrations.</p>
              </div>
              <Switch id="new-signups" defaultChecked />
            </div>
            
            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-1">
                <Label htmlFor="maintenance-mode" className="font-bold text-slate-700">Maintenance Mode</Label>
                <p className="text-sm font-medium text-slate-500">Take the platform offline for updates.</p>
              </div>
              <Switch id="maintenance-mode" />
            </div>

            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-1">
                <Label htmlFor="waitlist-mode" className="font-bold text-slate-700">Enforce Waitlist</Label>
                <p className="text-sm font-medium text-slate-500">Require users to be invited from the waitlist before creating a store.</p>
              </div>
              <Switch id="waitlist-mode" />
            </div>
          </CardContent>
          <CardFooter className="border-t border-slate-100 bg-slate-50/50 px-6 py-4">
            <Button onClick={handleSave} disabled={loading} className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg px-6">
              <Save className="w-4 h-4 mr-2" />
              {loading ? "Saving..." : "Save Settings"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
