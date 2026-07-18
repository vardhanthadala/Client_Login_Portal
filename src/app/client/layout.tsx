import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import Script from "next/script"

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    redirect("/login")
  }

  // Check if user still exists in DB
  const user = await prisma.user.findUnique({
    where: { id: userId as string },
    include: { tenant: true }
  })

  if (!user) {
    // If the user was deleted by admin, their JWT is still in the browser.
    // Force them to sign out so the dead JWT is cleared.
    redirect("/api/force-logout")
  }

  const tenant = user.tenant
  if (tenant && (tenant.subscriptionStatus === "EXPIRED" || tenant.subscriptionStatus === "CANCELLED" || (tenant.subscriptionEnd && new Date(tenant.subscriptionEnd) < new Date()))) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow max-w-md text-center border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Temporarily Unavailable</h2>
          <p className="text-gray-600 mb-6">Your dashboard access is temporarily blocked due to a routine system update. Please contact your company administrator to restore access.</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      {children}
    </>
  )
}
