import { prisma } from "@/lib/prisma"
import { PremiumIcon } from "@/components/PremiumIcon"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Link from "next/link"
import { Download, ExternalLink, Receipt, Mail, User, Globe as GlobeIcon, Image as ImageIcon } from "lucide-react"
import { RiArrowGoBackFill } from "react-icons/ri"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PiGlobeDuotone, PiFileTextDuotone, PiUsersDuotone, PiRocketLaunchDuotone } from "react-icons/pi"
import ChatInterface from "@/components/ChatInterface"
import StatusDropdown from "@/components/StatusDropdown"
import ManageProjects from "./ManageProjects"
import ManageApprovals from "./ManageApprovals"
import ManageInvoices from "./ManageInvoices"
import GenerateAiButton from "./GenerateAiButton"
import ResetPasswordButton from "./ResetPasswordButton"
import AdminMessagesTabBadge from "@/components/admin/AdminMessagesTabBadge"
import AdminSidebarLayout from "../../dashboard/AdminSidebarLayout"
import { getToken } from "next-auth/jwt"
import { cookies, headers } from "next/headers"
type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function ClientDetailsPage({ params, searchParams }: Props) {
  const { id } = await params
  const resolvedSearchParams = await searchParams;
  const initialTab = (resolvedSearchParams?.tab as string) || "overview";

  const reqCookies = await cookies()
  const reqHeaders = await headers()
  const req = {
    cookies: Object.fromEntries(reqCookies.getAll().map(c => [c.name, c.value])),
    headers: Object.fromEntries(reqHeaders.entries())
  } as any
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || "c4d8Y0Pq9rK2nX7fWm3JvL8aZs1QeH5tBg9NpRx6UcIyEoDn" })

  const client = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      tenantId: true,
      createdAt: true,
      updatedAt: true,
      clientProfile: {
        include: {
          brandAssets: true,
          aiAnalysis: true,
          questionnaire: true,
          projects: { orderBy: { createdAt: "asc" } },
          approvals: { include: { items: { include: { feedback: true }, orderBy: { createdAt: "asc" } } }, orderBy: { createdAt: "desc" } },
          invoices: { include: { items: true }, orderBy: { createdAt: "desc" } }
        }
      }
    }
  })

  if (!client || !client.clientProfile) {
    return notFound()
  }

  // Tenant isolation: ensure this client belongs to the admin's tenant
  if (token?.tenantId && client.tenantId !== token.tenantId) {
    return notFound()
  }

  const allClients = await prisma.user.findMany({
    where: { 
      role: "CLIENT",
      tenantId: token?.tenantId as string
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      tenantId: true,
      createdAt: true,
      updatedAt: true,
      clientProfile: {
        select: {
          id: true,
          companyName: true,
          clientName: true
        }
      }
    },
  })

  const { clientProfile } = client
  const aiSummary = clientProfile.aiAnalysis?.summary as any || {}
  const qna = clientProfile.questionnaire?.qna as any || {}

  const clientEarningsByCurrency: Record<string, number> = {}
  ;(clientProfile.invoices || []).forEach((inv: any) => {
    if (inv.status === "PAID") {
      const currency = inv.currency || "USD"
      clientEarningsByCurrency[currency] = (clientEarningsByCurrency[currency] || 0) + inv.amount
    }
  })

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)
  }

  const clientEarningsDisplay = Object.entries(clientEarningsByCurrency).length > 0
    ? Object.entries(clientEarningsByCurrency).map(([curr, amt]) => formatCurrency(amt, curr)).join(' + ')
    : formatCurrency(0, "USD")

  return (
    <AdminSidebarLayout
      tabs={[]}
      adminName={(token as any)?.name || "Admin"}
      clients={allClients}
      activeClientId={id}
      activeClientTab={initialTab}
    >
      <div className="min-h-screen w-full pb-32">
        <div className="max-w-screen-2xl mx-auto">
        <div className="mb-6">
          <Link href="/admin/dashboard?tab=clients" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] font-semibold text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
            <RiArrowGoBackFill className="w-4 h-4" />
            Back to Clients
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8">
          <div className="flex items-start sm:items-center gap-4 sm:gap-6 min-w-0 w-full">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-4xl md:text-5xl text-[#0F172A] dark:text-white font-sans font-bold tracking-tight break-words">{clientProfile.companyName}</h1>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-3 sm:mt-4">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-[#111] border border-[#E5E7EB] dark:border-[#333] rounded-full text-[12px] sm:text-[13px] font-semibold text-[#475569] dark:text-[#94A3B8] shadow-sm truncate max-w-full">
                <Mail className="w-3.5 h-3.5 text-[#22C55E] shrink-0" />
                <span className="truncate">{client.email}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-[#111] border border-[#E5E7EB] dark:border-[#333] rounded-full text-[12px] sm:text-[13px] font-semibold text-[#475569] dark:text-[#94A3B8] shadow-sm truncate max-w-full">
                <User className="w-3.5 h-3.5 text-[#22C55E] shrink-0" />
                <span className="truncate">{clientProfile.clientName}</span>
              </div>
              {clientProfile.website && (
                <a href={clientProfile.website.startsWith('http') ? clientProfile.website : `https://${clientProfile.website}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-[#111] border border-[#E5E7EB] dark:border-[#333] rounded-full text-[12px] sm:text-[13px] font-semibold text-[#475569] dark:text-[#94A3B8] shadow-sm hover:text-[#22C55E] hover:border-[#22C55E]/30 transition-colors truncate max-w-full">
                  <GlobeIcon className="w-3.5 h-3.5 text-[#22C55E] shrink-0" />
                  <span className="truncate">Website</span>
                </a>
              )}
              <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-900/50 rounded-full text-[12px] sm:text-[13px] font-bold text-emerald-700 dark:text-emerald-400 shadow-sm truncate max-w-full">
                <Receipt className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="truncate">Earnings: {clientEarningsDisplay}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="ml-[56px] sm:ml-0 shrink-0 flex items-center gap-3">
          <ResetPasswordButton clientId={clientProfile.id} />
          <StatusDropdown 
            clientProfileId={clientProfile.id} 
            currentStatus={clientProfile.status || "ONBOARDED"} 
          />
        </div>
      </div>

      {/* Navigation Bar */}
      <div className="flex overflow-x-auto hide-scrollbar mb-8 border-b border-[#E2E8F0] dark:border-[#2A2E35]">
        <div className="flex gap-2 pb-px min-w-max">
          {[
            { id: "overview", label: "Overview" },
            { id: "projects", label: "Projects" },
            { id: "approvals", label: "Approvals" },
            { id: "billing", label: "Billing & Invoices" },
            { id: "messages", label: "Messages" }
          ].map(tab => {
            const isActive = initialTab === tab.id;
            return (
              <Link
                key={tab.id}
                href={`/admin/client/${id}?tab=${tab.id}`}
                className={`px-4 py-3 text-[14px] font-semibold transition-all relative whitespace-nowrap flex items-center ${
                  isActive
                    ? "text-[#22C55E]"
                    : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] hover:bg-black/5 dark:hover:bg-white/5 rounded-t-lg"
                }`}
              >
                {tab.label}
                {tab.id === "messages" && <AdminMessagesTabBadge clientId={id} />}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#22C55E] rounded-t-full" />
                )}
              </Link>
            );
          })}
        </div>
      </div>

      <Tabs key={initialTab} defaultValue={initialTab} className="w-full">

        <TabsContent value="overview" className="mt-0 outline-none">
          <div className="grid gap-6 md:grid-cols-2">
        {/* Business Details */}
        <Card className="bg-white dark:bg-[#111111] border-[#E9EDF4] dark:border-[#2A2E35] rounded-[24px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col group">
          <CardHeader className="pb-4 px-8 pt-7 border-b border-[#F1F5F9] dark:border-[#222]">
            <CardTitle className="text-xl font-sans font-bold text-[#0F172A] dark:text-white tracking-tight">Business Information</CardTitle>
          </CardHeader>
          <CardContent className="p-6 grid gap-4 flex-1">
            <div className="group/item p-4 rounded-xl border border-transparent hover:border-[#E9EDF4] dark:hover:border-[#333] hover:bg-[#F8FAFC] dark:hover:bg-[#1A1A1A] transition-all duration-200">
              <div className="flex items-center gap-2 mb-2">
                <PremiumIcon icon={GlobeIcon} />
                <p className="text-[11px] font-bold tracking-[0.15em] text-[#64748B] dark:text-[#888] uppercase">Website</p>
              </div>
              <p className="text-[15px] font-medium text-[#0F172A] dark:text-white pl-10 group-hover/item:text-[#22C55E] transition-colors">
                {clientProfile.website ? (
                  <a href={clientProfile.website.startsWith('http') ? clientProfile.website : `https://${clientProfile.website}`} target="_blank" rel="noreferrer" className="hover:underline">
                    {clientProfile.website}
                  </a>
                ) : "N/A"}
              </p>
            </div>
            
            <div className="group/item p-4 rounded-xl border border-transparent hover:border-[#E9EDF4] dark:hover:border-[#333] hover:bg-[#F8FAFC] dark:hover:bg-[#1A1A1A] transition-all duration-200">
              <div className="flex items-center gap-2 mb-2">
                <PremiumIcon icon={Receipt} />
                <p className="text-[11px] font-bold tracking-[0.15em] text-[#64748B] dark:text-[#888] uppercase">Description</p>
              </div>
              <p className="text-[14px] text-[#334155] dark:text-[#CBD5E1] leading-relaxed pl-10">{clientProfile.description || "N/A"}</p>
            </div>
            
            <div className="group/item p-4 rounded-xl border border-transparent hover:border-[#E9EDF4] dark:hover:border-[#333] hover:bg-[#F8FAFC] dark:hover:bg-[#1A1A1A] transition-all duration-200">
              <div className="flex items-center gap-2 mb-2">
                <PremiumIcon icon={User} />
                <p className="text-[11px] font-bold tracking-[0.15em] text-[#64748B] dark:text-[#888] uppercase">Target Audience</p>
              </div>
              <p className="text-[14px] text-[#334155] dark:text-[#CBD5E1] leading-relaxed pl-10">{clientProfile.audience || qna?.audience || "N/A"}</p>
            </div>
            
            <div className="group/item p-4 rounded-xl border border-transparent hover:border-[#E9EDF4] dark:hover:border-[#333] hover:bg-[#F8FAFC] dark:hover:bg-[#1A1A1A] transition-all duration-200">
              <div className="flex items-center gap-2 mb-2">
                <PremiumIcon icon={ExternalLink} />
                <p className="text-[11px] font-bold tracking-[0.15em] text-[#64748B] dark:text-[#888] uppercase">Business Goals</p>
              </div>
              <p className="text-[14px] text-[#334155] dark:text-[#CBD5E1] leading-relaxed pl-10">{clientProfile.goals || qna?.goals || "N/A"}</p>
            </div>
          </CardContent>
        </Card>

        {/* Brand Assets */}
        <Card className="bg-white dark:bg-[#111111] border-[#E9EDF4] dark:border-[#2A2E35] rounded-[24px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col overflow-hidden min-w-0 group">
          <CardHeader className="pb-4 px-8 pt-7 border-b border-[#F1F5F9] dark:border-[#222]">
            <CardTitle className="text-xl font-sans font-bold text-[#0F172A] dark:text-white tracking-tight">Brand Assets</CardTitle>
            <CardDescription className="mt-1 text-[#64748B] dark:text-[#94A3B8] font-medium text-[14px]">Files uploaded by the client during onboarding.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 flex-1 flex flex-col">
            {clientProfile.brandAssets.length > 0 ? (
              <ul className="grid gap-3">
                {clientProfile.brandAssets.map((asset: any) => (
                  <li key={asset.id} className="group/item flex items-center justify-between p-4 bg-white dark:bg-[#1A1A1A] border border-[#E5E7EB] dark:border-[#333] rounded-xl hover:border-[#22C55E]/50 transition-all duration-200 overflow-hidden min-w-0">
                    <div className="flex items-center gap-3 overflow-hidden flex-1 min-w-0">
                      <div className="shrink-0 w-10 h-10 rounded-lg bg-[#22C55E]/10 flex items-center justify-center text-[#22C55E]">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col flex-1 min-w-0 w-full">
                        <span className="break-all text-[14px] font-bold text-[#0F172A] dark:text-white">{asset.type}</span>
                        {asset.description && (
                          <span className="break-words text-[13px] font-medium text-[#64748B] dark:text-[#888] mt-0.5">
                            {asset.description}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover/item:opacity-100 transition-opacity">
                      <a href={asset.fileUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center w-8 h-8 rounded-full bg-[#FAFAFA] dark:bg-[#222] text-[#64748B] dark:text-[#888] hover:bg-[#22C55E] hover:text-white dark:hover:bg-[#22C55E] dark:hover:text-white transition-colors" title="View">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <a href={`/api/download?url=${encodeURIComponent(asset.fileUrl)}`} download className="flex items-center justify-center w-8 h-8 rounded-full bg-[#FAFAFA] dark:bg-[#222] text-[#64748B] dark:text-[#888] hover:bg-[#22C55E] hover:text-white dark:hover:bg-[#22C55E] dark:hover:text-white transition-colors" title="Download">
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#FAFAFA] dark:bg-[#1A1A1A] rounded-2xl border-2 border-dashed border-[#E5E7EB] dark:border-[#333] transition-all duration-300">
                <div className="w-16 h-16 bg-white dark:bg-[#111] rounded-full flex items-center justify-center shadow-sm mb-4">
                  <ImageIcon className="w-8 h-8 text-[#cbd5e1] dark:text-[#444]" />
                </div>
                <h3 className="text-[15px] font-bold text-[#0F172A] dark:text-white mb-1">No assets uploaded</h3>
                <p className="text-sm text-[#64748B] dark:text-[#888] max-w-[200px]">The client hasn't uploaded any logos or brand files yet.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Summary */}
        <Card className="md:col-span-2 bg-white dark:bg-[#111111] border border-[#E9EDF4] dark:border-[#2A2E35] rounded-[24px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 px-6 sm:px-8 pt-7 pb-4 border-b border-[#F1F5F9] dark:border-[#222]">
            <div className="min-w-0 flex-1 w-full sm:w-auto">
              <CardTitle className="text-[#22C55E] flex items-center gap-2 text-xl sm:text-2xl font-sans font-bold truncate">
                <span className="text-2xl">✨</span> AI Summary
              </CardTitle>
              <CardDescription className="mt-1 text-[#64748B] dark:text-[#94A3B8] font-medium text-[14px] break-words">
                Automated brand extraction based on the client's questionnaire.
              </CardDescription>
            </div>
            <div className="shrink-0 w-full sm:w-auto">
              <GenerateAiButton clientProfileId={clientProfile.id} />
            </div>
          </CardHeader>
          <CardContent className="px-6 sm:px-8 py-6">
            {clientProfile.aiAnalysis ? (
              <div className="grid gap-6 md:grid-cols-3">
                <div className="bg-[#22C55E]/5 p-5 sm:p-6 rounded-2xl border border-[#22C55E]/10 overflow-hidden min-w-0">
                  <h3 className="text-[11px] uppercase tracking-[0.15em] text-[#22C55E] font-bold mb-3 truncate">Target Audience</h3>
                  <p className="text-[13px] sm:text-[14px] text-[#0F172A] dark:text-white leading-relaxed break-words font-medium">{aiSummary?.targetAudience || "Not analyzed yet."}</p>
                </div>
                <div className="bg-[#22C55E]/5 p-5 sm:p-6 rounded-2xl border border-[#22C55E]/10 overflow-hidden min-w-0">
                  <h3 className="text-[11px] uppercase tracking-[0.15em] text-[#22C55E] font-bold mb-3 truncate">Brand Voice</h3>
                  <p className="text-[13px] sm:text-[14px] text-[#0F172A] dark:text-white leading-relaxed break-words font-medium">{aiSummary?.brandVoice || "Not analyzed yet."}</p>
                </div>
                <div className="bg-[#22C55E]/5 p-5 sm:p-6 rounded-2xl border border-[#22C55E]/10 overflow-hidden min-w-0">
                  <h3 className="text-[11px] uppercase tracking-[0.15em] text-[#22C55E] font-bold mb-3 truncate">Marketing Angle</h3>
                  <p className="text-[13px] sm:text-[14px] text-[#0F172A] dark:text-white leading-relaxed break-words font-medium">{aiSummary?.marketingAngle || "Not analyzed yet."}</p>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-[#64748B] dark:text-[#888] bg-[#FAFAFA] dark:bg-[#1A1A1A] rounded-2xl border border-dashed border-[#E5E7EB] dark:border-[#333]">
                <p className="text-sm font-medium">AI Analysis has not been generated for this client yet.</p>
              </div>
            )}
          </CardContent>
        </Card>

          </div>
        </TabsContent>

          <TabsContent value="projects" className="mt-8 m-0 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <ManageProjects clientProfileId={clientProfile.id} initialProjects={clientProfile.projects as any} />
          </TabsContent>

        <TabsContent value="approvals" className="mt-0 outline-none">
          <ManageApprovals clientProfileId={clientProfile.id} initialApprovals={clientProfile.approvals as any} />
        </TabsContent>

        <TabsContent value="billing" className="mt-0 outline-none">
          <ManageInvoices clientProfileId={clientProfile.id} initialInvoices={clientProfile.invoices as any} />
        </TabsContent>

        <TabsContent value="messages" className="mt-0 outline-none h-[calc(100vh-240px)] min-h-[600px]">
          <ChatInterface clientProfileId={clientProfile.id} currentUserId={token?.id as string} />
        </TabsContent>
      </Tabs>
      </div>
      </div>
    </AdminSidebarLayout>
  )
}
