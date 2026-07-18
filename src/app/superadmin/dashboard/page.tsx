import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { format } from "date-fns"
import AddAgencyDialog from "./AddAgencyDialog"
import CancelSubscriptionButton from "./CancelSubscriptionButton"
import ManageSubscriptionDialog from "./ManageSubscriptionDialog"
import AnalyticsCharts from "./AnalyticsCharts"
import ActivityFeed from "./ActivityFeed"
import ExportCsvButton from "./ExportCsvButton"
import AgencySearch from "./AgencySearch"
import MrrArrWidget from "@/components/superadmin/MrrArrWidget"
import { ShieldCheck, Search, Download, Building2, Zap, AlertCircle, MoreVertical } from "lucide-react"
import SuperAdminSidebarLayout, { TabData } from "./SuperAdminSidebarLayout"
import AgencyCard from "./AgencyCard"

export default async function SuperAdminDashboard(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams
  const q = (searchParams?.q as string)?.toLowerCase() || ""
  const initialTab = (searchParams?.tab as string) || "overview"

  const session = await auth()
  const adminUser = session?.user?.id
    ? await prisma.user.findUnique({ where: { id: session.user.id } })
    : null;
  const adminName = adminUser?.name || session?.user?.name || "Super Admin"

  const tenants = await prisma.tenant.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      users: { where: { role: "ADMIN" } },
      _count: {
        select: { clientProfiles: true }
      }
    }
  })

  // Basic check for Webhook Health
  const webhookHealthy = !!process.env.RAZORPAY_KEY_ID

  const filteredTenants = tenants.filter(t =>
    t.name.toLowerCase().includes(q) || t.id.toLowerCase().includes(q)
  )

  const tabs: TabData[] = [
    {
      id: "overview",
      label: "Overview",
      content: (
        <div className="flex flex-col gap-10">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 2xl:gap-6">
            <MrrArrWidget />

            <div className="bg-white dark:bg-[#111111] rounded-[16px] border border-[#E9EDF4] dark:border-[#2A2E35] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between min-h-[140px] relative group">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-[22px] font-medium text-[#0F172A] dark:text-white tabular-nums tracking-tight">
                      {tenants.length}
                    </h3>
                    <p className="text-[13px] font-normal text-[#64748B] dark:text-[#94A3B8] mt-0.5">Total Companies</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-normal text-[#64748B] dark:text-[#94A3B8]">Registered Platforms</span>
                  <span className="text-[12px] font-medium text-[#64748B] dark:text-[#94A3B8]">
                    100%
                  </span>
                </div>
                <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full w-[100%]"></div>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-[#111111] rounded-[16px] border border-[#E9EDF4] dark:border-[#2A2E35] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between min-h-[140px] relative group">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-[22px] font-medium text-[#0F172A] dark:text-white tabular-nums tracking-tight">
                      {tenants.filter(t => t.subscriptionStatus === "ACTIVE").length}
                    </h3>
                    <p className="text-[13px] font-normal text-[#64748B] dark:text-[#94A3B8] mt-0.5">Active Subs</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-normal text-[#64748B] dark:text-[#94A3B8]">Paying Customers</span>
                  <span className="text-[12px] font-medium text-[#64748B] dark:text-[#94A3B8]">
                    {tenants.length > 0 ? Math.round((tenants.filter(t => t.subscriptionStatus === "ACTIVE").length / tenants.length) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full" 
                    style={{ width: `${tenants.length > 0 ? Math.round((tenants.filter(t => t.subscriptionStatus === "ACTIVE").length / tenants.length) * 100) : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-[#111111] rounded-[16px] border border-[#E9EDF4] dark:border-[#2A2E35] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between min-h-[140px] relative group">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center text-rose-600 dark:text-rose-400">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-[22px] font-medium text-[#0F172A] dark:text-white tabular-nums tracking-tight">
                      {tenants.filter(t => t.subscriptionStatus === "EXPIRED").length}
                    </h3>
                    <p className="text-[13px] font-normal text-[#64748B] dark:text-[#94A3B8] mt-0.5">Expired Subs</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-normal text-[#64748B] dark:text-[#94A3B8]">Needs Action</span>
                  <span className="text-[12px] font-medium text-[#64748B] dark:text-[#94A3B8]">
                    {tenants.length > 0 ? Math.round((tenants.filter(t => t.subscriptionStatus === "EXPIRED").length / tenants.length) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-rose-500 rounded-full" 
                    style={{ width: `${tenants.length > 0 ? Math.round((tenants.filter(t => t.subscriptionStatus === "EXPIRED").length / tenants.length) * 100) : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6 mb-10">
            <div className="w-full">
              <AnalyticsCharts />
            </div>
            <div className="w-full h-[500px]">
              <ActivityFeed />
            </div>
          </div>
        </div>
      )
    },
    {
      id: "agencies",
      label: "Companies",
      content: (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between bg-white dark:bg-[#111111] p-6 rounded-[24px] border border-[#E9EDF4] dark:border-[#2A2E35] shadow-sm gap-4 xl:gap-6">
            <div className="w-full xl:w-auto">
              <h2 className="text-2xl font-bold text-[#0F172A] dark:text-white font-sans tracking-tight mb-1">Companies Directory</h2>
              <p className="text-[14px] text-[#64748B] dark:text-[#94A3B8] font-medium max-w-md">Manage all registered companies, their subscriptions, and limits.</p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto mt-2 xl:mt-0">
              <div className="w-full sm:w-auto">
                <AgencySearch />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
                <ExportCsvButton tenants={tenants} />
                <AddAgencyDialog />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 2xl:gap-8">
            {filteredTenants.map((tenant) => {
              const isExpired = tenant.subscriptionStatus === "EXPIRED" || !!(tenant.subscriptionEnd && new Date(tenant.subscriptionEnd) < new Date());
              return (
                <AgencyCard key={tenant.id} tenant={tenant} isExpired={isExpired} />
              )
            })}

            {filteredTenants.length === 0 && (
              <div className="col-span-1 xl:col-span-2 flex flex-col items-center justify-center p-16 text-center bg-white dark:bg-[#111111] rounded-[24px] border border-dashed border-[#E9EDF4] dark:border-[#2A2E35]">
                <p className="text-lg font-bold text-[#0F172A] dark:text-white mb-2 tracking-tight">No companies found.</p>
                <p className="text-sm font-medium">Try adjusting your search or add a new company.</p>
              </div>
            )}
          </div>
        </div>
      )
    }
  ]

  return (
    <SuperAdminSidebarLayout
      tabs={tabs}
      initialTab={initialTab}
      adminName={adminName}
      adminUser={adminUser}
      webhookHealthy={webhookHealthy}
    />
  )
}
