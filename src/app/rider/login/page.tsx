import { redirect } from "next/navigation"
import { getRiderIdFromSession } from "@/lib/rider-session"
import { RiderLoginForm } from "./RiderLoginForm"

export default async function RiderLoginPage() {
  const riderId = await getRiderIdFromSession()
  if (riderId) redirect("/rider")

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#faf8f5] px-5">
      <div className="w-full max-w-md border border-stone-200 bg-white p-8 shadow-sm">
        <p className="text-[11px] uppercase tracking-[0.2em] text-stone-500">Shopora Delivery</p>
        <h1 className="mt-2 font-display text-3xl text-stone-900">Rider login</h1>
        <p className="mt-2 text-sm text-stone-600">Accra riders — see open jobs and accept deliveries.</p>
        <RiderLoginForm />
      </div>
    </div>
  )
}
