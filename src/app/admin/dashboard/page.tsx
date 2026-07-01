import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import InviteClientModal from "./InviteClientModal"
import DeleteClientButton from "./DeleteClientButton"
import StatusDropdown from "@/components/StatusDropdown"
import { Bell } from "lucide-react"
import SignOutButton from "./SignOutButton"
import { GoPeople } from "react-icons/go"
import { CiStar } from "react-icons/ci"
import { GrInProgress } from "react-icons/gr"
import { LuMessageCircle } from "react-icons/lu"
import NotificationBell, { UnreadClient } from "./NotificationBell"

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

  const unreadClientsData: UnreadClient[] = clients
    .map(c => ({
      id: c.id,
      companyName: c.clientProfile?.companyName || "Unknown Company",
      messageCount: (c.clientProfile?.messages || []).filter(m => m.senderId !== adminUser?.id).length
    }))
    .filter(c => c.messageCount > 0)

  return (
    <div className="min-h-screen w-full px-4 md:px-8 lg:px-12 xl:px-24 pt-12 pb-32 bg-[#FAFAFA] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/40 via-[#FAFAFA] to-[#FAFAFA]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl sm:text-5xl text-[#0F172A] font-sans font-bold tracking-tight">
            Agency Dashboard
          </h1>
          <p className="text-muted-foreground mt-4 text-base leading-relaxed max-w-2xl">
            Manage your clients and view their onboarding progress.
          </p>
        </div>
        <div className="flex gap-4 items-center">
          <NotificationBell unreadClients={unreadClientsData} />
          <div className="w-px h-8 bg-gray-200 mx-2"></div>
          <SignOutButton />
          <InviteClientModal />
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[
          { label: "Total Clients", value: clients.length, icon: <GoPeople className="w-6 h-6" />, color: "bg-blue-500/10 text-blue-600" },
          { label: "Completed", value: clients.filter(c => c.clientProfile?.status === "COMPLETED").length, icon: <CiStar className="w-6 h-6" />, color: "bg-emerald-500/10 text-emerald-600" },
          { label: "In Progress", value: clients.filter(c => c.clientProfile && c.clientProfile.status !== "COMPLETED").length, icon: <GrInProgress className="w-5 h-5" />, color: "bg-amber-500/10 text-amber-600" },
          { label: "Unread Messages", value: clients.reduce((acc, client) => acc + (client.clientProfile?.messages || []).filter(m => m.senderId !== adminUser?.id).length, 0), icon: <LuMessageCircle className="w-5 h-5" />, color: "bg-purple-500/10 text-purple-600" }
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center gap-4 transition-transform hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(0,0,0,0.04)]">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${stat.color}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
              <h3 className="text-2xl font-bold text-[#0F172A] mt-0.5">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[#0F172A]">Recent Clients</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {clients.map((client) => {
          const unreadCount = (client.clientProfile?.messages || []).filter(m => m.senderId !== adminUser?.id).length
          return (
            <Card key={client.id} className="bg-white border-[#E5E7EB] rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:border-[#5A52FF]/30 transition-all duration-200">
              <CardHeader className="flex flex-row justify-between items-start space-y-0 pb-4 px-8 pt-7">
                <div>
                  <CardTitle className="text-2xl font-sans font-bold text-[#0F172A] flex items-center gap-2">
                    {client.clientProfile?.companyName || "Unknown Company"}
                    {unreadCount > 0 && (
                      <span className="relative flex items-center gap-1 px-2 py-0.5 rounded-full bg-destructive/10 text-destructive text-[11px] font-bold" title={`${unreadCount} unread message(s)`}>
                        <Bell className="w-3 h-3" />
                        {unreadCount}
                        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-destructive animate-ping" />
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription className="mt-2 text-[15px] text-[#64748B] font-medium">{client.email}</CardDescription>
                </div>
                <div className="flex items-center">
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
              </CardHeader>
              <CardContent className="px-8 pb-7">
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-6 border-t border-[#F1F5F9]">
                  <Link href={`/admin/client/${client.id}`} className="w-full sm:w-auto flex-1">
                    <Button variant="outline" className="w-full bg-[#FAFAFA] border-[#E5E7EB] hover:bg-[#5A52FF] hover:text-white hover:border-[#5A52FF] h-11 rounded-xl text-[15px] font-medium transition-colors">
                      View Details
                    </Button>
                  </Link>
                  <DeleteClientButton clientId={client.id} companyName={client.clientProfile?.companyName || "Unknown Company"} />
                </div>
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
