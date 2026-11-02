import Link from "next/link"
import { redirect } from "next/navigation"
import { getRiderIdFromSession } from "@/lib/rider-session"
import { RiderSignupForm } from "./RiderSignupForm"

export default async function RiderSignupPage() {
  const riderId = await getRiderIdFromSession()
  if (riderId) redirect("/rider")

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#faf8f5] px-5 py-12">
      <div className="w-full max-w-md border border-stone-200 bg-white p-8 shadow-sm">
        <p className="text-[11px] uppercase tracking-[0.2em] text-stone-500">Shopora Delivery</p>
        <h1 className="mt-2 font-display text-3xl text-stone-900">Become a rider</h1>
        <p className="mt-2 text-sm text-stone-600">
          Apply for Accra Shopora Delivery. Create your own password — we’ll review and activate your account.
        </p>
        <RiderSignupForm />
        <p className="mt-6 text-center text-sm text-stone-600">
          Already have an account?{" "}
          <Link href="/rider/login" className="underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
