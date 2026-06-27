import { prisma } from "@/lib/prisma"
import { getToken } from "next-auth/jwt"
import { cookies, headers } from "next/headers"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Download, ExternalLink, Bell } from "lucide-react"
import ClientUploader from "./ClientUploader"
import ChatInterface from "@/components/ChatInterface"
import ProjectTracker from "@/components/ProjectTracker"
import ApprovalReview from "@/components/ApprovalReview"

export default async function ClientDashboardPage() {
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
      approvals: { include: { items: { include: { feedback: true }, orderBy: { createdAt: "asc" } } }, orderBy: { createdAt: "desc" } }
    }
  })

  // If they somehow skipped onboarding, force them back
  if (!clientProfile?.companyName) {
    redirect("/client/onboarding")
  }

  const unreadCount = (clientProfile.messages || []).filter(m => m.senderId !== (token.id as string)).length

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-32">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl sm:text-5xl text-foreground leading-tight tracking-[-0.02em] font-bold flex items-center gap-3">
              Welcome, {clientProfile.clientName}
              {unreadCount > 0 && (
                <span className="relative flex items-center gap-1 px-2.5 py-1 rounded-full bg-destructive/10 text-destructive text-sm font-bold" title={`${unreadCount} new message(s) from admin`}>
                  <Bell className="w-4 h-4" />
                  {unreadCount}
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-destructive animate-ping" />
                </span>
              )}
            </h1>
            <span className="px-3 py-1 mt-2 rounded-full text-xs uppercase tracking-[0.12em] font-bold bg-primary/10 text-primary self-start">
              {clientProfile.status || "ONBOARDED"}
            </span>
          </div>
          <p className="text-muted-foreground mt-4 text-base leading-relaxed max-w-2xl">
            Manage your brand assets and view your profile.
          </p>
        </div>
        <Link href="/api/auth/signout">
          <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
            Sign Out
          </Button>
        </Link>
      </div>

      {clientProfile.projects && clientProfile.projects.length > 0 && (
        <div className="mb-12">
          <h2 className="text-xl font-bold mb-4">Active Projects</h2>
          {clientProfile.projects.map((project: any) => (
            <ProjectTracker key={project.id} project={project} />
          ))}
        </div>
      )}

      {/* Approval Review Section */}
      {clientProfile.approvals && clientProfile.approvals.length > 0 && (
        <ApprovalReview approvals={clientProfile.approvals as any} />
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="hover:border-primary/50 transition-all duration-200">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Your Business Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground mb-1">Company Name</p>
              <p className="text-base font-medium text-foreground">{clientProfile.companyName}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground mb-1">Description</p>
              <p className="text-sm text-foreground leading-relaxed">{clientProfile.description || "N/A"}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-all duration-200">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Upload New Assets</CardTitle>
            <CardDescription>
              Need to send us a new logo, document, or brand guideline? Upload it here anytime.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ClientUploader />
          </CardContent>
        </Card>

        <Card className="md:col-span-2 hover:border-primary/50 transition-all duration-200">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Your Uploaded Files</CardTitle>
          </CardHeader>
          <CardContent>
            {clientProfile.brandAssets.length > 0 ? (
              <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {clientProfile.brandAssets.map((asset) => (
                  <li key={asset.id} className="flex items-center justify-between px-4 py-3 bg-card border-b sm:border border-border sm:rounded-xl hover:bg-muted/30 transition-colors">
                    <span className="truncate text-sm font-medium mr-2" title={asset.type}>{asset.type}</span>
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
                <p className="text-lg font-medium text-foreground mb-2">No assets uploaded yet</p>
                <p className="text-sm">Use the uploader above to add files.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="md:col-span-2 mt-4">
          <ChatInterface clientProfileId={clientProfile.id} currentUserId={token.id as string} />
        </div>
      </div>
    </div>
  )
}
