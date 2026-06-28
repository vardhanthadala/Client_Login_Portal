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
    where: { id: token.id as string }
  })

  if (!user) {
    // If the user was deleted by admin, their JWT is still in the browser.
    // Force them to sign out so the dead JWT is cleared.
    redirect("/api/force-logout")
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      {children}
    </>
  )
}
