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
import { ShieldCheck, Search, Download, Building2, Zap, AlertCircle } from "lucide-react"
import SuperAdminSidebarLayout, { TabData } from "./SuperAdminSidebarLayout"
import AgencyCard from "./AgencyCard"

export default async function SuperAdminDashboard(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams
  const q = (searchParams?.q as string)?.toLowerCase() || ""
  const initialTab = (searchParams?.tab as string) || "overview"

  const session = await auth()
  const adminName = session?.user?.name || "Super Admin"

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
            
            <div className="bg-white dark:bg-[#111111] border border-[#E9EDF4] dark:border-[#2A2E35] rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-lg hover:border-indigo-500/30 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-[16px] bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-500/20 dark:to-indigo-500/5 flex items-center justify-center shadow-inner border border-indigo-100 dark:border-indigo-500/20 relative">
                  <div className="absolute inset-0 bg-indigo-500 blur-md opacity-20 rounded-[16px]"></div>
                  <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400 relative z-10" />
                </div>
              </div>
              <h3 className="text-3xl font-sans font-bold text-[#0F172A] dark:text-white tabular-nums tracking-tight mt-1">{tenants.length}</h3>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#888] mt-2 mb-0.5">Total Companies</p>
              <p className="text-[13px] font-medium text-[#64748B] dark:text-[#666]">Registered Platforms</p>
            </div>
            
            <div className="bg-white dark:bg-[#111111] border border-[#E9EDF4] dark:border-[#2A2E35] rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-lg hover:border-emerald-500/30 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-[16px] bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-500/20 dark:to-emerald-500/5 flex items-center justify-center shadow-inner border border-emerald-100 dark:border-emerald-500/20 relative">
                  <div className="absolute inset-0 bg-emerald-500 blur-md opacity-20 rounded-[16px]"></div>
                  <Zap className="w-5 h-5 text-emerald-600 dark:text-emerald-400 relative z-10" />
                </div>
              </div>
              <h3 className="text-3xl font-sans font-bold text-[#0F172A] dark:text-white tabular-nums tracking-tight mt-1">
                {tenants.filter(t => t.subscriptionStatus === "ACTIVE").length}
              </h3>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#888] mt-2 mb-0.5">Active Subs</p>
              <p className="text-[13px] font-medium text-[#64748B] dark:text-[#666]">Paying Customers</p>
            </div>
            
            <div className="bg-white dark:bg-[#111111] border border-[#E9EDF4] dark:border-[#2A2E35] rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-lg hover:border-rose-500/30 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 dark:bg-rose-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-[16px] bg-gradient-to-br from-rose-50 to-rose-100/50 dark:from-rose-500/20 dark:to-rose-500/5 flex items-center justify-center shadow-inner border border-rose-100 dark:border-rose-500/20 relative">
                  <div className="absolute inset-0 bg-rose-500 blur-md opacity-20 rounded-[16px]"></div>
                  <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 relative z-10" />
                </div>
              </div>
              <h3 className="text-3xl font-sans font-bold text-rose-600 dark:text-rose-500 tabular-nums tracking-tight mt-1">
                {tenants.filter(t => t.subscriptionStatus === "EXPIRED").length}
              </h3>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#888] mt-2 mb-0.5">Expired Subs</p>
              <p className="text-[13px] font-medium text-[#64748B] dark:text-[#666]">Needs Action</p>
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
      webhookHealthy={webhookHealthy} 
    />
  )
}



