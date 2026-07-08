import { getToken } from "next-auth/jwt"
import { NextRequest, NextResponse } from "next/server"

export async function proxy(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || "c4d8Y0Pq9rK2nX7fWm3JvL8aZs1QeH5tBg9NpRx6UcIyEoDn" })
  
  const { nextUrl } = req
  const isLoggedIn = !!token
  const userRole = token?.role

  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth")
  const isPublicRoute = nextUrl.pathname === "/" || nextUrl.pathname === "/login" || nextUrl.pathname === "/client-login" || nextUrl.pathname === "/admin/setup"
  const isAdminRoute = nextUrl.pathname.startsWith("/admin")
  const isClientRoute = nextUrl.pathname.startsWith("/client")

  if (isApiAuthRoute) {
    return NextResponse.next()
  }

  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", nextUrl))
  }

  if (isLoggedIn) {
    const subscriptionStatus = token?.subscriptionStatus
    if (userRole === "ADMIN" && isAdminRoute && nextUrl.pathname !== "/admin/billing") {
      if (subscriptionStatus === "PENDING" || subscriptionStatus === "EXPIRED" || subscriptionStatus === "CANCELLED") {
        return NextResponse.redirect(new URL("/admin/billing", nextUrl))
      }
    }

    const isSuperAdmin = userRole === "SUPER_ADMIN"
    const isSuperAdminRoute = nextUrl.pathname.startsWith("/superadmin")

    if (nextUrl.pathname === "/login" || nextUrl.pathname === "/client-login") {
      if (isSuperAdmin) {
        return NextResponse.redirect(new URL("/superadmin/dashboard", nextUrl))
      }
      if (userRole === "ADMIN") {
        return NextResponse.redirect(new URL("/admin/dashboard", nextUrl))
      }
      return NextResponse.redirect(new URL("/client/dashboard", nextUrl))
    }

    if (isSuperAdminRoute && !isSuperAdmin) {
      if (userRole === "ADMIN") return NextResponse.redirect(new URL("/admin/dashboard", nextUrl))
      return NextResponse.redirect(new URL("/client/dashboard", nextUrl))
    }

    if (isAdminRoute && userRole !== "ADMIN") {
      if (isSuperAdmin) return NextResponse.redirect(new URL("/superadmin/dashboard", nextUrl))
      return NextResponse.redirect(new URL("/client/dashboard", nextUrl))
    }

    if (isClientRoute && userRole !== "CLIENT") {
      if (isSuperAdmin) return NextResponse.redirect(new URL("/superadmin/dashboard", nextUrl))
      return NextResponse.redirect(new URL("/admin/dashboard", nextUrl))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$|.*\\.ico$|.*\\.webp$|.*\\.glb$).*)"],
}

