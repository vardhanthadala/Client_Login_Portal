import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { Download, ExternalLink, Bell, CheckCircle2, Activity, Clock, ShieldCheck, Mail, Upload, Folder, MessageSquare, Calendar, ChevronRight, MoreVertical, Building2, Check, DollarSign, IndianRupee, Euro, PoundSterling, Briefcase, Monitor, MoreHorizontal } from "lucide-react"
import { PiGlobeDuotone, PiFileTextDuotone, PiUsersDuotone, PiRocketLaunchDuotone, PiImageDuotone, PiChecksDuotone, PiChatCircleDuotone } from "react-icons/pi"
import ClientUploader from "./ClientUploader"
import ChatInterface from "@/components/ChatInterface"
import ProjectsDashboard from "./ProjectsDashboard"
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

  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    redirect("/login")
  }

  const clientProfile = await prisma.clientProfile.findUnique({
    where: { userId: userId as string },
    include: {
      brandAssets: {
        orderBy: { createdAt: 'desc' }
      },
      aiAnalysis: true,
      projects: { include: { approvals: { include: { items: { include: { feedback: true }, orderBy: { createdAt: "asc" } } }, orderBy: { createdAt: "desc" } } }, orderBy: { createdAt: 'asc' } },
      messages: {
        where: { isRead: false },
        orderBy: { createdAt: 'desc' }
      },
      approvals: { include: { items: { include: { feedback: true }, orderBy: { createdAt: "asc" } } }, orderBy: { createdAt: "desc" } },
      invoices: { include: { items: true, project: true }, orderBy: { createdAt: "desc" } }
    }
  })

  // If they haven't completed the onboarding wizard (SLA not agreed to), force them back
  if (!clientProfile?.slaAgreed) {
    redirect("/client/onboarding")
  }

  // Inject mock approvals if empty (for demo/notification purposes)
  if (clientProfile && (!clientProfile.approvals || clientProfile.approvals.length === 0)) {
    const mockApproval = {
      id: "mock-approval-1",
      title: "Video Editing Assets",
      description: "Please review these assets.",
      items: [
        {
          id: "mock-item-1",
          fileName: "Video_Draft.mp4",
          fileType: "video/mp4",
          status: "PENDING",
          version: 1,
          feedback: []
        }
      ],
      createdAt: new Date().toISOString()
    };
    (clientProfile as any).approvals = [mockApproval];
  }

  const unreadCount = (clientProfile.messages || []).filter(m => m.senderId !== (userId as string)).length

  // --- Calculate Metrics ---
  // Invoices
  const allInvoices = clientProfile.invoices || [];
  const unpaidInvoices = allInvoices.filter(i => ["SENT", "OVERDUE", "PENDING", "UNPAID"].includes(i.status));
  const totalInvoicesCount = allInvoices.length;
  const unpaidInvoicesCount = unpaidInvoices.length;
  const unpaidAmount = unpaidInvoices.reduce((sum, i) => sum + (i.amount || 0), 0);
  const totalAmount = allInvoices.reduce((sum, i) => sum + (i.amount || 0), 0);
  const paidAmount = totalAmount - unpaidAmount;
  const invoicePercentage = totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : (totalInvoicesCount > 0 ? 100 : 0);

  const currencyCode = (unpaidInvoices[0]?.currency || allInvoices[0]?.currency || "USD").toUpperCase();
  const currencySymbol = currencyCode === "INR" ? "₹" : currencyCode === "EUR" ? "€" : currencyCode === "GBP" ? "£" : "$";
  const CurrencyIcon = currencyCode === "INR" ? IndianRupee : currencyCode === "EUR" ? Euro : currencyCode === "GBP" ? PoundSterling : DollarSign;

  // Projects
  const allProjects = clientProfile.projects || [];
  const totalProjectsCount = allProjects.length;
  const activeProjectsCount = allProjects.filter(p => {
    const stages = (p.stages as string[]) || [];
    const maxIdx = Math.max(1, stages.length - 1);
    const rawProgress = stages.length > 0 
      ? Math.round(((p.currentStageIdx ?? 0) / maxIdx) * 100)
      : 0;
    return rawProgress < 100;
  }).length;
  const completedProjectsCount = totalProjectsCount - activeProjectsCount;
  const projectPercentage = totalProjectsCount > 0 ? Math.round((completedProjectsCount / totalProjectsCount) * 100) : 0;

  // Approvals
  const allApprovals = clientProfile.approvals || [];
  const allApprovalItems = allApprovals.flatMap(a => a.items || []);
  const totalApprovalItemsCount = allApprovalItems.length;
  const isAllProjectsCompleted = totalProjectsCount > 0 && completedProjectsCount === totalProjectsCount;
  
  const pendingApprovalItemsCount = isAllProjectsCompleted
    ? 0
    : allApprovalItems.filter(item => item.status === "PENDING").length;
  const completedApprovalItemsCount = isAllProjectsCompleted
    ? totalApprovalItemsCount
    : totalApprovalItemsCount - pendingApprovalItemsCount;
  const approvalPercentage = totalApprovalItemsCount > 0 
    ? Math.round((completedApprovalItemsCount / totalApprovalItemsCount) * 100) 
    : (isAllProjectsCompleted ? 100 : 0);

  // Assets
  const totalAssetsCount = clientProfile.brandAssets?.length || 0;

  // Build tabs based on available data
  const tabs: Array<{ id: string, label: React.ReactNode, content: React.ReactNode }> = [
    {
      id: "overview",
      label: "Overview",
      content: (
        <FadeInStagger className="flex flex-col gap-5">
          {/* Top Duralux Stat Cards Grid */}
          <FadeInItem className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            
            {/* Invoices Card */}
            <div className="bg-white dark:bg-[#111111] border border-[#E2E8F0] dark:border-[#222] rounded-[12px] p-5 shadow-sm flex flex-col relative">

              <div className="flex items-start gap-3 mb-5">
                <div className="w-10 h-10 rounded-full bg-[#F1F5F9] dark:bg-[#1A1A1A] flex items-center justify-center shrink-0">
                  <CurrencyIcon size={18} className="text-[#64748B] dark:text-[#94A3B8]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[20px] font-medium text-[#0F172A] dark:text-white leading-none mb-1">
                    {unpaidInvoicesCount}/{totalInvoicesCount}
                  </span>
                  <span className="text-[12px] font-normal text-[#64748B] dark:text-[#94A3B8]">Invoices Awaiting Payment</span>
                </div>
              </div>
              <div className="mt-auto">
                <div className="flex items-center justify-between text-[12px] mb-2 font-normal">
                  <span className="text-[#64748B] dark:text-[#94A3B8]">Invoices Awaiting Payment</span>
                  <span className="text-[#0F172A] dark:text-white">{currencySymbol}{(unpaidAmount).toLocaleString(currencyCode === 'INR' ? 'en-IN' : 'en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} <span className="text-[#64748B] dark:text-[#94A3B8] font-normal">({invoicePercentage}%)</span></span>
                </div>
                <div className="w-full h-1 bg-[#F1F5F9] dark:bg-[#222] rounded-full overflow-hidden">
                  <div className="h-full bg-[#3454D1] rounded-full" style={{ width: `${invoicePercentage}%` }}></div>
                </div>
              </div>
            </div>

            {/* Projects Card */}
            <div className="bg-white dark:bg-[#111111] border border-[#E2E8F0] dark:border-[#222] rounded-[12px] p-5 shadow-sm flex flex-col relative">

              <div className="flex items-start gap-3 mb-5">
                <div className="w-10 h-10 rounded-full bg-[#F1F5F9] dark:bg-[#1A1A1A] flex items-center justify-center shrink-0">
                  <Briefcase size={18} className="text-[#64748B] dark:text-[#94A3B8]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[20px] font-medium text-[#0F172A] dark:text-white leading-none mb-1">
                    {activeProjectsCount}/{totalProjectsCount}
                  </span>
                  <span className="text-[12px] font-normal text-[#64748B] dark:text-[#94A3B8]">Projects In Progress</span>
                </div>
              </div>
              <div className="mt-auto">
                <div className="flex items-center justify-between text-[12px] mb-2 font-normal">
                  <span className="text-[#64748B] dark:text-[#94A3B8]">Projects In Progress</span>
                  <span className="text-[#0F172A] dark:text-white">{completedProjectsCount} Completed <span className="text-[#64748B] dark:text-[#94A3B8] font-normal">({projectPercentage}%)</span></span>
                </div>
                <div className="w-full h-1 bg-[#F1F5F9] dark:bg-[#222] rounded-full overflow-hidden">
                  <div className="h-full bg-[#10B981] rounded-full" style={{ width: `${projectPercentage}%` }}></div>
                </div>
              </div>
            </div>

            {/* Approvals / Converted Leads Card */}
            <div className="bg-white dark:bg-[#111111] border border-[#E2E8F0] dark:border-[#222] rounded-[12px] p-5 shadow-sm flex flex-col relative">

              <div className="flex items-start gap-3 mb-5">
                <div className="w-10 h-10 rounded-full bg-[#F1F5F9] dark:bg-[#1A1A1A] flex items-center justify-center shrink-0">
                  <Monitor size={18} className="text-[#64748B] dark:text-[#94A3B8]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[20px] font-medium text-[#0F172A] dark:text-white leading-none mb-1">
                    {pendingApprovalItemsCount}
                  </span>
                  <span className="text-[12px] font-normal text-[#64748B] dark:text-[#94A3B8]">Pending Approvals</span>
                </div>
              </div>
              <div className="mt-auto">
                <div className="flex items-center justify-between text-[12px] mb-2 font-normal">
                  <span className="text-[#64748B] dark:text-[#94A3B8]">Approvals Completed</span>
                  <span className="text-[#0F172A] dark:text-white">{completedApprovalItemsCount} Completed <span className="text-[#64748B] dark:text-[#94A3B8] font-normal">({approvalPercentage}%)</span></span>
                </div>
                <div className="w-full h-1 bg-[#F1F5F9] dark:bg-[#222] rounded-full overflow-hidden">
                  <div className="h-full bg-[#F59E0B] rounded-full" style={{ width: `${approvalPercentage}%` }}></div>
                </div>
              </div>
            </div>

            {/* Activity / Conversion Rate Card */}
            <div className="bg-white dark:bg-[#111111] border border-[#E2E8F0] dark:border-[#222] rounded-[12px] p-5 shadow-sm flex flex-col relative">

              <div className="flex items-start gap-3 mb-5">
                <div className="w-10 h-10 rounded-full bg-[#F1F5F9] dark:bg-[#1A1A1A] flex items-center justify-center shrink-0">
                  <Activity size={18} className="text-[#64748B] dark:text-[#94A3B8]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[20px] font-medium text-[#0F172A] dark:text-white leading-none mb-1">
                    {totalAssetsCount}
                  </span>
                  <span className="text-[12px] font-normal text-[#64748B] dark:text-[#94A3B8]">Total Assets</span>
                </div>
              </div>
              <div className="mt-auto">
                <div className="flex items-center justify-between text-[12px] mb-2 font-normal">
                  <span className="text-[#64748B] dark:text-[#94A3B8]">Asset Utilization</span>
                  <span className="text-[#0F172A] dark:text-white">Active <span className="text-[#64748B] dark:text-[#94A3B8] font-normal">(100%)</span></span>
                </div>
                <div className="w-full h-1 bg-[#F1F5F9] dark:bg-[#222] rounded-full overflow-hidden">
                  <div className="h-full bg-[#EF4444] rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>
            </div>
          </FadeInItem>

          <div className="grid md:grid-cols-2 gap-5">
            {/* Business Profile Card (Restyled to Duralux) */}
            <FadeInItem>
            <div className="bg-white dark:bg-[#111111] border border-[#E2E8F0] dark:border-[#222] rounded-[12px] shadow-sm flex flex-col h-full overflow-hidden">
              <div className="pb-3 px-5 pt-5 flex flex-row items-center justify-between border-b border-[#E2E8F0] dark:border-[#222]">
                <div className="flex items-center gap-3">
                  <h2 className="text-[15px] font-medium text-[#0F172A] dark:text-white">Your Business Profile</h2>
                </div>

              </div>
              <div className="p-0 flex-1 flex flex-col">
                <div className="p-5 border-b border-[#E2E8F0] dark:border-[#222]">
                  <p className="text-[11px] font-normal text-[#64748B] dark:text-[#94A3B8] mb-1 uppercase">Company Name</p>
                  <p className="text-[15px] font-medium text-[#0F172A] dark:text-white">{clientProfile.companyName}</p>
                </div>
                <div className="grid grid-cols-2 flex-1">
                  <div className="p-5 border-r border-b border-[#E2E8F0] dark:border-[#222]">
                    <p className="text-[11px] font-normal text-[#64748B] dark:text-[#94A3B8] mb-1 uppercase">Industry</p>
                    <p className="text-[13px] font-normal text-[#0F172A] dark:text-white truncate">{clientProfile.industry || "Technology"}</p>
                  </div>
                  <div className="p-5 border-b border-[#E2E8F0] dark:border-[#222]">
                    <p className="text-[11px] font-normal text-[#64748B] dark:text-[#94A3B8] mb-1 uppercase">Website</p>
                    <a href={clientProfile.website || "#"} target="_blank" rel="noreferrer" className="text-[13px] font-normal text-[#3454D1] hover:underline truncate block">
                      {clientProfile.website?.replace(/^https?:\/\//, '') || "vardhanit.com"}
                    </a>
                  </div>
                  <div className="p-5 border-r border-[#E2E8F0] dark:border-[#222]">
                    <p className="text-[11px] font-normal text-[#64748B] dark:text-[#94A3B8] mb-1 uppercase">Member Since</p>
                    <p className="text-[13px] font-normal text-[#0F172A] dark:text-white">
                      {new Date(clientProfile.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="p-5">
                    <p className="text-[11px] font-normal text-[#64748B] dark:text-[#94A3B8] mb-1 uppercase">Status</p>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#10B981]/10 text-[#10B981] text-[11px] font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
                      Active Account
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </FadeInItem>

          {/* Upload Assets Card (Restyled to Duralux) */}
          <FadeInItem className="min-w-0">
            <div className="bg-white dark:bg-[#111111] border border-[#E2E8F0] dark:border-[#222] rounded-[12px] shadow-sm flex flex-col h-full min-w-0 overflow-hidden">
            <div className="pb-3 px-5 pt-5 border-b border-[#E2E8F0] dark:border-[#222]">
              <h2 className="text-[15px] font-medium text-[#0F172A] dark:text-white">Upload New Assets</h2>
              <p className="mt-1 text-[12px] text-[#64748B] dark:text-[#94A3B8]">
                Need to send us a new logo, document, or brand guideline? Upload it here anytime.
              </p>
            </div>
            <div className="p-5">
              <ClientUploader projects={clientProfile.projects as any} />
              </div>
            </div>
          </FadeInItem>

          {/* Uploaded Files Card (Restyled to Duralux) */}
          <FadeInItem className="md:col-span-2">
            <div className="bg-white dark:bg-[#111111] border border-[#E2E8F0] dark:border-[#222] rounded-[12px] shadow-sm flex flex-col overflow-hidden min-w-0">
            <div className="pb-3 px-5 pt-5 border-b border-[#E2E8F0] dark:border-[#222] flex flex-row items-center justify-between">
              <div>
                <h2 className="text-[15px] font-medium text-[#0F172A] dark:text-white flex items-center gap-2">
                  Your Uploaded Files
                </h2>
              </div>

            </div>
            <div className="p-0 flex-1 flex flex-col">
              {clientProfile.brandAssets.length > 0 ? (
                <ul className="flex flex-col gap-0">
                  {clientProfile.brandAssets.map((asset: any, i: number) => (
                    <li key={asset.id} className={`group flex flex-col md:flex-row md:items-center justify-between p-4 px-6 bg-transparent hover:bg-[#F8FAFC] dark:hover:bg-[#1A1A1A] transition-colors min-w-0 ${i !== clientProfile.brandAssets.length - 1 ? 'border-b border-[#E2E8F0] dark:border-[#222]' : ''}`}>
                      <div className="flex items-center gap-4 mb-4 md:mb-0 flex-1 min-w-0">
                        {/* Mock Image Thumbnail */}
                        <div className="flex items-center justify-center shrink-0 w-12 h-12 rounded-[8px] bg-[#F1F5F9] dark:bg-[#1A1A1A] border border-[#E2E8F0] dark:border-[#333] overflow-hidden relative">
                           {asset.type?.includes("image") ? (
                             <Image src={`/api/file?url=${encodeURIComponent(asset.fileUrl)}`} alt={asset.description || "Asset"} fill sizes="48px" className="object-cover opacity-80 group-hover:opacity-100 transition-opacity" unoptimized={true} />
                           ) : (
                             <span className="text-[10px] font-normal text-[#64748B] uppercase">{asset.fileUrl.split('.').pop()?.substring(0,3)}</span>
                           )}
                        </div>
                        <div className="flex flex-col flex-1 min-w-0 w-full">
                          <p className="text-[14px] font-normal text-[#0F172A] dark:text-white truncate">{asset.description || asset.fileUrl.split('/').pop() || "File"}</p>
                          <div className="flex items-center gap-2 mt-0.5 text-[12px] font-normal text-[#64748B] dark:text-[#94A3B8]">
                            <span className="uppercase">{asset.fileUrl.split('.').pop() || "JPG"}</span>
                            <span>&middot;</span>
                            <span>2.4 MB</span>
                          </div>
                        </div>
                      </div>

                      {/* Uploaded Timestamp */}
                      <div className="hidden lg:flex flex-col w-[180px] mr-4">
                        <span className="text-[12px] font-normal text-[#64748B] dark:text-[#94A3B8]">Uploaded</span>
                        <span className="text-[13px] font-normal text-[#0F172A] dark:text-white">{new Date(asset.createdAt).toLocaleDateString()}</span>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <a href={"/api/file?url=" + encodeURIComponent(asset.fileUrl)} target="_blank" rel="noreferrer" className="flex items-center justify-center px-3 py-1.5 rounded-[6px] bg-[#F1F5F9] dark:bg-[#222] hover:bg-[#E2E8F0] dark:hover:bg-[#333] text-[#343A40] dark:text-white transition-colors text-[12px] font-normal">
                          View
                        </a>
                        <a href={"/api/file?url=" + encodeURIComponent(asset.fileUrl) + "&download=true"} download className="flex items-center justify-center px-3 py-1.5 rounded-[6px] bg-[#3454D1] hover:bg-[#2842A8] text-white transition-colors text-[12px] font-normal">
                          Download
                        </a>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-10 bg-transparent">
                  <p className="text-[14px] font-normal text-[#64748B] dark:text-[#94A3B8]">No files uploaded yet.</p>
                </div>
              )}
            </div>
            </div>
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
        <FadeInStagger className="w-full">
          <FadeInItem className="w-full">
            <ProjectsDashboard 
              projects={clientProfile.projects as any} 
              clientName={clientProfile.clientName}
              assets={(clientProfile.brandAssets as any) || []}
            />
          </FadeInItem>
        </FadeInStagger>
      )
    })
  }

  tabs.push({
    id: "approvals",
    label: "Approvals",
    content: (
      <FadeInStagger>
        <FadeInItem>
          <ApprovalReview projects={clientProfile.projects as any} />
        </FadeInItem>
      </FadeInStagger>
    )
  })

  tabs.push({
    id: "billing",
    label: "Billing",
    content: (
      <FadeInStagger>
        <FadeInItem>
          <ClientInvoices invoices={clientProfile.invoices as any || []} clientProfile={clientProfile} />
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
          <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#5A52FF] text-[10px] font-normal text-white shadow-[0_2px_8px_rgba(90,82,255,0.4)]">
            {unreadCount}
          </span>
        )}
      </>
    ),
    content: (
      <FadeInStagger>
        <FadeInItem>
          <ChatInterface clientProfileId={clientProfile.id} currentUserId={userId as string} />
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
      clientProfile={{ ...clientProfile, email: session?.user?.email } as any} 
      currentProject={currentProject} 
    />
  )
}
