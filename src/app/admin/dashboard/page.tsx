import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import InviteClientModal from "./InviteClientModal"
import DeleteClientButton from "./DeleteClientButton"
import StatusDropdown from "@/components/StatusDropdown"
import OutstandingInvoicesWidget, { OverdueInvoice } from "@/components/admin/OutstandingInvoicesWidget"
import { Bell } from "lucide-react"
import SignOutButton from "./SignOutButton"
import { GoPeople } from "react-icons/go"
import { CiStar } from "react-icons/ci"
import { GrInProgress } from "react-icons/gr"
import { LuMessageCircle } from "react-icons/lu"
import { AlertCircle, DollarSign } from "lucide-react"
import NotificationBell, { UnreadClient } from "./NotificationBell"
import AdminAnalyticsCharts from "./AdminAnalyticsCharts"
import { format, subMonths, isSameMonth } from "date-fns"

export default async function AdminDashboard() {
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

  const unreadClientsData: UnreadClient[] = clients
    .map(c => ({
      id: c.id,
      companyName: c.clientProfile?.companyName || "Unknown Company",
      messageCount: (c.clientProfile?.messages || []).filter(m => m.senderId !== adminUserId).length
    }))
    .filter(c => c.messageCount > 0)

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
          clientProfileId: client.clientProfile!.id
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

  return (
    <div className="min-h-screen w-full px-4 md:px-8 lg:px-12 xl:px-24 pt-12 pb-32 bg-[#FAFAFA] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/40 via-[#FAFAFA] to-[#FAFAFA]">
      <div className="max-w-screen-2xl mx-auto">
      
      {!isSetupComplete && (
        <div className="mb-8 bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-sm">
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

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl sm:text-5xl text-[#0F172A] font-sans font-bold tracking-tight">
            Welcome to your dashboard
          </h1>
          <p className="text-muted-foreground mt-4 text-base leading-relaxed max-w-2xl">
            Manage your clients and view their onboarding progress.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 items-center w-full sm:w-auto">
          <div className="w-full sm:w-auto flex justify-between items-center">
            <span className="sm:hidden text-sm font-semibold text-muted-foreground">Notifications</span>
            <NotificationBell unreadClients={unreadClientsData} />
          </div>
          <div className="hidden sm:block w-px h-8 bg-gray-200 mx-2"></div>
          <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-3">
            <Link href="/admin/settings">
              <Button variant="outline" className="w-full sm:w-auto">Settings</Button>
            </Link>
            <SignOutButton />
            <InviteClientModal />
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[
          { label: "Total Clients", value: clients.length, icon: <GoPeople className="w-6 h-6" />, color: "bg-blue-500/10 text-blue-600" },
          { label: "Total Earnings", value: totalEarningsDisplay, icon: <DollarSign className="w-5 h-5" />, color: "bg-green-500/10 text-green-600" },
          { label: "In Progress", value: clients.filter(c => c.clientProfile && c.clientProfile.status !== "COMPLETED").length, icon: <GrInProgress className="w-5 h-5" />, color: "bg-amber-500/10 text-amber-600" },
          { label: "Unread Messages", value: clients.reduce((acc, client) => acc + (client.clientProfile?.messages || []).filter(m => m.senderId !== adminUserId).length, 0), icon: <LuMessageCircle className="w-5 h-5" />, color: "bg-purple-500/10 text-purple-600" }
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center gap-4 transition-transform hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(0,0,0,0.04)]">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${stat.color}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
              <h3 className="text-2xl font-bold text-[#0F172A] mt-0.5">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <OutstandingInvoicesWidget invoices={overdueInvoices} />

      <AdminAnalyticsCharts data={chartData} />

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[#0F172A]">Recent Clients</h2>
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
            <Card key={client.id} className="bg-white border-[#E5E7EB] rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:border-[#5A52FF]/30 transition-all duration-200 min-w-0 overflow-hidden">
              <CardHeader className="flex flex-col sm:flex-row justify-between items-start space-y-4 sm:space-y-0 pb-4 px-6 sm:px-8 pt-7 gap-3">
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-xl sm:text-2xl font-sans font-bold text-[#0F172A] flex flex-wrap items-center gap-2">
                    <span className="break-words w-full sm:w-auto">{client.clientProfile?.companyName || "Unknown Company"}</span>
                    {unreadCount > 0 && (
                      <span className="relative flex items-center gap-1 px-2 py-0.5 rounded-full bg-destructive/10 text-destructive text-[11px] font-bold shrink-0" title={`${unreadCount} unread message(s)`}>
                        <Bell className="w-3 h-3" />
                        {unreadCount}
                        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-destructive animate-ping" />
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription className="mt-2 text-[14px] sm:text-[15px] text-[#64748B] font-medium break-all sm:break-normal">{client.email}</CardDescription>
                </div>
                <div className="flex items-center shrink-0 w-full sm:w-auto justify-start sm:justify-end mt-2 sm:mt-0">
                  {client.clientProfile ? (
                    <StatusDropdown
                      clientProfileId={client.clientProfile.id}
                      currentStatus={client.clientProfile.status || "ONBOARDED"}
                    />
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-xs uppercase tracking-[0.12em] font-bold bg-muted text-muted-foreground">
                      Pending
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="px-8 pb-7">
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Client Earnings:</span>
                  <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">{clientEarningsDisplay}</span>
                </div>
                <div className="flex flex-row items-center gap-3 pt-6 border-t border-[#F1F5F9]">
                  <Link href={`/admin/client/${client.id}`} className="w-full flex-1">
                    <Button variant="outline" className="w-full bg-[#FAFAFA] border-[#E5E7EB] hover:bg-[#5A52FF] hover:text-white hover:border-[#5A52FF] h-11 rounded-xl text-[15px] font-medium transition-colors">
                      View Details
                    </Button>
                  </Link>
                  <DeleteClientButton clientId={client.id} companyName={client.clientProfile?.companyName || "Unknown Company"} />
                </div>
              </CardContent>
            </Card>
          )
        })}

        {clients.length === 0 && (
          <div className="col-span-full py-16 text-center text-muted-foreground bg-muted/30 rounded-2xl border border-dashed border-border">
            <p className="text-lg font-medium text-foreground mb-2">No clients found</p>
            <p className="text-sm">Click "Invite New Client" to get started.</p>
          </div>
        )}
      </div>
      </div>
    </div>
  )
}
