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
import { PremiumIcon } from "@/components/PremiumIcon"
import NotificationsTab from "@/components/admin/NotificationsTab"
import ClientRosterTable from "@/components/admin/ClientRosterTable"

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
              { label: "Total Clients", value: clients.length, subtext: "Active Accounts", icon: GoPeople, color: "text-amber-600", bg: "bg-[#FFFFFF]", cardBg: "bg-[#FDF4E7] dark:bg-[#FDF4E7]/10" },
              { label: "Total Earnings", value: totalEarningsDisplay, subtext: "Lifetime Volume", icon: DollarSign, color: "text-emerald-600", bg: "bg-[#FFFFFF]", cardBg: "bg-[#EBF7EE] dark:bg-[#EBF7EE]/10" },
              { label: "In Progress", value: clients.filter(c => c.clientProfile && c.clientProfile.status !== "COMPLETED").length, subtext: "Active Projects", icon: GrInProgress, color: "text-blue-600", bg: "bg-[#FFFFFF]", cardBg: "bg-[#F2F4FD] dark:bg-[#F2F4FD]/10" },
              { label: "Unread Messages", value: clients.reduce((acc, client) => acc + (client.clientProfile?.messages || []).filter(m => m.senderId !== adminUserId).length, 0), subtext: "Requires Attention", icon: LuMessageCircle, color: "text-slate-600", bg: "bg-[#FFFFFF]", cardBg: "bg-[#F3F8F5] dark:bg-[#F3F8F5]/10" }
            ].map((stat, i) => (
              <div key={i} className={`${stat.cardBg} border border-[#0F172A]/5 dark:border-white/5 rounded-[24px] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.05)] dark:shadow-[0_25px_70px_rgba(0,0,0,0.45)] hover:-translate-y-1 transition-all duration-300 group`} style={{ animationDelay: `${i * 80}ms` }}>
                <PremiumIcon icon={stat.icon} className="mb-4 group-hover:scale-110 transition-transform duration-300" />
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#888] mb-1">{stat.label}</p>
                <h3 className="text-xl font-sans font-[650] text-[#0F172A] dark:text-white tabular-nums tracking-tight mb-1">{stat.value}</h3>
                <p className="text-[13px] font-medium text-[#64748B] dark:text-[#666]">{stat.subtext}</p>
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
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#FFFFFF] dark:bg-[#171A21] p-6 rounded-[24px] border border-[#0F172A]/5 dark:border-white/5 shadow-[0_20px_60px_rgba(0,0,0,0.05)] dark:shadow-[0_25px_70px_rgba(0,0,0,0.45)]">
            <div>
              <h2 className="text-2xl font-[650] text-[#0F172A] dark:text-white font-sans tracking-tight mb-1">Client Roster</h2>
              <p className="text-[15px] text-[#64748B] dark:text-[#94A3B8] font-medium max-w-md">Manage all your agency clients, their statuses, and earnings.</p>
            </div>
            <div className="w-full sm:w-auto shrink-0 flex justify-end">
              <InviteClientModal />
            </div>
          </div>

          <ClientRosterTable 
            clients={clients.map(client => ({
              id: client.id,
              email: client.email || "",
              clientProfile: client.clientProfile,
              unreadCount: (client.clientProfile?.messages || []).filter(m => m.senderId !== adminUserId).length
            }))}
          />
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
