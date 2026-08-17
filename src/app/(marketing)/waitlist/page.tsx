"use client";

import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { joinWaitlistAction } from "@/server/actions/waitlist"
import { useState } from "react"
import { CheckCircle2, ArrowRight } from "lucide-react"

export default function WaitlistPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    
    try {
      const res = await joinWaitlistAction(formData)
      if (res?.error) {
        setError(res.error)
        setLoading(false)
      } else if (res?.success) {
        setSuccess(true)
        setLoading(false)
      }
    } catch (err: any) {
      console.error(err)
      setError(`Client catch block: ${err.message || String(err)}`)
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-blue-50 text-blue-600 flex items-center justify-center rounded-full mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">You're on the list!</h2>
          <div className="text-slate-600 space-y-4 text-sm leading-relaxed">
            <p>
              Thank you for your interest in selling on Shopora. We are currently curating our platform to ensure the highest quality experience for our shoppers.
            </p>
            <div className="bg-slate-50 p-4 rounded-xl text-left border border-slate-100">
              <h3 className="font-semibold text-slate-900 mb-2">Next Steps:</h3>
              <ol className="list-decimal list-inside space-y-2 text-slate-600">
                <li>Watch out for a welcome email from <strong>customersupport@shopora.space</strong>.</li>
                <li>When invited, please email <strong>shoporaspace@gmail.com</strong> with your business requirements and brand details.</li>
                <li>Our team will review your application.</li>
                <li>Selected vendors will receive full onboarding access to set up their store.</li>
              </ol>
            </div>
          </div>
          <div className="pt-4">
            <Link href="/">
              <Button variant="outline" className="w-full">Return Home</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 px-4">
      <div className="text-center mb-10 max-w-lg">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl mb-4">
          Sell on <span className="text-blue-600">Shopora</span>
        </h1>
        <p className="text-lg text-slate-600">
          Join our exclusive waitlist for top-tier vendors. Provide your email below to get notified when applications open.
        </p>
      </div>

      <Card className="mx-auto max-w-sm w-full shadow-lg border-slate-200/60">
        <CardHeader>
          <CardTitle className="text-xl">Join the Waitlist</CardTitle>
          <CardDescription>
            Enter your email to request an invitation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md border border-red-100">
                {error}
              </div>
            )}
            
            <div className="grid gap-2">
              <Label htmlFor="email" className="sr-only">Email</Label>
              <Input
                id="email"
                type="email"
                name="email"
                placeholder="yourbusiness@example.com"
                required
                className="h-12"
              />
            </div>
            
            <Button type="submit" className="w-full h-12 text-md font-medium" disabled={loading}>
              {loading ? "Joining..." : (
                <span className="flex items-center gap-2">
                  Join Waitlist <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm text-slate-500">
            Already a registered vendor?{" "}
            <Link href="/login" className="text-blue-600 font-medium hover:underline">
              Log in here
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
