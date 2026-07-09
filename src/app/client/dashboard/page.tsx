import { prisma } from "@/lib/prisma"
import { getToken } from "next-auth/jwt"
import { cookies, headers } from "next/headers"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { Download, ExternalLink, Bell, CheckCircle2, Activity, Clock, ShieldCheck, Mail, Upload, Folder, MessageSquare, Calendar, ChevronRight, MoreVertical, Building2, Check } from "lucide-react"
import { PiGlobeDuotone, PiFileTextDuotone, PiUsersDuotone, PiRocketLaunchDuotone, PiImageDuotone, PiChecksDuotone, PiChatCircleDuotone } from "react-icons/pi"
import ClientUploader from "./ClientUploader"
import ChatInterface from "@/components/ChatInterface"
import ProjectTracker from "@/components/ProjectTracker"
import ApprovalReview from "@/components/ApprovalReview"
import ClientInvoices from "@/components/ClientInvoices"
import SignOutButton from "./SignOutButton"
import ClientSidebarLayout from "./ClientSidebarLayout"
import { FadeInStagger, FadeInItem } from "@/components/animations/FadeIn"
import ClientNotificationsTab from "@/components/ClientNotificationsTab"

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }> | { [key: string]: string | string[] | undefined }
}

export default async function ClientDashboardPage({ searchParams }: PageProps) {
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

  // Build tabs based on available data
  const tabs: Array<{ id: string, label: React.ReactNode, content: React.ReactNode }> = [
    {
      id: "overview",
      label: "Overview",
      content: (
        <FadeInStagger className="flex flex-col gap-6">
          {/* Quick Actions Row */}
          <FadeInItem className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="flex items-center justify-between p-4 rounded-[16px] border border-[#E2E8F0] dark:border-[#222] bg-white dark:bg-[#111111] hover:bg-[#F8FAFC] dark:hover:bg-[#1A1A1A] transition-colors group">
              <div className="flex items-center gap-3">
                <Upload className="w-[18px] h-[18px] text-[#10B981]" />
                <span className="text-[14px] font-semibold text-[#0F172A] dark:text-white">Upload Assets</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#64748B] group-hover:text-white transition-colors" />
            </button>
            <button className="flex items-center justify-between p-4 rounded-[16px] border border-[#E2E8F0] dark:border-[#222] bg-white dark:bg-[#111111] hover:bg-[#F8FAFC] dark:hover:bg-[#1A1A1A] transition-colors group">
              <div className="flex items-center gap-3">
                <Folder className="w-[18px] h-[18px] text-[#10B981]" />
                <span className="text-[14px] font-semibold text-[#0F172A] dark:text-white">View Projects</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#64748B] group-hover:text-white transition-colors" />
            </button>
            <button className="flex items-center justify-between p-4 rounded-[16px] border border-[#E2E8F0] dark:border-[#222] bg-white dark:bg-[#111111] hover:bg-[#F8FAFC] dark:hover:bg-[#1A1A1A] transition-colors group">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-[18px] h-[18px] text-[#10B981]" />
                <span className="text-[14px] font-semibold text-[#0F172A] dark:text-white">Contact Agency</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#64748B] group-hover:text-white transition-colors" />
            </button>
            <button className="flex items-center justify-between p-4 rounded-[16px] border border-[#E2E8F0] dark:border-[#222] bg-white dark:bg-[#111111] hover:bg-[#F8FAFC] dark:hover:bg-[#1A1A1A] transition-colors group">
              <div className="flex items-center gap-3">
                <Calendar className="w-[18px] h-[18px] text-[#10B981]" />
                <span className="text-[14px] font-semibold text-[#0F172A] dark:text-white">Schedule Call</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#64748B] group-hover:text-white transition-colors" />
            </button>
          </FadeInItem>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Business Profile Card */}
            <FadeInItem>
            <Card className="bg-white dark:bg-[#111111] border-[#E5E7EB] dark:border-[#222] rounded-[24px] shadow-sm flex flex-col h-full">
              <CardHeader className="pb-4 px-8 pt-7 flex flex-row items-center justify-between border-b border-[#F1F5F9] dark:border-[#222]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#10B981]/10 flex items-center justify-center shrink-0">
                    <Building2 className="w-6 h-6 text-[#10B981]" />
                  </div>
                  <CardTitle className="text-xl font-sans font-bold text-[#0F172A] dark:text-white">Your Business Profile</CardTitle>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#10B981]/10 text-[#10B981] text-[12px] font-bold tracking-wide">
                  <Check className="w-3.5 h-3.5" /> Verified
                </div>
              </CardHeader>
              <CardContent className="p-0 flex-1 flex flex-col">
                <div className="p-6 sm:p-8 border-b border-[#F1F5F9] dark:border-[#222]">
                  <p className="text-[10px] font-bold tracking-[0.15em] text-[#64748B] dark:text-[#888] uppercase mb-1.5">COMPANY NAME</p>
                  <p className="text-xl font-sans font-bold text-[#0F172A] dark:text-white">{clientProfile.companyName}</p>
                </div>
                <div className="grid grid-cols-2 flex-1">
                  <div className="p-6 sm:p-8 border-r border-b border-[#F1F5F9] dark:border-[#222]">
                    <p className="text-[10px] font-bold tracking-[0.15em] text-[#64748B] dark:text-[#888] uppercase mb-1.5">INDUSTRY</p>
                    <p className="text-[14px] font-medium text-[#0F172A] dark:text-white">{clientProfile.industry || "Technology"}</p>
                  </div>
                  <div className="p-6 sm:p-8 border-b border-[#F1F5F9] dark:border-[#222]">
                    <p className="text-[10px] font-bold tracking-[0.15em] text-[#64748B] dark:text-[#888] uppercase mb-1.5">WEBSITE</p>
                    <a href={clientProfile.website || "#"} target="_blank" rel="noreferrer" className="text-[14px] font-medium text-[#10B981] hover:underline">
                      {clientProfile.website?.replace(/^https?:\/\//, '') || "vardhanit.com"}
                    </a>
                  </div>
                  <div className="p-6 sm:p-8 border-r border-[#F1F5F9] dark:border-[#222]">
                    <p className="text-[10px] font-bold tracking-[0.15em] text-[#64748B] dark:text-[#888] uppercase mb-1.5">MEMBER SINCE</p>
                    <p className="text-[14px] font-medium text-[#0F172A] dark:text-white">
                      {new Date(clientProfile.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="p-6 sm:p-8">
                    <p className="text-[10px] font-bold tracking-[0.15em] text-[#64748B] dark:text-[#888] uppercase mb-1.5">STATUS</p>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
                      <span className="text-[12px] font-bold text-[#10B981]">Active Account</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </FadeInItem>

          {/* Upload Assets Card */}
          <FadeInItem>
            <Card className="bg-white dark:bg-[#111111] border-[#E5E7EB] dark:border-[#222] rounded-[24px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:border-[#5A52FF]/30 dark:hover:border-[#10B981]/30 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(90,82,255,0.06)] overflow-hidden flex flex-col h-full">
            <CardHeader className="pb-4 px-8 pt-7 bg-white dark:bg-[#111111] border-b border-[#F1F5F9] dark:border-[#222]">
              <CardTitle className="text-xl font-sans font-bold text-[#0F172A] dark:text-white">Upload New Assets</CardTitle>
              <CardDescription className="mt-2 text-[#64748B] dark:text-[#94A3B8]">
                Need to send us a new logo, document, or brand guideline? Upload it here anytime.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <ClientUploader />
              </CardContent>
            </Card>
          </FadeInItem>

          {/* Uploaded Files Card */}
          <FadeInItem className="md:col-span-2">
            <Card className="bg-white dark:bg-[#111111] border-[#E5E7EB] dark:border-[#222] rounded-[24px] shadow-sm flex flex-col overflow-hidden min-w-0">
            <CardHeader className="pb-4 px-8 pt-7 border-b border-[#F1F5F9] dark:border-[#222] flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-sans font-bold text-[#0F172A] dark:text-white flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#10B981]/10 flex items-center justify-center shrink-0">
                    <PiImageDuotone className="w-4 h-4 text-[#10B981]" />
                  </div>
                  Your Uploaded Files
                </CardTitle>
                <CardDescription className="mt-2 text-[#64748B] dark:text-[#94A3B8]">Files you have uploaded so far.</CardDescription>
              </div>
              <button className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full border border-[#E2E8F0] dark:border-[#333] text-[13px] font-semibold text-[#0F172A] dark:text-white hover:bg-[#F8FAFC] dark:hover:bg-[#1A1A1A] transition-colors">
                View All Files <ChevronRight className="w-4 h-4" />
              </button>
            </CardHeader>
            <CardContent className="p-6 flex-1 flex flex-col">
              {clientProfile.brandAssets.length > 0 ? (
                <ul className="flex flex-col gap-0">
                  {clientProfile.brandAssets.map((asset: any, i: number) => (
                    <li key={asset.id} className={`group flex flex-col md:flex-row md:items-center justify-between p-4 bg-transparent hover:bg-[#FAFAFA] dark:hover:bg-[#161616] transition-colors min-w-0 ${i !== clientProfile.brandAssets.length - 1 ? 'border-b border-[#E2E8F0] dark:border-[#222]' : ''}`}>
                      <div className="flex items-center gap-4 mb-4 md:mb-0 flex-1 min-w-0">
                        {/* Mock Image Thumbnail */}
                        <div className="flex items-center justify-center shrink-0 w-16 h-12 rounded-md bg-[#1A1A1A] border border-[#333] overflow-hidden relative">
                           {asset.type?.includes("image") ? (
                             <Image src={asset.fileUrl} alt={asset.description || "Asset"} fill sizes="64px" className="object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                           ) : (
                             <span className="text-[10px] font-bold text-[#888] uppercase">{asset.fileUrl.split('.').pop()?.substring(0,3)}</span>
                           )}
                        </div>
                        <div className="flex flex-col flex-1 min-w-0 w-full">
                          <p className="text-[15px] font-semibold text-[#0F172A] dark:text-white truncate pr-4">{asset.description || asset.fileUrl.split('/').pop() || "File"}</p>
                          <div className="flex items-center gap-2 mt-1 text-[13px] text-[#64748B] dark:text-[#888]">
                            <PiFileTextDuotone className="w-3.5 h-3.5" />
                            <span className="uppercase">{asset.fileUrl.split('.').pop() || "JPG"}</span>
                            <span>&middot;</span>
                            <span>2.4 MB</span>
                            <span>&middot;</span>
                            <span className="hidden sm:inline">1200 x 800</span>
                          </div>
                        </div>
                      </div>

                      {/* Uploaded Timestamp */}
                      <div className="hidden lg:flex flex-col w-[180px] mr-4">
                        <span className="text-[13px] text-[#64748B] dark:text-[#888]">Uploaded</span>
                        <span className="text-[14px] font-medium text-[#0F172A] dark:text-white">{new Date(asset.createdAt).toLocaleDateString()}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <a href={asset.fileUrl} target="_blank" rel="noreferrer">
                          <Button variant="outline" size="sm" className="h-9 px-4 rounded-lg border-[#E2E8F0] dark:border-[#333] bg-transparent hover:bg-white dark:hover:bg-[#222] text-[#0F172A] dark:text-white transition-colors text-[13px] font-semibold">
                            <ExternalLink className="w-3.5 h-3.5 mr-2" /> View
                          </Button>
                        </a>
                        <a href={`/api/download?url=${encodeURIComponent(asset.fileUrl)}`} download>
                          <Button className="h-9 px-4 rounded-lg bg-[#10B981] hover:bg-[#059669] text-white transition-colors text-[13px] font-semibold">
                            <Download className="w-3.5 h-3.5 mr-2" /> Download
                          </Button>
                        </a>
                        <button className="w-9 h-9 flex items-center justify-center rounded-lg text-[#64748B] dark:text-[#888] hover:bg-[#E2E8F0] dark:hover:bg-[#222] transition-colors shrink-0">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 rounded-[16px] border border-dashed border-[#E5E7EB] dark:border-[#333] bg-[#FAFAFA] dark:bg-[#1A1A1A]">
                  <PiFileTextDuotone className="w-10 h-10 text-[#CBD5E1] dark:text-[#444] mb-3" />
                  <p className="text-sm font-medium text-[#0F172A] dark:text-white">No files uploaded yet</p>
                  <p className="text-xs text-[#64748B] dark:text-[#888] mt-1 max-w-[200px]">Upload assets to see them listed here.</p>
                </div>
              )}
            </CardContent>
            </Card>
          </FadeInItem>
          </div>
        </FadeInStagger>
      )
    }
  ]

  if (clientProfile.projects && clientProfile.projects.length > 0) {
    tabs.push({
      id: "projects",
      label: "Projects",
      content: (
        <FadeInStagger className="space-y-6">
          <FadeInItem>
            <h2 className="text-xl font-bold mb-4 font-sans text-[#0F172A] dark:text-white">Active Projects</h2>
          </FadeInItem>
          {clientProfile.projects.map((project: any) => (
            <FadeInItem key={project.id}>
              <ProjectTracker 
                project={project} 
                assetsCount={clientProfile.brandAssets?.length || 0}
                approvalsCount={clientProfile.approvals?.length || 0}
              />
            </FadeInItem>
          ))}
        </FadeInStagger>
      )
    })
  }

  if (clientProfile.approvals && clientProfile.approvals.length > 0) {
    tabs.push({
      id: "approvals",
      label: "Approvals",
      content: (
        <FadeInStagger>
          <FadeInItem>
            <ApprovalReview approvals={clientProfile.approvals as any} />
          </FadeInItem>
        </FadeInStagger>
      )
    })
  }

  if (clientProfile.invoices) {
    tabs.push({
      id: "billing",
      label: "Billing",
      content: (
        <FadeInStagger>
          <FadeInItem>
            <ClientInvoices invoices={clientProfile.invoices as any} clientProfile={clientProfile} />
          </FadeInItem>
        </FadeInStagger>
      )
    })
  }

  tabs.push({
    id: "notifications",
    label: "Notifications",
    content: (
      <FadeInStagger>
        <FadeInItem>
          <ClientNotificationsTab />
        </FadeInItem>
      </FadeInStagger>
    )
  })

  tabs.push({
    id: "messages",
    label: (
      <>
        Messages
        {unreadCount > 0 && (
          <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#5A52FF] text-[10px] font-bold text-white shadow-[0_2px_8px_rgba(90,82,255,0.4)]">
            {unreadCount}
          </span>
        )}
      </>
    ),
    content: (
      <FadeInStagger>
        <FadeInItem>
          <ChatInterface clientProfileId={clientProfile.id} currentUserId={token.id as string} />
        </FadeInItem>
      </FadeInStagger>
    )
  })

  // Determine current active project (most recent)
  const currentProject = clientProfile.projects?.[0]?.name || "No active project"
  const currentHour = new Date().getHours()
  let greeting = "Good Morning"
  if (currentHour >= 12 && currentHour < 17) greeting = "Good Afternoon"
  else if (currentHour >= 17) greeting = "Good Evening"

  return (
    <ClientSidebarLayout 
      tabs={tabs} 
      initialTab={initialTab} 
      clientProfile={clientProfile} 
      currentProject={currentProject} 
    />
  )
}
