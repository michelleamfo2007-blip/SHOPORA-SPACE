import { requireStoreManagerPage, getStoreAccess } from "@/lib/store-access"
import { ROLE_DESCRIPTIONS, ROLE_LABELS } from "@/lib/store-roles"
import { listTeam } from "@/lib/team"
import { TeamManager } from "./TeamManager"
import { storeHasFeature } from "@/lib/store-plan"
import { UpgradeCard } from "@/components/dashboard/UpgradeCard"

export default async function TeamPage({ params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params
  await requireStoreManagerPage(storeId)
  const access = await getStoreAccess(storeId)
  if ("error" in access) return null
  const [team, allowed] = await Promise.all([listTeam(storeId), storeHasFeature(storeId, "team")])
  if (!allowed) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 pb-10">
        <h1 className="text-3xl font-semibold tracking-tight text-stone-950">Team</h1>
        <UpgradeCard storeId={storeId} feature="team" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-10">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-stone-950">Team</h1>
        <p className="mt-1 text-stone-500">Give staff their own login so they can help with orders without seeing your money settings.</p>
      </div>
      <TeamManager
        storeId={storeId}
        myRole={access.member.role}
        myUserId={access.userId}
        labels={ROLE_LABELS}
        descriptions={ROLE_DESCRIPTIONS}
        members={team.members.map((m) => ({
          id: m.id,
          role: m.role,
          userId: m.user.id,
          name: m.user.name,
          email: m.user.email,
        }))}
        invites={team.invites.map((i) => ({ id: i.id, email: i.email, role: i.role }))}
      />
    </div>
  )
}
