import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Store, Users, ShoppingCart, DollarSign, AlertCircle, Clock } from "lucide-react";

export default async function SuperAdminOverview() {
  // We'll fetch basic metrics here. In a production app with huge data,
  // these should be cached or aggregated in a separate table.
  const [
    totalStores, 
    totalUsers, 
    totalOrders, 
    pendingApprovals,
    activeSubs,
    trialSubs,
    revenueAgg
  ] = await Promise.all([
    db.store.count(),
    db.user.count(),
    db.order.count(),
    db.waitlistEntry.count({ where: { status: "PENDING" } }),
    db.subscription.count({ where: { status: "ACTIVE" } }),
    db.subscription.count({ where: { status: "TRIAL" } }),
    db.subscriptionPayment.aggregate({
      _sum: { amount: true },
      where: { status: "APPROVED" }
    })
  ]);

  const platformRevenue = revenueAgg._sum.amount || 0;

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <Store className="w-8 h-8 text-blue-500" />
            Platform Overview
          </h2>
          <p className="text-slate-500 mt-1">Welcome back. Here is what's happening on Shopora today.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-0 shadow-sm bg-white overflow-hidden rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-6 pt-6">
            <CardTitle className="text-sm font-medium text-slate-500">Total Sellers</CardTitle>
            <Store className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="text-3xl font-extrabold text-slate-900">{totalStores}</div>
            <p className="text-xs font-medium text-slate-500 mt-1">Active stores on platform</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white overflow-hidden rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-6 pt-6">
            <CardTitle className="text-sm font-medium text-slate-500">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="text-3xl font-extrabold text-slate-900">{totalUsers}</div>
            <p className="text-xs font-medium text-slate-500 mt-1">Registered users</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white overflow-hidden rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-6 pt-6">
            <CardTitle className="text-sm font-medium text-slate-500">Active Subs</CardTitle>
            <ShoppingCart className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="text-3xl font-extrabold text-slate-900">{activeSubs}</div>
            <p className="text-xs font-medium text-slate-500 mt-1">Paying stores</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white overflow-hidden rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-6 pt-6">
            <CardTitle className="text-sm font-medium text-slate-500">Free Trials</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="text-3xl font-extrabold text-slate-900">{trialSubs}</div>
            <p className="text-xs font-medium text-slate-500 mt-1">Stores on trial</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white overflow-hidden rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-6 pt-6">
            <CardTitle className="text-sm font-medium text-slate-500">Platform Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-teal-500" />
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="text-3xl font-extrabold text-slate-900">₵{platformRevenue.toFixed(2)}</div>
            <p className="text-xs font-medium text-slate-500 mt-1">From subscriptions</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white overflow-hidden rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-6 pt-6">
            <CardTitle className="text-sm font-medium text-slate-500">Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="text-3xl font-extrabold text-slate-900">{pendingApprovals}</div>
            <p className="text-xs font-medium text-slate-500 mt-1">Stores waiting for review</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white overflow-hidden rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-6 pt-6">
            <CardTitle className="text-sm font-medium text-slate-500">Active Disputes</CardTitle>
            <AlertCircle className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="text-3xl font-extrabold text-slate-900">0</div>
            <p className="text-xs font-medium text-slate-500 mt-1">Requires attention</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
