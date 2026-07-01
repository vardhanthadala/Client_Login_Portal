import { getToken } from "next-auth/jwt"
import { NextRequest, NextResponse } from "next/server"

export async function proxy(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  
  const { nextUrl } = req
  const isLoggedIn = !!token
  const userRole = token?.role

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
    if (nextUrl.pathname === "/login" || nextUrl.pathname === "/") {
      if (userRole === "ADMIN") {
        return NextResponse.redirect(new URL("/admin/dashboard", nextUrl))
      }
      return NextResponse.redirect(new URL("/client/dashboard", nextUrl))
    }

    if (isAdminRoute && userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/client/dashboard", nextUrl))
    }

    if (isClientRoute && userRole !== "CLIENT") {
      return NextResponse.redirect(new URL("/admin/dashboard", nextUrl))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$|.*\\.ico$|.*\\.webp$).*)"],
}
