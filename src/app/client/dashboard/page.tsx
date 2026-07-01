import { prisma } from "@/lib/prisma"
import { getToken } from "next-auth/jwt"
import { cookies, headers } from "next/headers"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { Download, ExternalLink, Bell, Globe as GlobeIcon, Image as ImageIcon } from "lucide-react"
import { PiGlobeDuotone, PiFileTextDuotone, PiUsersDuotone, PiRocketLaunchDuotone, PiImageDuotone } from "react-icons/pi"
import ClientUploader from "./ClientUploader"
import ChatInterface from "@/components/ChatInterface"
import ProjectTracker from "@/components/ProjectTracker"
import ApprovalReview from "@/components/ApprovalReview"
import ClientInvoices from "@/components/ClientInvoices"
import SignOutButton from "./SignOutButton"

export default async function ClientDashboardPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const resolvedSearchParams = await searchParams;
  const initialTab = (resolvedSearchParams?.tab as string) || "overview";

  const reqCookies = await cookies()
  const reqHeaders = await headers()

  const req = {
    cookies: Object.fromEntries(reqCookies.getAll().map(c => [c.name, c.value])),
    headers: Object.fromEntries(reqHeaders.entries())
  } as any

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || "c4d8Y0Pq9rK2nX7fWm3JvL8aZs1QeH5tBg9NpRx6UcIyEoDn" })

  if (!token?.id) {
    redirect("/login")
  }

  const clientProfile = await prisma.clientProfile.findUnique({
    where: { userId: token.id as string },
    include: {
      brandAssets: {
        orderBy: { createdAt: 'desc' }
      },
      aiAnalysis: true,
      projects: { orderBy: { createdAt: 'asc' } },
      messages: {
        where: { isRead: false },
        select: { id: true, senderId: true }
      },
      approvals: { include: { items: { include: { feedback: true }, orderBy: { createdAt: "asc" } } }, orderBy: { createdAt: "desc" } },
      invoices: { include: { items: true }, orderBy: { createdAt: "desc" } }
    }
  })

  // If they haven't completed the onboarding wizard (SLA not agreed to), force them back
  if (!clientProfile?.slaAgreed) {
    redirect("/client/onboarding")
  }

  const unreadCount = (clientProfile.messages || []).filter(m => m.senderId !== (token.id as string)).length

  return (
    <div className="min-h-screen w-full px-4 md:px-8 lg:px-12 xl:px-24 pt-12 pb-32 bg-[#FAFAFA] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/40 via-[#FAFAFA] to-[#FAFAFA]">
      <div className="max-w-screen-2xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
        <div>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <h1 className="text-4xl sm:text-5xl text-foreground leading-tight tracking-[-0.02em] font-bold">
              Welcome, {clientProfile.clientName}
            </h1>
            {unreadCount > 0 && (
              <span className="relative flex items-center gap-1 px-2.5 py-1 rounded-full bg-destructive/10 text-destructive text-sm font-bold" title={`${unreadCount} new message(s) from admin`}>
                <Bell className="w-4 h-4" />
                {unreadCount}
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-destructive animate-ping" />
              </span>
            )}
            <span className="px-3 py-1 rounded-full text-xs uppercase tracking-[0.12em] font-bold bg-[#5A52FF]/10 text-[#5A52FF] shadow-sm">
              {clientProfile.status || "ONBOARDED"}
            </span>
          </div>
          <p className="text-muted-foreground mt-4 text-base leading-relaxed max-w-2xl">
            Manage your brand assets and view your profile.
          </p>
        </div>
        <div className="w-full sm:w-auto mt-2 sm:mt-0 shrink-0">
          <SignOutButton />
        </div>
      </div>

      <Tabs defaultValue={initialTab} className="w-full">
        <TabsList className="w-full flex justify-start border-b border-slate-200 bg-transparent p-0 h-auto rounded-none mb-12 gap-8 overflow-x-auto hidden-scrollbar">
          <TabsTrigger value="overview" className="relative rounded-none border-b-2 border-transparent bg-transparent px-1 py-4 text-[15px] font-sans font-semibold text-slate-500 hover:text-slate-900 data-[state=active]:border-[#5A52FF] data-[state=active]:text-[#5A52FF] data-[state=active]:bg-transparent data-[state=active]:shadow-none focus-visible:outline-none focus-visible:ring-0 transition-all">Overview</TabsTrigger>
          {clientProfile.projects && clientProfile.projects.length > 0 && (
            <TabsTrigger value="projects" className="relative rounded-none border-b-2 border-transparent bg-transparent px-1 py-4 text-[15px] font-sans font-semibold text-slate-500 hover:text-slate-900 data-[state=active]:border-[#5A52FF] data-[state=active]:text-[#5A52FF] data-[state=active]:bg-transparent data-[state=active]:shadow-none focus-visible:outline-none focus-visible:ring-0 transition-all">Projects</TabsTrigger>
          )}
          {clientProfile.approvals && clientProfile.approvals.length > 0 && (
            <TabsTrigger value="approvals" className="relative rounded-none border-b-2 border-transparent bg-transparent px-1 py-4 text-[15px] font-sans font-semibold text-slate-500 hover:text-slate-900 data-[state=active]:border-[#5A52FF] data-[state=active]:text-[#5A52FF] data-[state=active]:bg-transparent data-[state=active]:shadow-none focus-visible:outline-none focus-visible:ring-0 transition-all">Approvals</TabsTrigger>
          )}
          {clientProfile.invoices && (
            <TabsTrigger value="billing" className="relative rounded-none border-b-2 border-transparent bg-transparent px-1 py-4 text-[15px] font-sans font-semibold text-slate-500 hover:text-slate-900 data-[state=active]:border-[#5A52FF] data-[state=active]:text-[#5A52FF] data-[state=active]:bg-transparent data-[state=active]:shadow-none focus-visible:outline-none focus-visible:ring-0 transition-all">Billing & Invoices</TabsTrigger>
          )}
          <TabsTrigger value="messages" className="relative rounded-none border-b-2 border-transparent bg-transparent px-1 py-4 text-[15px] font-sans font-semibold text-slate-500 hover:text-slate-900 data-[state=active]:border-[#5A52FF] data-[state=active]:text-[#5A52FF] data-[state=active]:bg-transparent data-[state=active]:shadow-none focus-visible:outline-none focus-visible:ring-0 transition-all">
            Messages
            {unreadCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-destructive text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-0 outline-none">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Business Profile Card */}
            <Card className="bg-white border-[#E5E7EB] rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:border-[#5A52FF]/30 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(90,82,255,0.06)] overflow-hidden flex flex-col">
              <CardHeader className="pb-4 px-8 pt-7 bg-white border-b border-[#F1F5F9]">
                <CardTitle className="text-xl font-sans font-bold text-[#0F172A]">Your Business Profile</CardTitle>
              </CardHeader>
              <CardContent className="p-6 grid gap-4 flex-1">
                <div className="group p-4 rounded-xl border border-transparent hover:border-[#E5E7EB] hover:bg-[#FAFAFA] transition-all duration-200">
                  <div className="flex items-center gap-2 mb-2">
                    <PiGlobeDuotone className="w-5 h-5 text-[#5A52FF]" />
                    <p className="text-[11px] font-bold tracking-[0.15em] text-[#64748B] uppercase">Company Name</p>
                  </div>
                  <p className="text-[15px] font-medium text-[#0F172A] pl-6 group-hover:text-[#5A52FF] transition-colors">{clientProfile.companyName}</p>
                </div>
                
                <div className="group p-4 rounded-xl border border-transparent hover:border-[#E5E7EB] hover:bg-[#FAFAFA] transition-all duration-200">
                  <div className="flex items-center gap-2 mb-2">
                    <PiFileTextDuotone className="w-5 h-5 text-[#5A52FF]" />
                    <p className="text-[11px] font-bold tracking-[0.15em] text-[#64748B] uppercase">Description</p>
                  </div>
                  <p className="text-[14px] text-[#334155] leading-relaxed pl-6">{clientProfile.description || "N/A"}</p>
                </div>
              </CardContent>
            </Card>

            {/* Upload Assets Card */}
            <Card className="bg-white border-[#E5E7EB] rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:border-[#5A52FF]/30 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(90,82,255,0.06)] overflow-hidden flex flex-col">
              <CardHeader className="pb-4 px-8 pt-7 bg-white border-b border-[#F1F5F9]">
                <CardTitle className="text-xl font-sans font-bold text-[#0F172A]">Upload New Assets</CardTitle>
                <CardDescription className="mt-2 text-[#64748B]">
                  Need to send us a new logo, document, or brand guideline? Upload it here anytime.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <ClientUploader />
              </CardContent>
            </Card>

            {/* Uploaded Files Card */}
            <Card className="md:col-span-2 bg-white border-[#E5E7EB] rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:border-[#5A52FF]/30 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(90,82,255,0.06)] flex flex-col overflow-hidden min-w-0">
              <CardHeader className="pb-4 px-8 pt-7 bg-white border-b border-[#F1F5F9]">
                <CardTitle className="text-xl font-sans font-bold text-[#0F172A]">Your Uploaded Files</CardTitle>
                <CardDescription className="mt-2 text-[#64748B]">Files you have uploaded so far.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 flex-1 flex flex-col">
                {clientProfile.brandAssets.length > 0 ? (
                  <ul className="grid gap-3">
                    {clientProfile.brandAssets.map((asset: any) => (
                      <li key={asset.id} className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-[#E5E7EB] bg-white hover:border-[#5A52FF]/30 hover:shadow-[0_4px_12px_rgba(90,82,255,0.05)] transition-all duration-300 overflow-hidden min-w-0">
                        <div className="flex items-center gap-4 mb-3 sm:mb-0 flex-1 min-w-0">
                          <div className="flex items-center justify-center shrink-0 w-10 h-10 rounded-full bg-[#F8FAFC] text-[#5A52FF] group-hover:bg-[#5A52FF]/10 transition-colors">
                            <PiImageDuotone className="w-5 h-5" />
                          </div>
                          <div className="flex flex-col flex-1 min-w-0 w-full">
                            <p className="text-sm font-semibold text-[#0F172A] break-all">{asset.type || "Asset"}</p>
                            <p className="text-xs text-[#64748B] mt-1 break-words">
                              {asset.description || "Uploaded recently"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <a href={asset.fileUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center px-4 py-2 text-xs font-semibold text-[#64748B] bg-[#F8FAFC] border border-[#E5E7EB] rounded-lg hover:text-[#0F172A] hover:bg-white transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                            <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> View
                          </a>
                          <a href={`/api/download?url=${encodeURIComponent(asset.fileUrl)}`} download className="flex items-center justify-center px-4 py-2 text-xs font-semibold text-white bg-[#0F172A] rounded-lg hover:bg-[#5A52FF] transition-all shadow-[0_2px_8px_rgba(15,23,42,0.15)] hover:shadow-[0_4px_12px_rgba(90,82,255,0.25)]">
                            <Download className="w-3.5 h-3.5 mr-1.5" /> Download
                          </a>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-xl border border-dashed border-[#E5E7EB] bg-[#FAFAFA]/50">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#F1F5F9] mb-4">
                      <PiImageDuotone className="w-6 h-6 text-[#94A3B8]" />
                    </div>
                    <p className="text-[15px] font-semibold text-[#0F172A] mb-1">No assets uploaded yet</p>
                    <p className="text-[14px] text-[#64748B] max-w-sm">Use the uploader to add your files.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {clientProfile.projects && clientProfile.projects.length > 0 && (
          <TabsContent value="projects" className="mt-0 outline-none space-y-6">
            <h2 className="text-xl font-bold mb-4 font-sans text-[#0F172A]">Active Projects</h2>
            {clientProfile.projects.map((project: any) => (
              <ProjectTracker key={project.id} project={project} />
            ))}
          </TabsContent>
        )}

        {clientProfile.approvals && clientProfile.approvals.length > 0 && (
          <TabsContent value="approvals" className="mt-0 outline-none">
            <ApprovalReview approvals={clientProfile.approvals as any} />
          </TabsContent>
        )}

        {clientProfile.invoices && (
          <TabsContent value="billing" className="mt-0 outline-none">
            <ClientInvoices invoices={clientProfile.invoices as any} clientProfile={clientProfile} />
          </TabsContent>
        )}

        <TabsContent value="messages" className="mt-0 outline-none">
          <ChatInterface clientProfileId={clientProfile.id} currentUserId={token.id as string} />
        </TabsContent>
      </Tabs>
      </div>
    </div>
  )
}
