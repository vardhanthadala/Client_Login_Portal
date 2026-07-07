import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import SignOutButton from "@/app/admin/dashboard/SignOutButton"
import { format } from "date-fns"
import AddAgencyDialog from "./AddAgencyDialog"
import CancelSubscriptionButton from "./CancelSubscriptionButton"
import ManageSubscriptionDialog from "./ManageSubscriptionDialog"
import AnalyticsCharts from "./AnalyticsCharts"
import ActivityFeed from "./ActivityFeed"
import ExportCsvButton from "./ExportCsvButton"
import AgencySearch from "./AgencySearch"
import MrrArrWidget from "@/components/superadmin/MrrArrWidget"
import { ShieldCheck } from "lucide-react"

export default async function SuperAdminDashboard(props: { searchParams: Promise<{ q?: string }> }) {
  const searchParams = await props.searchParams
  const q = searchParams?.q?.toLowerCase() || ""

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
  // If razorpay environment keys are set, we assume Webhook is configured (or we can just show a green dot for now)
  const webhookHealthy = !!process.env.RAZORPAY_KEY_ID

  const filteredTenants = tenants.filter(t => 
    t.name.toLowerCase().includes(q) || t.id.toLowerCase().includes(q)
  )

  return (
    <div className="min-h-screen w-full px-4 md:px-8 lg:px-12 xl:px-24 pt-12 pb-32 bg-[#FAFAFA] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100/40 via-[#FAFAFA] to-[#FAFAFA]">
      <div className="max-w-screen-2xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-4xl sm:text-5xl text-[#0F172A] font-sans font-bold tracking-tight">
                Super Admin
              </h1>
              <span className="px-2.5 py-1 rounded-md bg-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 mt-2">
                <ShieldCheck className="w-3.5 h-3.5" /> Enterprise
              </span>
            </div>
            <p className="text-muted-foreground mt-4 text-base leading-relaxed max-w-2xl">
              Manage agencies, subscriptions, and platform access.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 items-center w-full sm:w-auto">
            {webhookHealthy ? (
              <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-sm font-medium border border-green-200">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Webhooks Healthy
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-red-50 text-red-700 px-3 py-1.5 rounded-full text-sm font-medium border border-red-200">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                Webhooks Offline
              </div>
            )}
            <SignOutButton />
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <MrrArrWidget />
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">Total Agencies</p>
            <h3 className="text-2xl font-bold text-[#0F172A] mt-0.5">{tenants.length}</h3>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">Active Subscriptions</p>
            <h3 className="text-2xl font-bold text-[#0F172A] mt-0.5">
              {tenants.filter(t => t.subscriptionStatus === "ACTIVE").length}
            </h3>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">Expired Subscriptions</p>
            <h3 className="text-2xl font-bold text-red-600 mt-0.5">
              {tenants.filter(t => t.subscriptionStatus === "EXPIRED").length}
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-10">
          <div className="xl:col-span-2">
            <AnalyticsCharts />
          </div>
          <div className="xl:col-span-1">
            <ActivityFeed />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <h2 className="text-xl font-bold text-[#0F172A]">Agencies Directory</h2>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <AgencySearch />
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <ExportCsvButton tenants={tenants} />
              <AddAgencyDialog />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {filteredTenants.map((tenant) => {
            const isExpired = tenant.subscriptionStatus === "EXPIRED" || (tenant.subscriptionEnd && new Date(tenant.subscriptionEnd) < new Date());
            return (
              <Card key={tenant.id} id={`tenant-${tenant.id}`} className="bg-white border-[#E5E7EB] rounded-2xl shadow-sm hover:shadow-md scroll-m-24 transition-all">
                <CardHeader className="flex flex-col sm:flex-row justify-between items-start pb-4">
                  <div>
                    <CardTitle className="text-xl font-bold text-[#0F172A]">
                      {tenant.name}
                    </CardTitle>
                    <CardDescription className="mt-2 text-sm text-gray-500 font-mono">
                      ID: {tenant.id}
                    </CardDescription>
                  </div>
                  <div className="flex items-center mt-2 sm:mt-0 gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${isExpired ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {isExpired ? "Expired" : "Active"}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-blue-100 text-blue-700">
                      {tenant.subscriptionPlan.replace('_', ' ')}
                    </span>
                    {tenant.cancelAtPeriodEnd ? (
                      <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-orange-100 text-orange-700">
                        Cancels Soon
                      </span>
                    ) : (
                      !isExpired && tenant.subscriptionStatus !== "CANCELLED" && (
                        <div className="flex gap-2 items-center">
                          <ManageSubscriptionDialog 
                            tenantId={tenant.id} 
                            currentPlan={tenant.subscriptionPlan} 
                            currentEnd={tenant.subscriptionEnd} 
                          />
                          <CancelSubscriptionButton tenantId={tenant.id} />
                        </div>
                      )
                    )}
                  </div>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-t border-[#F1F5F9]">
                    <div>
                      <p className="text-xs text-gray-400">Total Clients</p>
                      <p className="font-medium">{tenant._count.clientProfiles}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Admin Email</p>
                      <p className="font-medium truncate">{tenant.users[0]?.email || "None"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Sub Starts</p>
                      <p className="font-medium">{tenant.subscriptionStart ? format(new Date(tenant.subscriptionStart), "MMM d, yyyy") : "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Sub Ends</p>
                      <p className="font-medium">{tenant.subscriptionEnd ? format(new Date(tenant.subscriptionEnd), "MMM d, yyyy") : "-"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}

          {filteredTenants.length === 0 && (
            <div className="py-16 text-center text-muted-foreground bg-muted/30 rounded-2xl border border-dashed border-border">
              <p className="text-lg font-medium text-foreground mb-2">No agencies found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}



