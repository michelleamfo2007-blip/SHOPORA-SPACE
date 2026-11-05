import { requireStoreManagerPage } from "@/lib/store-access"

/** Layout for dashboard sections staff can't open (money, settings, reports, team). */
export default async function ManagerOnlyLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<unknown>
}) {
  const { storeId } = (await params) as { storeId: string }
  await requireStoreManagerPage(storeId)
  return children
}
