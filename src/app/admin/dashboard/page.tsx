import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import InviteClientModal from "./InviteClientModal"
import DeleteClientButton from "./DeleteClientButton"
import StatusDropdown from "@/components/StatusDropdown"
import OutstandingInvoicesWidget, { OverdueInvoice } from "@/components/admin/OutstandingInvoicesWidget"
import StorageUsageWidget from "@/components/admin/StorageUsageWidget"
import { Bell } from "lucide-react"
import { GoPeople } from "react-icons/go"
import { GrInProgress } from "react-icons/gr"
import { LuMessageCircle } from "react-icons/lu"
import { AlertCircle, DollarSign, ArrowRight } from "lucide-react"
import AdminAnalyticsCharts from "./AdminAnalyticsCharts"
import { format, subMonths, isSameMonth } from "date-fns"
import AdminSidebarLayout, { TabData } from "./AdminSidebarLayout"
import NotificationsTab from "@/components/admin/NotificationsTab"

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }> | { [key: string]: string | string[] | undefined }
}

export default async function AdminDashboard({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const initialTab = (resolvedSearchParams?.tab as string) || "overview";

  const session = await auth()
  const tenantId = session?.user?.tenantId

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId as string },
    select: { razorpayKeySecret: true, awsSecretAccessKey: true }
  })

  const isSetupComplete = !!(tenant?.razorpayKeySecret && tenant?.awsSecretAccessKey)

  const clients = await prisma.user.findMany({
    where: { 
      role: "CLIENT",
      tenantId: tenantId
    },
    orderBy: { createdAt: "desc" },
    include: {
      clientProfile: {
        include: {
          messages: {
            where: { isRead: false },
            select: { id: true, senderId: true }
          },
          invoices: {
            select: { id: true, title: true, amount: true, currency: true, status: true, dueDate: true, createdAt: true }
          }
        }
      }
    },
  })

  // For admin, we need the admin user ID to filter out admin's own messages
  const adminUserId = session?.user?.id

  // Calculate total earnings grouped by currency (only PAID invoices)
  const earningsByCurrency: Record<string, number> = {}
  clients.forEach(client => {
    (client.clientProfile?.invoices || [])
      .filter(inv => inv.status === "PAID")
      .forEach(inv => {
        const currency = inv.currency || "USD"
        earningsByCurrency[currency] = (earningsByCurrency[currency] || 0) + inv.amount
      })
  })

  // Calculate overdue invoices
  const overdueInvoices: OverdueInvoice[] = []
  const now = new Date()
  clients.forEach(client => {
    if (!client.clientProfile) return
    const profileInvoices = client.clientProfile.invoices || []
    profileInvoices.forEach(inv => {
      const isOverdue = inv.status === "OVERDUE" || (inv.status === "SENT" && inv.dueDate && new Date(inv.dueDate) < now)
      if (isOverdue) {
        overdueInvoices.push({
          id: inv.id,
          title: inv.title,
          amount: inv.amount,
          currency: inv.currency,
          dueDate: inv.dueDate ? inv.dueDate.toISOString() : null,
          status: inv.status,
          clientName: client.clientProfile!.companyName || client.clientProfile!.clientName || "Unknown Client",
          clientProfileId: client.clientProfile!.id,
          userId: client.id
        })
      }
    })
  })

  // Format currency properly
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)
  }

  const totalEarningsDisplay = Object.entries(earningsByCurrency).length > 0
    ? Object.entries(earningsByCurrency).map(([curr, amt]) => formatCurrency(amt, curr)).join(' + ')
    : formatCurrency(0, "USD")

  // Generate Chart Data for the last 6 months
  const chartData = Array.from({ length: 6 }).map((_, i) => {
    const d = subMonths(new Date(), 5 - i)
    return {
      month: format(d, 'MMM'),
      date: d,
      earnings: 0,
      clients: 0
    }
  })

  clients.forEach(client => {
    // Client Growth
    const clientDate = new Date(client.createdAt)
    const clientMonth = chartData.find(m => isSameMonth(m.date, clientDate))
    if (clientMonth) clientMonth.clients += 1

    // Earnings Growth (only PAID)
    ;(client.clientProfile?.invoices || [])
      .filter(inv => inv.status === "PAID")
      .forEach(inv => {
      if (inv.createdAt) {
        const invDate = new Date(inv.createdAt)
        const invMonth = chartData.find(m => isSameMonth(m.date, invDate))
        if (invMonth) {
          invMonth.earnings += inv.amount
        }
      }
    })
  })

  const tabs: TabData[] = [
    {
      id: "overview",
      label: "Overview",
      content: (
        <div className="flex flex-col gap-10">
          {!isSetupComplete && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-sm">
              <div className="bg-amber-100 p-2 rounded-full shrink-0 hidden sm:block">
                <AlertCircle className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-amber-900 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 sm:hidden" /> Action Required: Complete Your Setup
                </h3>
                <p className="text-sm text-amber-800 mt-1">
                  You must configure your <strong>Payment Gateway (Razorpay)</strong> and <strong>AWS S3 Storage (BYOS)</strong> before inviting clients. 
                  Your clients will be completely blocked from paying invoices or uploading files until this is configured.
                </p>
              </div>
              <Link href="/admin/settings" className="shrink-0 w-full sm:w-auto mt-3 sm:mt-0">
                <Button size="sm" className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold">
                  Go to Settings
                </Button>
              </Link>
            </div>
          )}

          {/* Premium KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Clients", value: clients.length, subtext: "Active Accounts", icon: GoPeople, color: "text-blue-500", bg: "bg-blue-500/10" },
              { label: "Total Earnings", value: totalEarningsDisplay, subtext: "Lifetime Volume", icon: DollarSign, color: "text-green-500", bg: "bg-green-500/10" },
              { label: "In Progress", value: clients.filter(c => c.clientProfile && c.clientProfile.status !== "COMPLETED").length, subtext: "Active Projects", icon: GrInProgress, color: "text-amber-500", bg: "bg-amber-500/10" },
              { label: "Unread Messages", value: clients.reduce((acc, client) => acc + (client.clientProfile?.messages || []).filter(m => m.senderId !== adminUserId).length, 0), subtext: "Requires Attention", icon: LuMessageCircle, color: "text-purple-500", bg: "bg-purple-500/10" }
            ].map((stat, i) => (
              <div key={i} className="bg-white dark:bg-[#111111] border border-[#E9EDF4] dark:border-[#2A2E35] rounded-[24px] p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group" style={{ animationDelay: `${i * 80}ms` }}>
                <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#888] mb-0.5">{stat.label}</p>
                <h3 className="text-xl font-sans font-bold text-[#0F172A] dark:text-white tabular-nums tracking-tight mb-0.5">{stat.value}</h3>
                <p className="text-[11px] font-medium text-[#64748B] dark:text-[#666]">{stat.subtext}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StorageUsageWidget />
            <div className="h-full">
              <OutstandingInvoicesWidget invoices={overdueInvoices} />
            </div>
          </div>

          <AdminAnalyticsCharts data={chartData} />
        </div>
      )
    },
    {
      id: "clients",
      label: "Clients",
      content: (
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between bg-white dark:bg-[#111111] p-6 rounded-[24px] border border-[#E9EDF4] dark:border-[#2A2E35] shadow-sm">
            <div>
              <h2 className="text-2xl font-bold text-[#0F172A] dark:text-white font-sans tracking-tight mb-1">Client Roster</h2>
              <p className="text-[14px] text-[#64748B] dark:text-[#94A3B8] font-medium max-w-md">Manage all your agency clients, their statuses, and earnings.</p>
            </div>
            <InviteClientModal />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {clients.map((client) => {
              const unreadCount = (client.clientProfile?.messages || []).filter(m => m.senderId !== adminUserId).length
              
              const clientEarningsByCurrency: Record<string, number> = {}
              ;(client.clientProfile?.invoices || [])
                .filter(inv => inv.status === "PAID")
                .forEach(inv => {
                const currency = inv.currency || "USD"
                clientEarningsByCurrency[currency] = (clientEarningsByCurrency[currency] || 0) + inv.amount
              })
              const clientEarningsDisplay = Object.entries(clientEarningsByCurrency).length > 0
                ? Object.entries(clientEarningsByCurrency).map(([curr, amt]) => formatCurrency(amt, curr)).join(' + ')
                : formatCurrency(0, "USD")

              return (
                <div key={client.id} className="bg-white dark:bg-[#111111] border border-[#E9EDF4] dark:border-[#2A2E35] rounded-[24px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:border-[#5A52FF]/30 transition-all duration-200 min-w-0 overflow-hidden flex flex-col group">
                  <div className="flex flex-col sm:flex-row justify-between items-start space-y-4 sm:space-y-0 p-6 sm:p-8 pb-4 gap-3 relative">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-xl sm:text-2xl font-sans font-bold text-[#0F172A] dark:text-white flex flex-wrap items-center gap-2 tracking-tight">
                        <span className="break-words w-full sm:w-auto">{client.clientProfile?.companyName || "Unknown Company"}</span>
                        {unreadCount > 0 && (
                          <span className="relative flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-[11px] font-bold shrink-0" title={`${unreadCount} unread message(s)`}>
                            <Bell className="w-3 h-3" />
                            {unreadCount} new
                          </span>
                        )}
                      </h3>
                      <p className="mt-2 text-[14px] sm:text-[15px] text-[#64748B] dark:text-[#94A3B8] font-medium break-all sm:break-normal">{client.email}</p>
                    </div>
                    <div className="flex items-center shrink-0 w-full sm:w-auto justify-start sm:justify-end mt-2 sm:mt-0">
                      {client.clientProfile ? (
                        <StatusDropdown
                          clientProfileId={client.clientProfile.id}
                          currentStatus={client.clientProfile.status || "ONBOARDED"}
                        />
                      ) : (
                        <span className="px-3 py-1 rounded-full text-[11px] uppercase tracking-wider font-bold bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                          Pending
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="px-6 sm:px-8 pb-8 mt-auto">
                    <div className="flex items-center justify-between mb-6 pt-4 border-t border-[#F1F5F9] dark:border-[#222]">
                      <span className="text-[11px] font-bold text-[#64748B] dark:text-[#888] uppercase tracking-wider">Client Earnings</span>
                      <span className="text-[14px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-lg tabular-nums tracking-tight">{clientEarningsDisplay}</span>
                    </div>
                    <div className="flex flex-row items-center gap-3">
                      <Link href={`/admin/client/${client.id}`} className="w-full flex-1">
                        <Button variant="outline" className="w-full bg-[#FAFAFA] dark:bg-[#0A0A0A] border-[#E5E7EB] dark:border-[#333] hover:bg-[#5A52FF] hover:text-white hover:border-[#5A52FF] dark:hover:bg-[#5A52FF] h-12 rounded-xl text-[15px] font-semibold transition-all group-hover:border-[#5A52FF]/30">
                          View Details <ArrowRight className="w-4 h-4 ml-2 opacity-50 group-hover:opacity-100" />
                        </Button>
                      </Link>
                      <DeleteClientButton clientId={client.id} companyName={client.clientProfile?.companyName || "Unknown Company"} />
                    </div>
                  </div>
                </div>
              )
            })}

            {clients.length === 0 && (
              <div className="col-span-full py-16 text-center text-[#64748B] dark:text-[#888] bg-white dark:bg-[#111111] rounded-[24px] border border-dashed border-[#E9EDF4] dark:border-[#2A2E35]">
                <p className="text-lg font-bold text-[#0F172A] dark:text-white mb-2 tracking-tight">No clients found</p>
                <p className="text-sm font-medium">Click "Invite New Client" to get started.</p>
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      id: "notifications",
      label: "Notifications",
      content: <NotificationsTab />
    }
  ]

  return <AdminSidebarLayout tabs={tabs} clients={clients} initialTab={initialTab} adminName={session?.user?.name || "Admin"} />
}
