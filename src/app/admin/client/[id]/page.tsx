import { prisma } from "@/lib/prisma"
import { PremiumIcon } from "@/components/PremiumIcon"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Link from "next/link"
import { Download, ExternalLink, Receipt, Mail, User, Globe as GlobeIcon, Image as ImageIcon, ArrowLeft, BrainCircuit } from "lucide-react"
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
    secureCookie: process.env.NODE_ENV === "production" || process.env.VERCEL === "1",
    cookieName: (process.env.NODE_ENV === "production" || process.env.VERCEL === "1") ? "__Secure-authjs.session-token" : "authjs.session-token",
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
          approvals: { include: { items: { include: { feedback: true }, orderBy: { createdAt: "asc" } }, project: true }, orderBy: { createdAt: "desc" } },
          invoices: { include: { items: true, project: true }, orderBy: { createdAt: "desc" } }
        }
      }
    }
  })

  if (!client || !client.clientProfile) {
    return notFound()
  }

  const adminUser = await prisma.user.findUnique({
    where: { id: token?.sub as string },
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
    ; (clientProfile.invoices || []).forEach((inv: any) => {
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
      adminUser={adminUser as any}
      clients={allClients}
      activeClientId={id}
      activeClientTab={initialTab}
    >
      <div className="w-full pb-0 flex flex-col h-[calc(100vh-120px)]">
        <div className="w-full max-w-screen-2xl mx-auto flex-1 flex flex-col">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8 mt-2">
            <div className="flex items-start sm:items-center gap-4 sm:gap-6 min-w-0 w-full">
              <div className="min-w-0 flex-1">
                <nav className="flex items-center gap-2 mb-1.5 text-[13px] font-medium text-[#64748B] dark:text-[#94A3B8]">
                  <Link href="/admin/dashboard?tab=clients" className="hover:text-[#0F172A] dark:hover:text-white transition-colors">
                    Clients
                  </Link>
                  <span>/</span>
                  <span className="text-[#0F172A] dark:text-white truncate">{clientProfile.companyName}</span>
                </nav>
                <h1 className="text-2xl sm:text-3xl md:text-4xl text-[#0F172A] dark:text-white font-sans font-normal tracking-tight break-words">{clientProfile.companyName}</h1>
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-3 sm:mt-4 text-[13px] font-medium text-[#475569] dark:text-[#94A3B8]">
                  <div className="flex items-center gap-1.5 hover:text-[#0F172A] dark:hover:text-white transition-colors cursor-default">
                    <Mail className="w-[14px] h-[14px] text-[#94A3B8] dark:text-[#64748B]" />
                    <span>{client.email}</span>
                  </div>

                  <span className="text-[#CBD5E1] dark:text-[#334155] select-none">•</span>

                  <div className="flex items-center gap-1.5 hover:text-[#0F172A] dark:hover:text-white transition-colors cursor-default">
                    <User className="w-[14px] h-[14px] text-[#94A3B8] dark:text-[#64748B]" />
                    <span>{clientProfile.clientName}</span>
                  </div>

                  {clientProfile.website && (
                    <>
                      <span className="text-[#CBD5E1] dark:text-[#334155] select-none">•</span>
                      <a href={clientProfile.website.startsWith('http') ? clientProfile.website : `https://${clientProfile.website}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-[#0F172A] dark:hover:text-white transition-colors">
                        <GlobeIcon className="w-[14px] h-[14px] text-[#94A3B8] dark:text-[#64748B]" />
                        <span>Website</span>
                      </a>
                    </>
                  )}

                  <span className="text-[#CBD5E1] dark:text-[#334155] select-none">•</span>

                  <div className="flex items-center gap-1.5 text-[#0F172A] dark:text-white cursor-default">
                    <Receipt className="w-[14px] h-[14px] text-[#94A3B8] dark:text-[#64748B]" />
                    <span>Earnings: {clientEarningsDisplay}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="ml-[56px] sm:ml-0 shrink-0 flex items-center gap-3">
              <ResetPasswordButton clientId={clientProfile.id} />
            </div>
          </div>

          <Tabs key={initialTab} defaultValue={initialTab} className="w-full flex-1 flex flex-col">
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
                      className={`px-4 py-3 text-[14px] font-normal transition-all relative whitespace-nowrap flex items-center ${isActive
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

            <TabsContent value="overview" className="mt-0 outline-none w-full">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Business Details */}
                <Card className="bg-white dark:bg-[#111111] border-[#E9EDF4] dark:border-[#2A2E35] rounded-[24px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col group">
                  <CardHeader className="pb-4 px-8 pt-7 border-b border-[#F1F5F9] dark:border-[#222]">
                    <CardTitle className="text-xl font-sans font-normal text-[#0F172A] dark:text-white tracking-tight">Business Information</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 content-start">
                    <div className="group/item p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#1A1A1A] hover:bg-[#F1F5F9] dark:hover:bg-[#222] transition-all duration-200 border-0">
                      <div className="flex items-center gap-2 mb-3">
                        <GlobeIcon className="w-4 h-4 text-[#94A3B8] dark:text-[#64748B]" />
                        <p className="text-[12px] font-medium text-[#64748B] dark:text-[#94A3B8]">Website</p>
                      </div>
                      <p className="text-[14px] font-medium text-[#0F172A] dark:text-white group-hover/item:text-[#22C55E] transition-colors break-words">
                        {clientProfile.website ? (
                          <a href={clientProfile.website.startsWith('http') ? clientProfile.website : `https://${clientProfile.website}`} target="_blank" rel="noreferrer" className="hover:underline">
                            {clientProfile.website}
                          </a>
                        ) : "N/A"}
                      </p>
                    </div>

                    <div className="group/item p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#1A1A1A] hover:bg-[#F1F5F9] dark:hover:bg-[#222] transition-all duration-200 border-0">
                      <div className="flex items-center gap-2 mb-3">
                        <Receipt className="w-4 h-4 text-[#94A3B8] dark:text-[#64748B]" />
                        <p className="text-[12px] font-medium text-[#64748B] dark:text-[#94A3B8]">Description</p>
                      </div>
                      <p className="text-[14px] font-medium text-[#0F172A] dark:text-white whitespace-pre-wrap">{clientProfile.description || "N/A"}</p>
                    </div>

                    <div className="group/item p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#1A1A1A] hover:bg-[#F1F5F9] dark:hover:bg-[#222] transition-all duration-200 border-0">
                      <div className="flex items-center gap-2 mb-3">
                        <User className="w-4 h-4 text-[#94A3B8] dark:text-[#64748B]" />
                        <p className="text-[12px] font-medium text-[#64748B] dark:text-[#94A3B8]">Target Audience</p>
                      </div>
                      <p className="text-[14px] font-medium text-[#0F172A] dark:text-white whitespace-pre-wrap">{clientProfile.audience || qna?.audience || "N/A"}</p>
                    </div>

                    <div className="group/item p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#1A1A1A] hover:bg-[#F1F5F9] dark:hover:bg-[#222] transition-all duration-200 border-0">
                      <div className="flex items-center gap-2 mb-3">
                        <ExternalLink className="w-4 h-4 text-[#94A3B8] dark:text-[#64748B]" />
                        <p className="text-[12px] font-medium text-[#64748B] dark:text-[#94A3B8]">Business Goals</p>
                      </div>
                      <p className="text-[14px] font-medium text-[#0F172A] dark:text-white whitespace-pre-wrap">{clientProfile.goals || qna?.goals || "N/A"}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Brand Assets */}
                <Card className="bg-white dark:bg-[#111111] border-[#E9EDF4] dark:border-[#2A2E35] rounded-[24px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col overflow-hidden min-w-0 group">
                  <CardHeader className="pb-4 px-8 pt-7 border-b border-[#F1F5F9] dark:border-[#222]">
                    <CardTitle className="text-xl font-sans font-normal text-[#0F172A] dark:text-white tracking-tight">Brand Assets</CardTitle>
                    <CardDescription className="mt-1 text-[#64748B] dark:text-[#94A3B8] font-normal text-[14px]">Files uploaded by the client during onboarding.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 flex-1 flex flex-col">
                    {clientProfile.brandAssets?.length > 0 ? (
                      <ul className="grid gap-3">
                        {clientProfile.brandAssets.map((asset: any) => (
                          <li key={asset.id} className="group/item flex items-center justify-between p-4 bg-[#F8FAFC] dark:bg-[#1A1A1A] rounded-2xl hover:bg-[#F1F5F9] dark:hover:bg-[#222] transition-all duration-200 border-0">
                            <div className="flex items-center gap-4 overflow-hidden flex-1 min-w-0">
                              <div className="shrink-0 w-12 h-12 rounded-xl bg-white dark:bg-[#2A2E35] shadow-sm flex items-center justify-center text-[#94A3B8] dark:text-[#64748B] group-hover/item:text-[#22C55E] transition-colors">
                                <ImageIcon className="w-5 h-5" />
                              </div>
                              <div className="flex flex-col flex-1 min-w-0 w-full">
                                <span className="truncate text-[14px] font-medium text-[#0F172A] dark:text-white group-hover/item:text-[#22C55E] transition-colors">{asset.type}</span>
                                {asset.description && (
                                  <span className="truncate text-[13px] font-normal text-[#64748B] dark:text-[#888] mt-0.5">
                                    {asset.description}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover/item:opacity-100 transition-opacity ml-4">
                              <div className="flex items-center gap-2">
                                <a href={"/api/file?url=" + encodeURIComponent(asset.fileUrl)} target="_blank" rel="noreferrer" className="flex items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-[#2A2E35] text-[#64748B] dark:text-[#888] hover:bg-[#22C55E] hover:text-white dark:hover:bg-[#22C55E] dark:hover:text-white transition-colors shadow-sm" title="View">
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                                <a href={"/api/file?url=" + encodeURIComponent(asset.fileUrl) + "&download=true"} download className="flex items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-[#2A2E35] text-[#64748B] dark:text-[#888] hover:bg-[#22C55E] hover:text-white dark:hover:bg-[#22C55E] dark:hover:text-white transition-colors shadow-sm" title="Download">
                                  <Download className="w-4 h-4" />
                                </a>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#FAFAFA] dark:bg-[#1A1A1A] rounded-2xl border-2 border-dashed border-[#E5E7EB] dark:border-[#333] transition-all duration-300">
                        <div className="w-16 h-16 bg-white dark:bg-[#111] rounded-full flex items-center justify-center shadow-sm mb-4">
                          <ImageIcon className="w-8 h-8 text-[#cbd5e1] dark:text-[#444]" />
                        </div>
                        <h3 className="text-[15px] font-normal text-[#0F172A] dark:text-white mb-1">No assets uploaded</h3>
                        <p className="text-sm text-[#64748B] dark:text-[#888] max-w-[200px]">The client hasn't uploaded any logos or brand files yet.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* AI Summary */}
                <Card className="md:col-span-2 bg-gradient-to-br from-indigo-50/60 via-white to-purple-50/60 dark:from-indigo-950/20 dark:via-[#111111] dark:to-purple-950/20 border border-indigo-100/50 dark:border-[#2A2E35] rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden relative">
                  <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>
                  <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 px-6 sm:px-8 pt-7 pb-4 border-b border-indigo-100/40 dark:border-[#222]">
                    <div className="min-w-0 flex-1 w-full sm:w-auto relative z-10">
                      <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl font-sans font-medium tracking-normal">
                        <BrainCircuit className="w-6 h-6 text-indigo-500 drop-shadow-sm" />
                        <span className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">AI Analysis</span>
                      </CardTitle>
                      <CardDescription className="mt-2 text-[#64748B] dark:text-[#94A3B8] font-medium text-[14px] break-words">
                        Automated brand extraction and intelligence based on the client's profile.
                      </CardDescription>
                    </div>
                    <div className="shrink-0 w-full sm:w-auto relative z-10">
                      <GenerateAiButton clientProfileId={clientProfile.id} />
                    </div>
                  </CardHeader>
                  <CardContent className="px-6 sm:px-8 py-8 relative z-10">
                    {clientProfile.aiAnalysis ? (
                      <div className="grid gap-6 md:grid-cols-3">
                        <div className="bg-white/60 dark:bg-black/20 backdrop-blur-xl p-6 rounded-2xl border border-white/60 dark:border-white/5 shadow-sm overflow-hidden min-w-0 hover:bg-white/90 dark:hover:bg-black/40 transition-colors">
                          <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent mb-3 break-words">Target Audience</h3>
                          <p className="text-[14px] text-[#0F172A] dark:text-[#E2E8F0] leading-relaxed break-words font-medium">{aiSummary?.targetAudience || "Not analyzed yet."}</p>
                        </div>
                        <div className="bg-white/60 dark:bg-black/20 backdrop-blur-xl p-6 rounded-2xl border border-white/60 dark:border-white/5 shadow-sm overflow-hidden min-w-0 hover:bg-white/90 dark:hover:bg-black/40 transition-colors">
                          <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent mb-3 break-words">Brand Voice</h3>
                          <p className="text-[14px] text-[#0F172A] dark:text-[#E2E8F0] leading-relaxed break-words font-medium">{aiSummary?.brandVoice || "Not analyzed yet."}</p>
                        </div>
                        <div className="bg-white/60 dark:bg-black/20 backdrop-blur-xl p-6 rounded-2xl border border-white/60 dark:border-white/5 shadow-sm overflow-hidden min-w-0 hover:bg-white/90 dark:hover:bg-black/40 transition-colors">
                          <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent mb-3 break-words">Marketing Angle</h3>
                          <p className="text-[14px] text-[#0F172A] dark:text-[#E2E8F0] leading-relaxed break-words font-medium">{aiSummary?.marketingAngle || "Not analyzed yet."}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="py-12 text-center text-[#64748B] dark:text-[#888] bg-white/40 dark:bg-black/20 backdrop-blur-sm rounded-2xl border border-dashed border-indigo-200 dark:border-[#333]">
                        <p className="text-[14px] font-medium">AI Analysis has not been generated for this client yet.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

              </div>
            </TabsContent>

            <TabsContent value="projects" className="mt-8 m-0 animate-in fade-in slide-in-from-bottom-4 duration-700 w-full">
              <ManageProjects clientProfileId={clientProfile.id} initialProjects={clientProfile.projects as any} />
            </TabsContent>

            <TabsContent value="approvals" className="mt-0 outline-none w-full">
              <ManageApprovals clientProfileId={clientProfile.id} initialApprovals={clientProfile.approvals as any} projects={clientProfile.projects as any} />
            </TabsContent>

            <TabsContent value="billing" className="mt-0 outline-none w-full">
              <ManageInvoices clientProfileId={clientProfile.id} initialInvoices={clientProfile.invoices as any} projects={clientProfile.projects as any} />
            </TabsContent>

            <TabsContent value="messages" className="mt-0 outline-none flex-1 flex flex-col w-full">
              <ChatInterface clientProfileId={clientProfile.id} currentUserId={token?.id as string} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AdminSidebarLayout>
  )
}
