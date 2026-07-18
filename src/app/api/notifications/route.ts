import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

// GET /api/notifications — fetch notifications for the current user
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const notificationsRaw = await prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    })

    const clientIds = Array.from(new Set(notificationsRaw.filter(n => n.clientId).map(n => n.clientId!)))
    let imageMap: Record<string, string | null> = {}
    
    if (clientIds.length > 0) {
      const users = await prisma.user.findMany({
        where: { id: { in: clientIds } },
        select: { id: true, image: true, clientProfile: { select: { profileImageUrl: true } } }
      })
      imageMap = Object.fromEntries(users.map(u => [u.id, u.clientProfile?.profileImageUrl || u.image || null]))
    }

    const notifications = notificationsRaw.map(n => ({
      ...n,
      clientImage: n.clientId ? imageMap[n.clientId] : undefined
    }))

    return NextResponse.json({ notifications })
  } catch (error) {
    console.error("Failed to fetch notifications:", error)
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}

// PATCH /api/notifications — mark notification(s) as read
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { id, markAll } = body

    if (markAll) {
      await prisma.notification.updateMany({
        where: { userId: session.user.id, isRead: false },
        data: { isRead: true },
      })
    } else if (id) {
      await prisma.notification.updateMany({
        where: { id, userId: session.user.id },
        data: { isRead: true },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to update notifications:", error)
    return NextResponse.json({ error: "Failed to update" }, { status: 500 })
  }
}
