import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import InviteClientModal from "./InviteClientModal"
import DeleteClientButton from "./DeleteClientButton"

export default async function AdminDashboard() {
  const clients = await prisma.user.findMany({
    where: { role: "CLIENT" },
    include: { clientProfile: true },
  })

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
        {clients.map((client) => (
          <Card key={client.id} className="group hover:border-primary/50 hover:shadow-sm transition-all duration-200">
            <CardHeader className="flex flex-row justify-between items-start space-y-0 pb-2">
              <div>
                <CardTitle className="text-lg font-bold">{client.clientProfile?.companyName || "Unknown Company"}</CardTitle>
                <CardDescription className="mt-1">{client.email}</CardDescription>
              </div>
              <DeleteClientButton clientId={client.id} companyName={client.clientProfile?.companyName || "Unknown Company"} />
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium flex items-center justify-between mb-4">
                <span className="text-muted-foreground">Status</span>
                <span className={`px-2.5 py-1 rounded-full text-xs uppercase tracking-[0.12em] font-bold ${client.clientProfile ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                  {client.clientProfile ? "Onboarded" : "Pending"}
                </span>
              </p>
              <Link href={`/admin/client/${client.id}`}>
                <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors">
                  View Details
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
        
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
