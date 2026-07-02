import { getToken } from "next-auth/jwt"
import { NextRequest, NextResponse } from "next/server"

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  
  const { nextUrl } = req
  const isLoggedIn = !!token
  const userRole = token?.role
  const mustChangePassword = token?.mustChangePassword

  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth")
  const isPublicRoute = nextUrl.pathname === "/" || nextUrl.pathname === "/login" || nextUrl.pathname === "/admin/setup"
  const isAdminRoute = nextUrl.pathname.startsWith("/admin")
  const isClientRoute = nextUrl.pathname.startsWith("/client")

  if (isApiAuthRoute) {
    return NextResponse.next()
  }

  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", nextUrl))
  }

  if (isLoggedIn) {
    if (mustChangePassword && nextUrl.pathname !== "/admin/change-password") {
      return NextResponse.redirect(new URL("/admin/change-password", nextUrl))
    }

    const subscriptionStatus = token?.subscriptionStatus
    if (userRole === "ADMIN" && isAdminRoute && nextUrl.pathname !== "/admin/billing" && nextUrl.pathname !== "/admin/change-password") {
      if (subscriptionStatus === "PENDING" || subscriptionStatus === "EXPIRED" || subscriptionStatus === "CANCELLED") {
        return NextResponse.redirect(new URL("/admin/billing", nextUrl))
      }
    }

    const isSuperAdmin = userRole === "SUPER_ADMIN"
    const isSuperAdminRoute = nextUrl.pathname.startsWith("/superadmin")

    if (nextUrl.pathname === "/login") {
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
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$|.*\\.ico$|.*\\.webp$).*)"],
}
