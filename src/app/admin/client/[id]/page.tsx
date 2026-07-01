import { prisma } from "@/lib/prisma"
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
import { getToken } from "next-auth/jwt"
import { cookies, headers } from "next/headers"
export default async function ClientDetailsPage({ params, searchParams }: { params: { id: string }, searchParams: { [key: string]: string | string[] | undefined } }) {
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
    include: {
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

  const { clientProfile } = client
  const aiSummary = clientProfile.aiAnalysis?.summary as any || {}
  const qna = clientProfile.questionnaire?.qna as any || {}

  return (
    <div className="w-full px-4 md:px-8 lg:px-12 xl:px-24 pt-12 pb-32">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-6">
          <Link 
            href="/admin/dashboard" 
            className="flex items-center justify-center w-12 h-12 bg-white border border-[#E5E7EB] text-[#64748B] hover:text-[#5A52FF] hover:border-[#5A52FF]/30 rounded-full transition-all duration-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_14px_rgba(90,82,255,0.15)] hover:-translate-x-0.5 shrink-0"
            title="Back to Dashboard"
          >
            <RiArrowGoBackFill className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-4xl sm:text-5xl text-[#0F172A] font-sans font-bold tracking-tight">{clientProfile.companyName}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-4">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-[#E5E7EB] rounded-full text-[13px] font-semibold text-[#475569] shadow-sm">
                <Mail className="w-3.5 h-3.5 text-[#5A52FF]" />
                {client.email}
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-[#E5E7EB] rounded-full text-[13px] font-semibold text-[#475569] shadow-sm">
                <User className="w-3.5 h-3.5 text-[#5A52FF]" />
                {clientProfile.clientName}
              </div>
              {clientProfile.website && (
                <a href={clientProfile.website.startsWith('http') ? clientProfile.website : `https://${clientProfile.website}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1 bg-white border border-[#E5E7EB] rounded-full text-[13px] font-semibold text-[#475569] shadow-sm hover:text-[#5A52FF] hover:border-[#5A52FF]/30 transition-colors">
                  <GlobeIcon className="w-3.5 h-3.5 text-[#5A52FF]" />
                  Website
                </a>
              )}
            </div>
          </div>
        </div>
        
        <div className="ml-16 sm:ml-0">
          <StatusDropdown 
            clientProfileId={clientProfile.id} 
            currentStatus={clientProfile.status || "ONBOARDED"} 
          />
        </div>
      </div>

      <Tabs defaultValue={initialTab} className="w-full">
        <TabsList className="w-full flex justify-start border-b border-slate-200 bg-transparent p-0 h-auto rounded-none mb-12 gap-8 overflow-x-auto hidden-scrollbar">
          <TabsTrigger value="overview" className="relative rounded-none border-b-2 border-transparent bg-transparent px-1 py-4 text-[15px] font-sans font-semibold text-slate-500 hover:text-slate-900 data-[state=active]:border-[#5A52FF] data-[state=active]:text-[#5A52FF] data-[state=active]:bg-transparent data-[state=active]:shadow-none focus-visible:outline-none focus-visible:ring-0 transition-all">Overview</TabsTrigger>
          <TabsTrigger value="projects" className="relative rounded-none border-b-2 border-transparent bg-transparent px-1 py-4 text-[15px] font-sans font-semibold text-slate-500 hover:text-slate-900 data-[state=active]:border-[#5A52FF] data-[state=active]:text-[#5A52FF] data-[state=active]:bg-transparent data-[state=active]:shadow-none focus-visible:outline-none focus-visible:ring-0 transition-all">Projects</TabsTrigger>
          <TabsTrigger value="approvals" className="relative rounded-none border-b-2 border-transparent bg-transparent px-1 py-4 text-[15px] font-sans font-semibold text-slate-500 hover:text-slate-900 data-[state=active]:border-[#5A52FF] data-[state=active]:text-[#5A52FF] data-[state=active]:bg-transparent data-[state=active]:shadow-none focus-visible:outline-none focus-visible:ring-0 transition-all">Approvals</TabsTrigger>
          <TabsTrigger value="billing" className="relative rounded-none border-b-2 border-transparent bg-transparent px-1 py-4 text-[15px] font-sans font-semibold text-slate-500 hover:text-slate-900 data-[state=active]:border-[#5A52FF] data-[state=active]:text-[#5A52FF] data-[state=active]:bg-transparent data-[state=active]:shadow-none focus-visible:outline-none focus-visible:ring-0 transition-all">Billing & Invoices</TabsTrigger>
          <TabsTrigger value="messages" className="relative rounded-none border-b-2 border-transparent bg-transparent px-1 py-4 text-[15px] font-sans font-semibold text-slate-500 hover:text-slate-900 data-[state=active]:border-[#5A52FF] data-[state=active]:text-[#5A52FF] data-[state=active]:bg-transparent data-[state=active]:shadow-none focus-visible:outline-none focus-visible:ring-0 transition-all">Messages</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-0 outline-none">
          <div className="grid gap-6 md:grid-cols-2">
        {/* Business Details */}
        <Card className="bg-white border-[#E5E7EB] rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:border-[#5A52FF]/30 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(90,82,255,0.06)] overflow-hidden flex flex-col">
          <CardHeader className="pb-4 px-8 pt-7 bg-white border-b border-[#F1F5F9]">
            <CardTitle className="text-xl font-sans font-bold text-[#0F172A]">Business Information</CardTitle>
          </CardHeader>
          <CardContent className="p-6 grid gap-4 flex-1">
            <div className="group p-4 rounded-xl border border-transparent hover:border-[#E5E7EB] hover:bg-[#FAFAFA] transition-all duration-200">
              <div className="flex items-center gap-2 mb-2">
                <PiGlobeDuotone className="w-5 h-5 text-[#5A52FF]" />
                <p className="text-[11px] font-bold tracking-[0.15em] text-[#64748B] uppercase">Website</p>
              </div>
              <p className="text-[15px] font-medium text-[#0F172A] pl-6 group-hover:text-[#5A52FF] transition-colors">
                {clientProfile.website ? (
                  <a href={clientProfile.website.startsWith('http') ? clientProfile.website : `https://${clientProfile.website}`} target="_blank" rel="noreferrer" className="hover:underline">
                    {clientProfile.website}
                  </a>
                ) : "N/A"}
              </p>
            </div>
            
            <div className="group p-4 rounded-xl border border-transparent hover:border-[#E5E7EB] hover:bg-[#FAFAFA] transition-all duration-200">
              <div className="flex items-center gap-2 mb-2">
                <PiFileTextDuotone className="w-5 h-5 text-[#5A52FF]" />
                <p className="text-[11px] font-bold tracking-[0.15em] text-[#64748B] uppercase">Description</p>
              </div>
              <p className="text-[14px] text-[#334155] leading-relaxed pl-6">{clientProfile.description || "N/A"}</p>
            </div>
            
            <div className="group p-4 rounded-xl border border-transparent hover:border-[#E5E7EB] hover:bg-[#FAFAFA] transition-all duration-200">
              <div className="flex items-center gap-2 mb-2">
                <PiUsersDuotone className="w-5 h-5 text-[#5A52FF]" />
                <p className="text-[11px] font-bold tracking-[0.15em] text-[#64748B] uppercase">Target Audience (Raw)</p>
              </div>
              <p className="text-[14px] text-[#334155] leading-relaxed pl-6">{clientProfile.audience || qna?.audience || "N/A"}</p>
            </div>
            
            <div className="group p-4 rounded-xl border border-transparent hover:border-[#E5E7EB] hover:bg-[#FAFAFA] transition-all duration-200">
              <div className="flex items-center gap-2 mb-2">
                <PiRocketLaunchDuotone className="w-5 h-5 text-[#5A52FF]" />
                <p className="text-[11px] font-bold tracking-[0.15em] text-[#64748B] uppercase">Business Goals (Raw)</p>
              </div>
              <p className="text-[14px] text-[#334155] leading-relaxed pl-6">{clientProfile.goals || qna?.goals || "N/A"}</p>
            </div>
          </CardContent>
        </Card>

        {/* Brand Assets */}
        <Card className="bg-white border-[#E5E7EB] rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:border-[#5A52FF]/30 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(90,82,255,0.06)] flex flex-col">
          <CardHeader className="pb-4 px-8 pt-7 bg-white border-b border-[#F1F5F9]">
            <CardTitle className="text-xl font-sans font-bold text-[#0F172A]">Uploaded Brand Assets</CardTitle>
            <CardDescription className="mt-2 text-[#64748B]">Files uploaded by the client during onboarding.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 flex-1 flex flex-col">
            {clientProfile.brandAssets.length > 0 ? (
              <ul className="grid gap-3">
                {clientProfile.brandAssets.map((asset: any) => (
                  <li key={asset.id} className="group flex items-center justify-between p-4 bg-white border border-[#E5E7EB] rounded-xl hover:border-[#5A52FF] hover:shadow-md transition-all duration-200">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="shrink-0 w-10 h-10 rounded-lg bg-[#F3F5FF] flex items-center justify-center text-[#5A52FF]">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <span className="truncate text-sm font-semibold text-[#0F172A]">{asset.type}</span>
                        {asset.description && (
                          <span className="truncate text-xs text-[#64748B] mt-0.5" title={asset.description}>
                            {asset.description}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <a href={asset.fileUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center w-8 h-8 rounded-full bg-[#FAFAFA] text-[#64748B] hover:bg-[#5A52FF] hover:text-white transition-colors" title="View">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <a href={`/api/download?url=${encodeURIComponent(asset.fileUrl)}`} download className="flex items-center justify-center w-8 h-8 rounded-full bg-[#FAFAFA] text-[#64748B] hover:bg-[#5A52FF] hover:text-white transition-colors" title="Download">
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#FAFAFA] rounded-2xl border-2 border-dashed border-[#E5E7EB] group hover:border-[#5A52FF]/40 hover:bg-[#F8FAFC] transition-all duration-300">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform duration-300">
                  <ImageIcon className="w-8 h-8 text-[#cbd5e1]" />
                </div>
                <h3 className="text-[15px] font-bold text-[#334155] mb-1">No assets uploaded</h3>
                <p className="text-sm text-[#64748B] max-w-[200px]">The client hasn't uploaded any logos or brand files yet.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gemini AI Summary */}
        <Card className="md:col-span-2 bg-white border-[#E5E7EB] rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 px-8 pt-7 pb-4">
            <div>
              <CardTitle className="text-[#5A52FF] flex items-center gap-2 text-2xl font-sans font-bold">
                ✨ Gemini AI Summary
              </CardTitle>
              <CardDescription className="mt-2 text-[#64748B]">
                Automated brand extraction based on the client's questionnaire.
              </CardDescription>
            </div>
            <GenerateAiButton clientProfileId={clientProfile.id} />
          </CardHeader>
          <CardContent>
            {clientProfile.aiAnalysis ? (
              <div className="grid gap-6 md:grid-cols-3">
                <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10">
                  <h3 className="text-xs uppercase tracking-[0.12em] text-primary font-bold mb-3">Target Audience</h3>
                  <p className="text-sm text-foreground leading-relaxed">{aiSummary?.targetAudience || "Not analyzed yet."}</p>
                </div>
                <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10">
                  <h3 className="text-xs uppercase tracking-[0.12em] text-primary font-bold mb-3">Brand Voice</h3>
                  <p className="text-sm text-foreground leading-relaxed">{aiSummary?.brandVoice || "Not analyzed yet."}</p>
                </div>
                <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10">
                  <h3 className="text-xs uppercase tracking-[0.12em] text-primary font-bold mb-3">Marketing Angle</h3>
                  <p className="text-sm text-foreground leading-relaxed">{aiSummary?.marketingAngle || "Not analyzed yet."}</p>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-muted-foreground bg-muted/30 rounded-2xl border border-dashed border-border">
                <p className="text-sm">AI Analysis has not been generated for this client yet.</p>
              </div>
            )}
          </CardContent>
        </Card>

          </div>
        </TabsContent>

        <TabsContent value="projects" className="mt-0 outline-none">
          <ManageProjects clientProfileId={clientProfile.id} initialProjects={clientProfile.projects as any} />
        </TabsContent>

        <TabsContent value="approvals" className="mt-0 outline-none">
          <ManageApprovals clientProfileId={clientProfile.id} initialApprovals={clientProfile.approvals as any} />
        </TabsContent>

        <TabsContent value="billing" className="mt-0 outline-none">
          <ManageInvoices clientProfileId={clientProfile.id} initialInvoices={clientProfile.invoices as any} />
        </TabsContent>

        <TabsContent value="messages" className="mt-0 outline-none h-[600px]">
          <ChatInterface clientProfileId={clientProfile.id} currentUserId={token?.id as string} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
