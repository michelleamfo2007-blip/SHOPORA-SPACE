import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { ApproveButton } from "./WaitlistClient";
import { Users, UserPlus } from "lucide-react"

export default async function SuperAdminWaitlistPage() {
  const entries = await db.waitlistEntry.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <UserPlus className="w-8 h-8 text-indigo-500" />
            Waitlist Applications
          </h2>
          <p className="text-slate-500 mt-1">Manage incoming vendor requests and invite them to onboard.</p>
        </div>
      </div>

      <div className="bg-white border-0 shadow-sm overflow-hidden rounded-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs font-bold text-slate-400 bg-slate-50/50 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Date Applied</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500 font-medium">
                    No waitlist entries found.
                  </td>
                </tr>
              ) : (
                entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 font-bold text-slate-900">{entry.email}</td>
                    <td className="px-6 py-4 font-medium text-slate-500">
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {entry.status === "PENDING" ? (
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600 ring-1 ring-inset ring-slate-500/10">
                          Pending
                        </span>
                      ) : entry.status === "INVITED" ? (
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 ring-1 ring-inset ring-blue-600/20">
                          Invited
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                          {entry.status}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {(entry.status === "PENDING" || entry.status === "INVITED") && (
                        <ApproveButton entryId={entry.id} />
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
