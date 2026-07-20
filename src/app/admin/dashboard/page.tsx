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
import ProjectDoneWidget from "@/components/admin/ProjectDoneWidget"
import LatestLeadsWidget from "@/components/admin/LatestLeadsWidget"
import { Bell } from "lucide-react"
import { GoPeople } from "react-icons/go"
import { GrInProgress } from "react-icons/gr"
import { LuMessageCircle } from "react-icons/lu"
import { AlertCircle, DollarSign, ArrowRight, Filter } from "lucide-react"
import AdminAnalyticsCharts from "./AdminAnalyticsCharts"
import { format, subMonths, isSameMonth, startOfMonth, endOfMonth, subDays, isSameDay } from "date-fns"
import AdminSidebarLayout, { TabData } from "./AdminSidebarLayout"
import { PremiumIcon } from "@/components/PremiumIcon"
import NotificationsTab from "@/components/admin/NotificationsTab"
import ClientRosterTable from "@/components/admin/ClientRosterTable"
import AdminBillingTab from "./AdminBillingTab"
import AdminPortalSettingsTab from "./AdminPortalSettingsTab"
import NotificationSync from "@/components/NotificationSync"
import AdminBroadcastsTab from "@/components/admin/AdminBroadcastsTab"

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }> | { [key: string]: string | string[] | undefined }
}

export default async function AdminDashboard({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const initialTab = (resolvedSearchParams?.tab as string) || "overview";

  console.log("DATABASE_URL in app:", process.env.DATABASE_URL ? process.env.DATABASE_URL.split('@')[1] : "Not Set")
  console.log("DIRECT_URL in app:", process.env.DIRECT_URL ? process.env.DIRECT_URL.split('@')[1] : "Not Set")
  const session = await auth()
  const tenantId = session?.user?.tenantId
  const adminUserId = session?.user?.id

  const adminUser = await prisma.user.findUnique({
    where: { id: adminUserId as string },
    select: {
      name: true,
      email: true,
      image: true,
      tenant: {
        select: {
          subscriptionPlan: true,
          subscriptionStatus: true,
          subscriptionStart: true,
          subscriptionEnd: true,
          cancelAtPeriodEnd: true
        }
      }
    }
  })

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
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      image: true,
      tenantId: true,
      createdAt: true,
      updatedAt: true,
      clientProfile: {
        include: {
          messages: {
            take: 20,
            orderBy: { createdAt: 'desc' }
          },
          approvals: {
            include: {
              items: {
                where: {
                  status: { in: ["APPROVED", "CHANGES_REQUESTED"] }
                }
              }
            }
          },
          invoices: {
            select: { id: true, title: true, amount: true, currency: true, status: true, dueDate: true, createdAt: true }
          },
          projects: true
        }
      }
    },
  })

  // For admin, we need the admin user ID to filter out admin's own messages

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

  // Generate Chart Data for the last 12 months
  const chartData = Array.from({ length: 12 }).map((_, i) => {
    const d = subMonths(new Date(), 11 - i)
    return {
      month: format(d, 'MMM/yy').toUpperCase(),
      date: d,
      earnings: 0,
      rejected: 0,
      completed: 0,
      awaiting: 0,
      clients: 0
    }
  })

  // Calculate project completion stats
  let completedProjects = 0;
  let totalProjects = 0;

  clients.forEach(client => {
    if (client.clientProfile?.projects) {
      client.clientProfile.projects.forEach(project => {
        totalProjects++;
        const stagesArray = Array.isArray(project.stages) ? project.stages : [];
        if (project.currentStageIdx >= stagesArray.length - 1) {
          completedProjects++;
        }
      });
    }
  });

  // Generate project chart data for the last 7 days (cumulative)
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = subDays(new Date(), 6 - i)
    return {
      day: format(d, 'EEE, MMM dd').toUpperCase(),
      date: d,
      value: 0
    }
  })

  // Count completions per day
  clients.forEach(client => {
    if (client.clientProfile?.projects) {
      client.clientProfile.projects.forEach(project => {
        const stagesArray = Array.isArray(project.stages) ? project.stages : [];
        const isCompleted = project.currentStageIdx >= stagesArray.length - 1;
        if (isCompleted && project.updatedAt) {
          const compDate = new Date(project.updatedAt);
          const dayMatch = last7Days.find(d => isSameDay(d.date, compDate));
          if (dayMatch) {
            dayMatch.value += 1;
          }
        }
      });
    }
  });

  // Calculate cumulative totals starting from before the 7-day window
  let runningTotal = 0;
  clients.forEach(client => {
    if (client.clientProfile?.projects) {
      client.clientProfile.projects.forEach(project => {
        const stagesArray = Array.isArray(project.stages) ? project.stages : [];
        const isCompleted = project.currentStageIdx >= stagesArray.length - 1;
        if (isCompleted && project.updatedAt) {
          const compDate = new Date(project.updatedAt);
          if (compDate < last7Days[0].date) {
            runningTotal += 1;
          }
        }
      });
    }
  });

  const projectChartData = last7Days.map(d => {
    runningTotal += d.value;
    return {
      day: d.day,
      value: runningTotal
    }
  });

  // Calculate summary stats for the new chart
  let summaryAwaiting = 0;
  let summaryCompleted = 0;
  let summaryRejected = 0;

  clients.forEach(client => {
    (client.clientProfile?.invoices || []).forEach(inv => {
      if (inv.status === "SENT") summaryAwaiting += inv.amount;
      if (inv.status === "PAID") summaryCompleted += inv.amount;
      if (inv.status === "OVERDUE") summaryRejected += inv.amount;
    })
  });

  const summaryStats = {
    awaiting: summaryAwaiting,
    completed: summaryCompleted,
    rejected: summaryRejected,
    revenue: summaryCompleted
  };

  clients.forEach(client => {
    // Client Growth
    const clientDate = new Date(client.createdAt)
    const clientMonth = chartData.find(m => isSameMonth(m.date, clientDate))
    if (clientMonth) clientMonth.clients += 1

      // Earnings Growth & New Metrics
      ; (client.clientProfile?.invoices || [])
        .forEach(inv => {
          if (inv.createdAt) {
            const invDate = new Date(inv.createdAt)
            const invMonth = chartData.find(m => isSameMonth(m.date, invDate))
            if (invMonth) {
              if (inv.status === "PAID") {
                invMonth.completed += inv.amount;
                invMonth.earnings += inv.amount;
              } else if (inv.status === "SENT") {
                invMonth.awaiting += inv.amount;
              } else if (inv.status === "OVERDUE") {
                invMonth.rejected += inv.amount;
              }
            }
          }
        })
  })

  // Map clients for LatestLeadsWidget
  const latestLeads = clients.map(client => {
    let totalPaid = 0;
    let lastPaid = 0;
    let lastPaidDate = new Date(0);

    const invoices = client.clientProfile?.invoices || [];
    invoices.forEach(inv => {
      if (inv.status === "PAID") {
        totalPaid += inv.amount;
        if (new Date(inv.createdAt) > lastPaidDate) {
          lastPaidDate = new Date(inv.createdAt);
          lastPaid = inv.amount;
        }
      }
    });

    const projectStatuses: string[] = [];
    if (client.clientProfile?.projects) {
      client.clientProfile.projects.forEach((project: any) => {
        const stagesArray = Array.isArray(project.stages) ? project.stages : [];
        if (stagesArray.length > 0 && project.currentStageIdx >= 0 && project.currentStageIdx < stagesArray.length) {
          const currentStage = stagesArray[project.currentStageIdx];
          if (typeof currentStage === 'string') {
            projectStatuses.push(currentStage);
          } else if (currentStage && typeof currentStage === 'object' && currentStage.name) {
            projectStatuses.push(currentStage.name);
          }
        }
      });
    }

    return {
      id: client.id,
      name: client.name || "Unknown",
      email: client.email || "Unknown",
      avatar: null,
      joinedDate: client.createdAt,
      projectStatuses,
      totalPaid,
      lastPaid
    };
  });

  const tabs: TabData[] = [
    {
      id: "overview",
      label: "Overview",
      content: (
        <div className="flex flex-col gap-6">
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
              { label: "Total Clients", value: clients.length, subtext: "Active Accounts", icon: GoPeople, progress: "65%", textRight: `${clients.length} Active`, barColor: "duralux-progress-orange", href: "?tab=clients" },
              { label: "Total Earnings", value: totalEarningsDisplay, subtext: "Lifetime Volume", icon: DollarSign, progress: "80%", textRight: "80% Target", barColor: "duralux-progress-green", href: "?tab=billing" },
              { label: "In Progress", value: totalProjects - completedProjects, subtext: "Active Projects", icon: GrInProgress, progress: `${totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0}%`, textRight: `${totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0}% Completed`, barColor: "duralux-progress-blue", href: "?tab=clients" },
              { label: "Unread Messages", value: clients.reduce((acc, client) => acc + (client.clientProfile?.messages || []).filter(m => !m.isRead && m.senderId !== adminUserId).length, 0), subtext: "Requires Attention", icon: LuMessageCircle, progress: "15%", textRight: "Needs Review", barColor: "duralux-progress-red", href: "?tab=notifications" }
            ].map((stat, i) => (
              <Link key={i} href={stat.href}>
                <div className="bg-white dark:bg-[#171A21] border border-[#eff0f6] dark:border-white/5 rounded-[6px] p-7 lg:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 transition-all duration-300 group flex flex-col justify-between min-h-[175px] cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#eff1f6] dark:bg-[#1C2029] flex items-center justify-center shrink-0">
                      <stat.icon className="w-5 h-5 text-[#64748b] dark:text-[#94A3B8]" />
                    </div>
                    <div>
                      <h3 className="text-[20px] font-semibold text-[#0F172A] dark:text-white tracking-tight leading-none mb-1">{stat.value}</h3>
                      <p className="text-[11px] font-normal text-[#64748B] dark:text-[#94A3B8] leading-none">{stat.label}</p>
                    </div>
                  </div>
                  <div className="mt-5">
                    <div className="flex items-center justify-between text-[11px] text-[#8898aa] dark:text-[#94A3B8] font-normal mb-1.5">
                      <span className="truncate">{stat.subtext}</span>
                      <span className="font-medium shrink-0 ml-1">{stat.textRight}</span>
                    </div>
                    <div className="w-full bg-[#eff1f6] dark:bg-[#222] h-[3px] rounded-full overflow-hidden">
                      <div className={`h-full ${stat.barColor}`} style={{ width: stat.progress }} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StorageUsageWidget />
            <div className="h-full">
              <ProjectDoneWidget completedCount={completedProjects} totalCount={totalProjects} chartData={projectChartData} />
            </div>
          </div>

          <AdminAnalyticsCharts data={chartData} summaryStats={summaryStats} />

          <div className="mt-2">
            <LatestLeadsWidget leads={latestLeads} />
          </div>
        </div>
      )
    },
    {
      id: "clients",
      label: "Clients",
      content: (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#FFFFFF] dark:bg-[#171A21] p-6 rounded-[20px] border border-[#E5E7EB]/80 dark:border-white/[0.06] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.03)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.2),0_8px_24px_rgba(0,0,0,0.15)]">
            <div>
              <h2 className="text-[28px] font-normal text-[#0F172A] dark:text-white font-sans tracking-tight mb-1.5">Client Roster</h2>
              <p className="text-[14px] text-[#64748B] dark:text-[#94A3B8] font-normal max-w-md">Manage all your agency clients, their statuses, and earnings.</p>
            </div>
            <div className="w-full sm:w-auto shrink-0 flex justify-end">
              <InviteClientModal />
            </div>
          </div>

          <ClientRosterTable
            clients={clients.map(client => ({
              id: client.id,
              email: client.email || "",
              image: client.clientProfile?.profileImageUrl || client.image,
              createdAt: client.createdAt.toISOString(),
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
    },
    {
      id: "broadcasts",
      label: "Broadcasts",
      content: <AdminBroadcastsTab />
    },
    {
      id: "billing",
      label: "Billing & Subscriptions",
      content: <AdminBillingTab tenant={adminUser?.tenant || null} />
    },
    {
      id: "portal-settings",
      label: "Portal Settings",
      content: <AdminPortalSettingsTab />
    }
  ]

  return (
    <>
      <NotificationSync role="ADMIN" data={clients} adminUserId={adminUserId} />
      <AdminSidebarLayout tabs={tabs} clients={clients} initialTab={initialTab} adminUser={adminUser || { name: "Admin", email: session?.user?.email || "admin@example.com", image: null, tenant: null }} />
    </>
  )
}
