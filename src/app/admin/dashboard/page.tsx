import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import InviteClientModal from "./InviteClientModal"
import DeleteClientButton from "./DeleteClientButton"
import StatusDropdown from "@/components/StatusDropdown"
import { Bell } from "lucide-react"

export default async function AdminDashboard() {
  const clients = await prisma.user.findMany({
    where: { role: "CLIENT" },
    include: {
      clientProfile: {
        include: {
          messages: {
            where: { isRead: false },
            select: { id: true, senderId: true }
          }
        }
      }
    },
  })

  // For admin, we need the admin user ID to filter out admin's own messages
  const adminUser = await prisma.user.findFirst({ where: { role: "ADMIN" }, select: { id: true } })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-32">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl sm:text-5xl text-foreground leading-tight tracking-[-0.02em] font-bold">
            Agency Dashboard
          </h1>
          <p className="text-muted-foreground mt-4 text-base leading-relaxed max-w-2xl">
            Manage your clients and view their onboarding progress.
          </p>
        </div>
        <div className="flex gap-4 items-center">
          <Link href="/api/auth/signout">
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
              Sign Out
            </Button>
          </Link>
          <InviteClientModal />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {clients.map((client) => {
          const unreadCount = (client.clientProfile?.messages || []).filter(m => m.senderId !== adminUser?.id).length
          return (
            <Card key={client.id} className="group hover:border-primary/50 hover:shadow-sm transition-all duration-200">
              <CardHeader className="flex flex-row justify-between items-start space-y-0 pb-2">
                <div>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    {client.clientProfile?.companyName || "Unknown Company"}
                    {unreadCount > 0 && (
                      <span className="relative flex items-center gap-1 px-2 py-0.5 rounded-full bg-destructive/10 text-destructive text-[11px] font-bold" title={`${unreadCount} unread message(s)`}>
                        <Bell className="w-3 h-3" />
                        {unreadCount}
                        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-destructive animate-ping" />
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription className="mt-1">{client.email}</CardDescription>
                </div>
                <DeleteClientButton clientId={client.id} companyName={client.clientProfile?.companyName || "Unknown Company"} />
              </CardHeader>
              <CardContent>
                <div className="text-sm font-medium flex items-center justify-between mb-4">
                  <span className="text-muted-foreground">Status</span>
                  {client.clientProfile ? (
                    <StatusDropdown
                      clientProfileId={client.clientProfile.id}
                      currentStatus={client.clientProfile.status || "ONBOARDED"}
                    />
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-xs uppercase tracking-[0.12em] font-bold bg-muted text-muted-foreground">
                      Pending
                    </span>
                  )}
                </div>
                <Link href={`/admin/client/${client.id}`}>
                  <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors">
                    View Details
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )
        })}

        {clients.length === 0 && (
          <div className="col-span-full py-16 text-center text-muted-foreground bg-muted/30 rounded-2xl border border-dashed border-border">
            <p className="text-lg font-medium text-foreground mb-2">No clients found</p>
            <p className="text-sm">Click "Invite New Client" to get started.</p>
          </div>
        )}
      </div>
    </div>
  )
}
