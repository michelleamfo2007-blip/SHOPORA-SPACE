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
import { useState } from "react"
import { useRouter } from "next/navigation"
import { signUpAction } from "@/server/actions/auth"
import { signIn } from "next-auth/react"

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    
    try {
      const res = await signUpAction(formData)

      if (res.error) {
        setError(res.error)
        setLoading(false)
      } else {
        // Automatically sign in after signup
        const email = formData.get("email") as string
        const password = formData.get("password") as string
        
        const signInRes = await signIn("credentials", {
          email,
          password,
          redirect: false,
        })
        
        if (signInRes?.error) {
          setError("Account created but failed to sign in automatically")
          setLoading(false)
        } else {
          window.location.href = "/dashboard"
        }
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
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 mt-4">Create an Account</h1>
          <p className="text-slate-500 text-sm">Enter your details below to create your Shopora account</p>
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
                <Label htmlFor="name" className="text-slate-600">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  className="bg-white/50 h-11 transition-all focus:bg-white"
                  required
                />
              </div>

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
                <Label htmlFor="password" className="text-slate-600">Password</Label>
                <Input 
                  id="password" 
                  name="password" 
                  type="password" 
                  className="bg-white/50 h-11 transition-all focus:bg-white"
                  required 
                />
              </div>
              
              <Button type="submit" className="w-full h-11 text-base font-medium shadow-sm shadow-black/5 mt-2 transition-all active:scale-[0.98]" disabled={loading}>
                {loading ? "Creating account..." : "Sign up"}
              </Button>
            </form>
            
            <div className="mt-6 text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-slate-900 hover:underline transition-all">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
