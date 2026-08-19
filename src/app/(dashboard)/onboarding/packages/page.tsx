"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { startTrialAction } from "@/server/actions/subscription"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

const packages = [
  {
    name: "Starter",
    priceMonthly: 150,
    priceYearly: 1650,
    description: "Perfect for new merchants starting their online journey.",
    features: [
      "Up to 50 Products",
      "Basic Storefront Theme",
      "Order Management",
      "Standard Support"
    ]
  },
  {
    name: "Professional",
    priceMonthly: 250,
    priceYearly: 2750,
    description: "For growing businesses that need more power.",
    features: [
      "Unlimited Products",
      "Custom Domain Support",
      "Advanced Analytics",
      "Priority Support"
    ]
  },
  {
    name: "Business",
    priceMonthly: 350,
    priceYearly: 3850,
    description: "Enterprise-grade features for high-volume stores.",
    features: [
      "Everything in Professional",
      "Multiple Staff Accounts",
      "Custom Integrations",
      "24/7 Dedicated Manager"
    ]
  }
]

export default function PackagesPage() {
  const [isYearly, setIsYearly] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50 py-24 px-6">
      <div className="max-w-6xl mx-auto text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Choose Your Package</h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-8">
          Select a plan to start your 7-day free trial. You can upgrade or downgrade at any time.
        </p>

        <div className="flex items-center justify-center space-x-3 mb-8">
          <Label htmlFor="billing-toggle" className={`text-lg font-medium ${!isYearly ? 'text-slate-900' : 'text-slate-500'}`}>Monthly</Label>
          <Switch 
            id="billing-toggle" 
            checked={isYearly}
            onCheckedChange={setIsYearly}
          />
          <Label htmlFor="billing-toggle" className={`text-lg font-medium flex items-center gap-2 ${isYearly ? 'text-slate-900' : 'text-slate-500'}`}>
            Yearly <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Save 1 month</span>
          </Label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {packages.map((pkg) => {
          const price = isYearly ? pkg.priceYearly : pkg.priceMonthly
          const intervalStr = isYearly ? "year" : "month"

          return (
            <Card key={pkg.name} className="flex flex-col relative transition-all duration-200 hover:shadow-lg border-2 border-transparent hover:border-slate-200">
              <CardHeader>
                <CardTitle className="text-2xl">{pkg.name}</CardTitle>
                <CardDescription>{pkg.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="mb-6">
                  <span className="text-4xl font-bold text-slate-900">GH₵ {price.toLocaleString()}</span>
                  <span className="text-slate-500">/{intervalStr}</span>
                </div>
                <ul className="space-y-3">
                  {pkg.features.map((feature) => (
                    <li key={feature} className="flex items-center text-slate-600">
                      <svg className="w-5 h-5 text-blue-600 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <form action={startTrialAction.bind(null, pkg.name, intervalStr)} className="w-full">
                  <Button type="submit" className="w-full font-semibold" size="lg">
                    Start 7-Day Free Trial
                  </Button>
                </form>
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
