import { prisma } from "@/lib/prisma"
import { getToken } from "next-auth/jwt"
import { cookies, headers } from "next/headers"
import { redirect } from "next/navigation"
import Script from "next/script"

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
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

  // Check if user still exists in DB
  const user = await prisma.user.findUnique({
    where: { id: token.id as string },
    include: { tenant: true }
  })

  if (!user) {
    // If the user was deleted by admin, their JWT is still in the browser.
    // Force them to sign out so the dead JWT is cleared.
    redirect("/api/force-logout")
  }

  const tenant = user.tenant
  if (tenant && (tenant.subscriptionStatus === "EXPIRED" || (tenant.subscriptionEnd && new Date(tenant.subscriptionEnd) < new Date()))) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow max-w-md text-center border border-gray-100">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Suspended</h2>
          <p className="text-gray-600 mb-6">Your agency's subscription has expired. Please contact them to restore access.</p>
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
