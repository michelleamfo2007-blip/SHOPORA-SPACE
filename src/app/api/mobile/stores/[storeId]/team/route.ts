import { requireMobileStoreManager } from "@/lib/mobile-auth"
import { ROLE_DESCRIPTIONS, ROLE_LABELS } from "@/lib/store-roles"
import { inviteTeamMember, listTeam, removeTeamEntry } from "@/lib/team"

export async function GET(req: Request, { params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params
  const access = await requireMobileStoreManager(req, storeId)
  if ("error" in access) return Response.json({ error: access.error }, { status: access.status })

  const team = await listTeam(storeId)
  return Response.json({ myRole: access.role, roles: { labels: ROLE_LABELS, descriptions: ROLE_DESCRIPTIONS }, ...team })
}

export async function POST(req: Request, { params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params
  const access = await requireMobileStoreManager(req, storeId)
  if ("error" in access) return Response.json({ error: access.error }, { status: access.status })

  const body = await req.json().catch(() => ({}))
  const result = await inviteTeamMember(
    storeId,
    { id: access.user.id, role: access.role, name: access.user.name },
    { email: String(body.email ?? ""), role: String(body.role ?? "STAFF") }
  )
  if ("error" in result) return Response.json({ error: result.error }, { status: 400 })
  return Response.json(result)
}

export async function DELETE(req: Request, { params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params
  const access = await requireMobileStoreManager(req, storeId)
  if ("error" in access) return Response.json({ error: access.error }, { status: access.status })

  const search = new URL(req.url).searchParams
  const result = await removeTeamEntry(
    storeId,
    { id: access.user.id, role: access.role },
    { memberId: search.get("memberId") ?? undefined, inviteId: search.get("inviteId") ?? undefined }
  )
  if ("error" in result) return Response.json({ error: result.error }, { status: 400 })
  return Response.json(result)
}
