import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import { prisma } from "@/lib/prisma"
import { cookies, headers } from "next/headers"
import { revalidatePath } from "next/cache"

export async function PATCH(req: NextRequest) {
  try {
    const reqCookies = await cookies()
    const reqHeaders = await headers()
    
    const mockReq = {
      cookies: Object.fromEntries(reqCookies.getAll().map(c => [c.name, c.value])),
      headers: Object.fromEntries(reqHeaders.entries())
    } as any

    const token = await getToken({ req: mockReq, secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || "c4d8Y0Pq9rK2nX7fWm3JvL8aZs1QeH5tBg9NpRx6UcIyEoDn" })
    
    if (!token?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { profileImageUrl, clientName } = await req.json()

    if (!profileImageUrl && !clientName) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 })
    }

    const dataToUpdate: any = {}
    if (profileImageUrl) dataToUpdate.profileImageUrl = profileImageUrl
    if (clientName) dataToUpdate.clientName = clientName

    // Update the ClientProfile for this user
    await prisma.clientProfile.update({
      where: { userId: token.id as string },
      data: dataToUpdate
    })

    revalidatePath('/client/dashboard', 'page')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}
