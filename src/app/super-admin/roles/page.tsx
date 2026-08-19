import { db } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldCheck } from "lucide-react"

export default async function AdminRolesPage() {
  const superAdmins = await db.user.findMany({
    where: { platformRole: "SUPER_ADMIN" },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-blue-500" />
            Admin Roles
          </h2>
          <p className="text-slate-500 mt-1">Manage platform-level access and Super Admin permissions.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-0 shadow-sm bg-white overflow-hidden rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-6 pt-6">
            <CardTitle className="text-sm font-medium text-slate-500">Total Super Admins</CardTitle>
            <ShieldCheck className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="text-3xl font-extrabold text-slate-900">{superAdmins.length}</div>
            <p className="text-xs font-medium text-slate-500 mt-1">Users with full platform access</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm bg-white overflow-hidden rounded-xl">
        <CardHeader className="px-6 py-5 border-b border-slate-100 bg-slate-50/30">
          <CardTitle className="text-lg font-bold text-slate-900">Super Admin Users</CardTitle>
          <p className="text-sm text-slate-500 mt-1">These users have unrestricted access to the entire Shopora platform dashboard.</p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs font-bold text-slate-400 bg-slate-50/50 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">User Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4 text-right">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {superAdmins.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500 font-medium">
                      No Super Admins found.
                    </td>
                  </tr>
                ) : (
                  superAdmins.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4 font-bold text-slate-900">{user.name || "N/A"}</td>
                      <td className="px-6 py-4 font-medium text-slate-600">{user.email}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 ring-1 ring-inset ring-blue-600/20">
                          {user.platformRole}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-slate-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
