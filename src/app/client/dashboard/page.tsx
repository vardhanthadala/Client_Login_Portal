import { prisma } from "@/lib/prisma"
import { getToken } from "next-auth/jwt"
import { cookies, headers } from "next/headers"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Download, ExternalLink } from "lucide-react"
import ClientUploader from "./ClientUploader"

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
      aiAnalysis: true
    }
  })

  // If they somehow skipped onboarding, force them back
  if (!clientProfile?.companyName) {
    redirect("/client/onboarding")
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-32">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl sm:text-5xl text-foreground leading-tight tracking-[-0.02em] font-bold">
            Welcome, {clientProfile.clientName}
          </h1>
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
      </div>
    </div>
  )
}
