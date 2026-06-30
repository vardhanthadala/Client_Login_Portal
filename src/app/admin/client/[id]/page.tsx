import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft, Download, ExternalLink, Receipt } from "lucide-react"
import ChatInterface from "@/components/ChatInterface"
import ManageProjects from "./ManageProjects"
import ManageApprovals from "./ManageApprovals"
import ManageInvoices from "./ManageInvoices"
import GenerateAiButton from "./GenerateAiButton"
import { getToken } from "next-auth/jwt"
import { cookies, headers } from "next/headers"
export default async function ClientDetailsPage({ params }: { params: { id: string } }) {
  const { id } = await params

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-32">
      <div className="flex items-center gap-4 mb-12">
        <Link href="/admin/dashboard" className="text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-muted rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-4xl sm:text-5xl text-foreground leading-tight tracking-[-0.02em] font-bold">{clientProfile.companyName}</h1>
          <p className="text-muted-foreground mt-2 font-medium">{client.email} <span className="mx-2 opacity-50">•</span> {clientProfile.clientName}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Business Details */}
        <Card className="hover:border-primary/50 transition-all duration-200">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Business Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground mb-1">Website</p>
              <p className="text-base font-medium text-foreground">{clientProfile.website || "N/A"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground mb-1">Description</p>
              <p className="text-sm text-foreground leading-relaxed">{clientProfile.description || "N/A"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground mb-1">Target Audience (Raw Input)</p>
              <p className="text-sm text-foreground leading-relaxed">{clientProfile.audience || qna?.audience || "N/A"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground mb-1">Business Goals (Raw Input)</p>
              <p className="text-sm text-foreground leading-relaxed">{clientProfile.goals || qna?.goals || "N/A"}</p>
            </div>
          </CardContent>
        </Card>

        {/* Brand Assets */}
        <Card className="hover:border-primary/50 transition-all duration-200">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Uploaded Brand Assets</CardTitle>
            <CardDescription>Files uploaded by the client during onboarding.</CardDescription>
          </CardHeader>
          <CardContent>
            {clientProfile.brandAssets.length > 0 ? (
              <ul className="space-y-2">
                {clientProfile.brandAssets.map((asset: any) => (
                  <li key={asset.id} className="flex items-center justify-between px-4 py-3 bg-card border-b sm:border border-border sm:rounded-xl hover:bg-muted/30 transition-colors">
                    <span className="truncate text-sm font-medium mr-2">{asset.type}</span>
                    <div className="flex gap-4">
                      <a href={asset.fileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs uppercase tracking-[0.15em] font-semibold text-primary hover:underline flex-shrink-0">
                        <ExternalLink className="w-3.5 h-3.5" /> View
                      </a>
                      <a href={`/api/download?url=${encodeURIComponent(asset.fileUrl)}`} download className="flex items-center gap-1.5 text-xs uppercase tracking-[0.15em] font-semibold text-primary hover:underline flex-shrink-0">
                        <Download className="w-3.5 h-3.5" /> Download
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="py-12 text-center text-muted-foreground bg-muted/30 rounded-2xl border border-dashed border-border">
                <p className="text-sm">No assets uploaded.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gemini AI Summary */}
        <Card className="md:col-span-2 border-primary/20 shadow-lg shadow-primary/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-primary flex items-center gap-2 text-xl font-bold">
                ✨ Gemini AI Summary
              </CardTitle>
              <CardDescription className="mt-1">
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

        {/* Approval Center */}
        <div className="md:col-span-2">
          <ManageApprovals clientProfileId={clientProfile.id} initialApprovals={clientProfile.approvals as any} />
        </div>

        {/* Invoicing & Billing */}
        <div className="md:col-span-2">
          <ManageInvoices clientProfileId={clientProfile.id} initialInvoices={clientProfile.invoices as any} />
        </div>

        {/* Project Tracker Admin UI */}
        <div className="md:col-span-2">
          <ManageProjects clientProfileId={clientProfile.id} initialProjects={clientProfile.projects as any} />
        </div>

        {/* Client Chat */}
        <div className="md:col-span-2">
          <ChatInterface clientProfileId={clientProfile.id} currentUserId={token?.id as string} />
        </div>
      </div>
    </div>
  )
}
