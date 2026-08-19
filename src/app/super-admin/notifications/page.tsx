import { Bell } from "lucide-react";

export default function notificationsPage() {
  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <Bell className="w-8 h-8 text-rose-500" />
            Notifications
          </h2>
          <p className="text-slate-500 mt-1">This module is currently under construction.</p>
        </div>
      </div>
    </div>
  );
}
