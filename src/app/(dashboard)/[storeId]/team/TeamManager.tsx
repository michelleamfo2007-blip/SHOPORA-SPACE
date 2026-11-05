"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { inviteTeamMemberAction, removeTeamEntryAction } from "@/server/actions/dashboard-tools"
import type { StoreRole } from "@/lib/store-roles"

type Member = { id: string; role: StoreRole; userId: string; name: string | null; email: string | null }
type Invite = { id: string; email: string; role: StoreRole }

export function TeamManager({
  storeId,
  myRole,
  myUserId,
  labels,
  descriptions,
  members,
  invites,
}: {
  storeId: string
  myRole: StoreRole
  myUserId: string
  labels: Record<StoreRole, string>
  descriptions: Record<StoreRole, string>
  members: Member[]
  invites: Invite[]
}) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<StoreRole>("STAFF")
  const [busy, setBusy] = useState(false)
  const roles: StoreRole[] = myRole === "OWNER" ? ["STAFF", "ADMIN"] : ["STAFF"]

  async function invite(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    const result = await inviteTeamMemberAction(storeId, email, role)
    setBusy(false)
    if ("error" in result) return toast.error(result.error)
    toast.success(result.joined ? "Added to your team" : "Invite sent — they'll join when they sign up with that email")
    setEmail("")
    router.refresh()
  }

  async function remove(target: { memberId?: string; inviteId?: string }, label: string) {
    if (!confirm(`Remove ${label}?`)) return
    const result = await removeTeamEntryAction(storeId, target)
    if ("error" in result) return toast.error(result.error)
    toast.success("Removed")
    router.refresh()
  }

  const canRemove = (m: Member) => m.role !== "OWNER" && m.userId !== myUserId && (m.role !== "ADMIN" || myRole === "OWNER")

  return (
    <div className="space-y-6">
      <form onSubmit={invite} className="space-y-4 rounded-2xl border border-stone-200 bg-white p-5">
        <h2 className="font-semibold text-stone-950">Add someone</h2>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Their email address"
          className="h-11 w-full rounded-lg border border-stone-200 px-3 text-sm focus:border-stone-400 focus:outline-none"
        />
        <div className="grid gap-2 sm:grid-cols-2">
          {roles.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`rounded-xl border p-4 text-left ${role === r ? "border-stone-950 ring-1 ring-stone-950" : "border-stone-200"}`}
            >
              <span className="block text-sm font-semibold text-stone-950">{labels[r]}</span>
              <span className="block text-xs text-stone-500">{descriptions[r]}</span>
            </button>
          ))}
        </div>
        <button
          disabled={busy}
          className="h-11 rounded-full bg-stone-950 px-6 text-sm font-semibold text-white hover:bg-stone-800 disabled:opacity-60"
        >
          {busy ? "Adding…" : "Add to team"}
        </button>
      </form>

      <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
        <h2 className="border-b border-stone-100 px-5 py-4 font-semibold text-stone-950">Your team</h2>
        <ul className="divide-y divide-stone-100">
          {members.map((m) => (
            <li key={m.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-stone-900">
                  {m.name || m.email}
                  {m.userId === myUserId && <span className="text-stone-400"> (you)</span>}
                </p>
                <p className="truncate text-xs text-stone-500">{m.email}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-700">{labels[m.role]}</span>
                {canRemove(m) && (
                  <button onClick={() => remove({ memberId: m.id }, m.name || m.email || "this person")} className="text-xs text-red-600 hover:underline">
                    Remove
                  </button>
                )}
              </div>
            </li>
          ))}
          {invites.map((i) => (
            <li key={i.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-stone-900">{i.email}</p>
                <p className="text-xs text-amber-700">Invited · waiting for them to sign up</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-700">{labels[i.role]}</span>
                <button onClick={() => remove({ inviteId: i.id }, i.email)} className="text-xs text-red-600 hover:underline">
                  Cancel
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
