"use server"

import { prisma } from "@/lib/prisma"
import { getToken } from "next-auth/jwt"
import { cookies, headers } from "next/headers"
import { revalidatePath } from "next/cache"

// Helper to get auth token
async function getAuthSession() {
  const reqCookies = await cookies()
  const reqHeaders = await headers()

  const req = {
    cookies: Object.fromEntries(reqCookies.getAll().map(c => [c.name, c.value])),
    headers: Object.fromEntries(reqHeaders.entries())
  } as any

  return getToken({ req, secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || "c4d8Y0Pq9rK2nX7fWm3JvL8aZs1QeH5tBg9NpRx6UcIyEoDn" })
}

export async function getMessagesAction(clientProfileId: string) {
  try {
    const token = await getAuthSession()
    if (!token?.id) return { error: "Unauthorized" }

    const messages = await prisma.message.findMany({
      where: { clientProfileId },
      include: {
        sender: {
          select: { id: true, role: true, email: true, image: true, clientProfile: { select: { clientName: true } } }
        }
      },
      orderBy: { createdAt: "asc" }
    })

    return { success: true, data: messages }
  } catch (error: any) {
    console.error("Failed to fetch messages:", error)
    return { error: "Failed to fetch messages" }
  }
}

export async function sendMessageAction(clientProfileId: string, content: string) {
  try {
    const token = await getAuthSession()
    if (!token?.id) return { error: "Unauthorized" }

    // Check if the user is a client and they own this profile, or if they are admin
    if (token.role === "CLIENT") {
      const clientProfile = await prisma.clientProfile.findUnique({
        where: { userId: token.id as string }
      })
      if (clientProfile?.id !== clientProfileId) {
        return { error: "Unauthorized access to this chat" }
      }
    }

    const message = await prisma.message.create({
      data: {
        clientProfileId,
        senderId: token.id as string,
        content
      },
      include: {
        sender: {
          select: { id: true, role: true, email: true, image: true, clientProfile: { select: { clientName: true } } }
        }
      }
    })

    revalidatePath("/client/dashboard")
    revalidatePath("/admin/dashboard")
    revalidatePath(`/admin/client/${clientProfileId}`)

    return { success: true, data: message }
  } catch (error: any) {
    console.error("Failed to send message:", error)
    return { error: "Failed to send message" }
  }
}

export async function markMessagesAsReadAction(clientProfileId: string) {
  try {
    const token = await getAuthSession()
    if (!token?.id) return { error: "Unauthorized" }

    await prisma.message.updateMany({
      where: {
        clientProfileId,
        senderId: { not: token.id as string },
        isRead: false
      },
      data: { isRead: true }
    })

    revalidatePath("/admin/dashboard")
    revalidatePath("/client/dashboard")

    return { success: true }
  } catch (error: any) {
    console.error("Failed to mark messages as read:", error)
    return { error: "Failed to mark messages as read" }
  }
}

export async function deleteMessageAction(messageId: string, clientProfileId: string) {
  try {
    const token = await getAuthSession()
    if (!token?.id) return { error: "Unauthorized" }

    // Check if message exists and user has permission to delete it
    const message = await prisma.message.findUnique({
      where: { id: messageId }
    })

    if (!message) return { error: "Message not found" }

    // Allow deletion if the user is the sender OR if they are an ADMIN
    if (message.senderId !== token.id && token.role !== "ADMIN") {
      return { error: "Unauthorized to delete this message" }
    }

    await prisma.message.delete({
      where: { id: messageId }
    })

    revalidatePath("/client/dashboard")
    revalidatePath("/admin/dashboard")
    revalidatePath(`/admin/client/${clientProfileId}`)

    return { success: true }
  } catch (error: any) {
    console.error("Failed to delete message:", error)
    return { error: "Failed to delete message" }
  }
}
