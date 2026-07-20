import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { auth } from "@/auth"
import Link from "next/link"
import { ArrowLeft, Mail, Calendar, Users, Hash, Building2, CreditCard } from "lucide-react"
import { format } from "date-fns"
import CompanyActions from "./CompanyActions"
import SuperAdminSidebarLayout from "../../SuperAdminSidebarLayout"
import CompanyIdWidget from "./CompanyIdWidget"

export default async function CompanyManagePage(props: { params: Promise<{ tenantId: string }> }) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const adminUser = await prisma.user.findUnique({ where: { id: session.user.id } })
  const adminName = adminUser?.name || session.user.name || "Super Admin"

  const params = await props.params

  const tenant = await prisma.tenant.findUnique({
    where: { id: params.tenantId },
    include: {
      users: { where: { role: "ADMIN" } },
      _count: {
        select: { clientProfiles: true }
      }
    }
  })

  if (!tenant) notFound()

  const isExpired = tenant.subscriptionStatus === "EXPIRED" || !!(tenant.subscriptionEnd && new Date(tenant.subscriptionEnd) < new Date());

  // Plan-based color theming (same logic as AgencyCard)
  const colorMap: Record<string, { banner: string, text: string, badge: string }> = {
    FREE: {
      banner: 'bg-gradient-to-br from-emerald-100 via-emerald-50 to-teal-100 dark:from-emerald-900/30 dark:via-emerald-950/20 dark:to-teal-900/20',
      text: 'text-emerald-800 dark:text-emerald-300',
      badge: 'bg-emerald-200/80 text-emerald-800 dark:bg-emerald-800/40 dark:text-emerald-300'
    },
    PREMIUM_MONTHLY: {
      banner: 'bg-gradient-to-br from-blue-100 via-blue-50 to-indigo-100 dark:from-blue-900/30 dark:via-blue-950/20 dark:to-indigo-900/20',
      text: 'text-blue-800 dark:text-blue-300',
      badge: 'bg-blue-200/80 text-blue-800 dark:bg-blue-800/40 dark:text-blue-300'
    },
    PREMIUM_YEARLY: {
      banner: 'bg-gradient-to-br from-purple-100 via-purple-50 to-violet-100 dark:from-purple-900/30 dark:via-purple-950/20 dark:to-violet-900/20',
      text: 'text-purple-800 dark:text-purple-300',
      badge: 'bg-purple-200/80 text-purple-800 dark:bg-purple-800/40 dark:text-purple-300'
    },
    EXPIRED: {
      banner: 'bg-gradient-to-br from-rose-100 via-rose-50 to-red-100 dark:from-rose-900/30 dark:via-rose-950/20 dark:to-red-900/20',
      text: 'text-rose-800 dark:text-rose-300',
      badge: 'bg-rose-200/80 text-rose-800 dark:bg-rose-800/40 dark:text-rose-300'
    }
  };

  const theme = isExpired
    ? colorMap.EXPIRED
    : (colorMap[tenant.subscriptionPlan] || colorMap.FREE);

  const planLabel = isExpired
    ? 'Expired'
    : tenant.subscriptionPlan.replace('_', ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());

  return (
    <SuperAdminSidebarLayout
      tabs={[]}
      adminName={adminName}
      adminUser={adminUser}
    >
      <div className="w-full min-h-screen bg-white dark:bg-[#000]">

        {/* Back Navigation */}
        <div className="w-full max-w-7xl mx-auto px-6 sm:px-8 pt-4 pb-2">
          <Link
            href="/superadmin/dashboard?tab=agencies"
            className="inline-flex items-center text-[13px] font-medium text-gray-500 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
            Back to Companies
          </Link>
        </div>

        {/* Colored Banner */}
        <div className="w-full max-w-7xl mx-auto px-6 sm:px-8">
          <div className={`w-full h-32 sm:h-36 rounded-2xl ${theme.banner} relative`}>
          </div>
        </div>

        {/* Profile Section — Overlapping the banner */}
        <div className="w-full max-w-7xl mx-auto px-6 sm:px-8 -mt-12 relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5 mb-8">
            {/* Large Monogram / Avatar */}
            <div className={`w-24 h-24 rounded-2xl ${tenant.users?.[0]?.image ? 'bg-white' : theme.banner} border-4 border-white dark:border-[#000] shadow-lg flex items-center justify-center shrink-0 overflow-hidden`}>
              {tenant.users?.[0]?.image ? (
                <img src={tenant.users[0].image} alt={tenant.name} className="w-full h-full object-cover" />
              ) : (
                <span className={`text-3xl font-bold uppercase ${theme.text}`}>
                  {tenant.name.substring(0, 2)}
                </span>
              )}
            </div>

            {/* Name + Badges */}
            <div className="flex flex-col gap-2 pb-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight leading-tight">
                {tenant.name}
              </h1>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide ${theme.badge}`}>
                  {planLabel}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide ${isExpired
                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                  : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                  }`}>
                  {isExpired ? '● Expired' : '● Active'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Details Table */}
        <div className="w-full max-w-7xl mx-auto px-6 sm:px-8 pb-6">
          <div className="bg-white dark:bg-[#111] rounded-2xl border border-gray-200 dark:border-[#222] overflow-hidden shadow-sm">
            {/* Section Header */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-[#222]">
              <h2 className="text-[14px] font-semibold text-gray-900 dark:text-white tracking-tight">Company Details</h2>
            </div>

            {/* Row: Company ID */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-[#222] hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
              <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400 shrink-0">
                <Hash className="w-4 h-4" />
                <span className="text-[13px] font-medium">Company ID</span>
              </div>
              <CompanyIdWidget tenantId={tenant.id} />
            </div>

            {/* Row: Admin Email */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-[#222] hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
              <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400 shrink-0">
                <Mail className="w-4 h-4" />
                <span className="text-[13px] font-medium">Admin Email</span>
              </div>
              <span className="text-[14px] text-gray-900 dark:text-white font-medium truncate max-w-[60%] text-right">
                {tenant.users[0]?.email || "N/A"}
              </span>
            </div>

            {/* Row: Total Clients */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-[#222] hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
              <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400 shrink-0">
                <Users className="w-4 h-4" />
                <span className="text-[13px] font-medium">Total Clients</span>
              </div>
              <span className="text-[14px] text-gray-900 dark:text-white font-semibold tabular-nums">
                {tenant._count.clientProfiles}
              </span>
            </div>

            {/* Row: Plan */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-[#222] hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
              <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400 shrink-0">
                <CreditCard className="w-4 h-4" />
                <span className="text-[13px] font-medium">Current Plan</span>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide ${theme.badge}`}>
                {planLabel}
              </span>
            </div>

            {/* Row: Start Date */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-[#222] hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
              <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400 shrink-0">
                <Calendar className="w-4 h-4" />
                <span className="text-[13px] font-medium">Start Date</span>
              </div>
              <span className="text-[14px] text-gray-900 dark:text-white font-medium">
                {tenant.subscriptionStart
                  ? format(new Date(tenant.subscriptionStart), "MMM d, yyyy")
                  : format(new Date(tenant.createdAt), "MMM d, yyyy")}
              </span>
            </div>

            {/* Row: End Date */}
            <div className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
              <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400 shrink-0">
                <Calendar className="w-4 h-4" />
                <span className="text-[13px] font-medium">End Date</span>
              </div>
              <span className="text-[14px] text-gray-900 dark:text-white font-medium">
                {tenant.subscriptionEnd
                  ? format(new Date(tenant.subscriptionEnd), "MMM d, yyyy")
                  : (tenant.subscriptionStatus === "ACTIVE" && tenant.subscriptionPlan !== "FREE" ? "Auto-renewing" : "N/A")}
              </span>
            </div>
          </div>
        </div>

        {/* Subscription Actions Section */}
        <div className="w-full max-w-7xl mx-auto px-6 sm:px-8 pb-16">
          <div className="bg-white dark:bg-[#111] rounded-2xl border border-gray-200 dark:border-[#222] overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-[#222]">
              <h2 className="text-[14px] font-semibold text-gray-900 dark:text-white tracking-tight">Subscription Settings</h2>
              <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-0.5">Manage or cancel this company&apos;s subscription.</p>
            </div>
            <div className="px-6 py-5">
              <CompanyActions
                tenantId={tenant.id}
                currentPlan={tenant.subscriptionPlan}
                currentEnd={tenant.subscriptionEnd}
                cancelAtPeriodEnd={tenant.cancelAtPeriodEnd}
                isExpired={isExpired}
                subscriptionStatus={tenant.subscriptionStatus}
              />
            </div>
          </div>
        </div>

      </div>
    </SuperAdminSidebarLayout>
  )
}
