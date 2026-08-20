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
import { signIn } from "next-auth/react"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (res?.error) {
        setError("Invalid email or password")
        setLoading(false)
      } else {
        window.location.href = "/dashboard"
      }
    } catch (err) {
      setError("An unexpected error occurred")
      setLoading(false)
    }
  }

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-slate-50 overflow-hidden selection:bg-black selection:text-white">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-100/50 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-100/50 blur-[100px] pointer-events-none" />
      
      <div className="w-full max-w-[400px] px-4 z-10">
        <div className="mb-8 text-center space-y-2">
          <Link href="/" className="inline-block transition-transform hover:scale-105">
            <div className="h-10 w-10 bg-black text-white rounded-xl flex items-center justify-center font-bold text-xl mx-auto shadow-lg shadow-black/10">
              S
            </div>
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 mt-4">Welcome back</h1>
          <p className="text-slate-500 text-sm">Enter your details to sign in to your account</p>
        </div>

        <Card className="border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white/80 backdrop-blur-xl">
          <CardContent className="pt-6">
            <form className="grid gap-5" onSubmit={handleSubmit}>
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50/50 border border-red-100 rounded-lg text-center font-medium">
                  {error}
                </div>
              )}
              
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-slate-600">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="name@example.com"
                  className="bg-white/50 h-11 transition-all focus:bg-white"
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-slate-600">Password</Label>
                  <Link href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <Input 
                  id="password" 
                  name="password" 
                  type="password" 
                  className="bg-white/50 h-11 transition-all focus:bg-white"
                  required 
                />
              </div>
              
              <Button type="submit" className="w-full h-11 text-base font-medium shadow-sm shadow-black/5 mt-2 transition-all active:scale-[0.98]" disabled={loading}>
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
            
            <div className="mt-6 text-center text-sm text-slate-500">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="font-semibold text-slate-900 hover:underline transition-all">
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
