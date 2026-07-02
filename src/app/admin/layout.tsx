import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"

import { SubscriptionBanner } from "@/components/admin/SubscriptionBanner"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect("/login")
  }
  
  if (session.user.role === "SUPER_ADMIN") {
    redirect("/superadmin/dashboard")
  }
  
  if (session.user.role !== "ADMIN") {
    redirect("/client/dashboard")
  }
  
  const tenantId = session.user.tenantId
  
  if (!tenantId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow max-w-md text-center border border-gray-100">
          <h2 className="text-2xl font-bold text-red-600 mb-4">No Tenant Assigned</h2>
          <p className="text-gray-600 mb-6">Your admin account is not assigned to any agency. Please contact support.</p>
        </div>
      </div>
    )
  }
  
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId }
  })
  
  if (!tenant) {
    redirect("/login")
  }
  
  return (
    <>
      <SubscriptionBanner razorpaySubscriptionId={tenant.razorpaySubscriptionId} />
      {children}
    </>
  )
}
