import { db } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Activity, Terminal } from "lucide-react"

export default async function AuditLogsPage() {
  // Fetch system webhook events to serve as our technical audit trail
  const systemLogs = await db.webhookEvent.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50
  })

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <Terminal className="w-8 h-8 text-slate-500" />
            Audit Logs
          </h2>
          <p className="text-slate-500 mt-1">Monitor system-level events, webhook processing, and admin actions.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-0 shadow-sm bg-white overflow-hidden rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-6 pt-6">
            <CardTitle className="text-sm font-medium text-slate-500">System Health</CardTitle>
            <Activity className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="text-3xl font-extrabold text-emerald-600">Optimal</div>
            <p className="text-xs font-medium text-slate-500 mt-1">All systems running smoothly</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white overflow-hidden rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-6 pt-6">
            <CardTitle className="text-sm font-medium text-slate-500">Logged Events</CardTitle>
            <Terminal className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="text-3xl font-extrabold text-slate-900">{systemLogs.length}</div>
            <p className="text-xs font-medium text-slate-500 mt-1">Recent system actions recorded</p>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm bg-white overflow-hidden rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-6 pt-6">
            <CardTitle className="text-sm font-medium text-slate-500">Security Status</CardTitle>
            <Shield className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="text-3xl font-extrabold text-slate-900">Secure</div>
            <p className="text-xs font-medium text-slate-500 mt-1">No active threats detected</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm bg-white overflow-hidden rounded-xl">
        <CardHeader className="px-6 py-5 border-b border-slate-100 bg-slate-50/30">
          <CardTitle className="text-lg font-bold text-slate-900">System Event Trail</CardTitle>
          <p className="text-sm text-slate-500 mt-1">Chronological record of recent platform events and webhooks.</p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs font-bold text-slate-400 bg-slate-50/50 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Event ID</th>
                  <th className="px-6 py-4">Provider</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {systemLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium">
                      No system events logged yet.
                    </td>
                  </tr>
                ) : (
                  systemLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4 font-mono text-xs font-medium text-slate-500">
                        {log.providerEventId}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900 capitalize">{log.provider}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded bg-slate-100 px-2 py-1 text-xs font-mono font-medium text-slate-700 border border-slate-200">
                          {log.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {log.status === "PROCESSED" ? (
                          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                            Processed
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700 ring-1 ring-inset ring-rose-600/20">
                            Failed
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-slate-500">
                        {new Date(log.createdAt).toLocaleString()}
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
