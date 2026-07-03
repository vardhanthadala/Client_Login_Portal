"use server"

import { prisma } from "@/lib/prisma"
import { getToken } from "next-auth/jwt"
import { cookies, headers } from "next/headers"
import { revalidatePath } from "next/cache"

async function getAuthSession() {
  const reqCookies = await cookies()
  const reqHeaders = await headers()

  const req = {
    cookies: Object.fromEntries(reqCookies.getAll().map(c => [c.name, c.value])),
    headers: Object.fromEntries(reqHeaders.entries())
  } as any

  return getToken({ req, secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || "c4d8Y0Pq9rK2nX7fWm3JvL8aZs1QeH5tBg9NpRx6UcIyEoDn" })
}

// Admin creates a batch approval with multiple files
export async function createApprovalAction(
  clientProfileId: string,
  title: string,
  description: string,
  files: { url: string; name: string; type: string }[]
) {
  try {
    const token = await getAuthSession()
    if (!token?.id || token.role !== "ADMIN" || !token.tenantId) return { error: "Unauthorized" }

    // Verify the client profile belongs to this admin's tenant
    const profile = await prisma.clientProfile.findUnique({ where: { id: clientProfileId } })
    if (!profile || profile.tenantId !== token.tenantId) return { error: "Unauthorized or not found" }

    const approval = await prisma.approval.create({
      data: {
        clientProfileId,
        title,
        description: description || null,
        items: {
          create: files.map(f => ({
            fileUrl: f.url,
            fileName: f.name,
            fileType: f.type,
          }))
        }
      },
      include: { items: { include: { feedback: true } } }
    })

    revalidatePath("/client/dashboard")
    revalidatePath(`/admin/client/${clientProfileId}`)

    return { success: true, data: approval }
  } catch (error: any) {
    console.error("Failed to create approval:", error)
    return { error: "Failed to create approval" }
  }
}

// Client approves or requests changes for a SINGLE file item
export async function respondToApprovalItemAction(
  approvalItemId: string,
  action: "APPROVED" | "CHANGES_REQUESTED",
  comment?: string
) {
  try {
    const token = await getAuthSession()
    if (!token?.id) return { error: "Unauthorized" }

    // Verify access
    const item = await prisma.approvalItem.findUnique({
      where: { id: approvalItemId },
      include: { approval: { include: { clientProfile: true } } }
    })
    if (!item) return { error: "Item not found" }

    if (token.role === "CLIENT") {
      const clientProfile = await prisma.clientProfile.findUnique({
        where: { userId: token.id as string }
      })
      if (clientProfile?.id !== item.approval.clientProfileId) {
        return { error: "Unauthorized access" }
      }
    }

    await prisma.$transaction([
      prisma.approvalFeedback.create({
        data: {
          approvalItemId,
          action,
          comment: comment || null
        }
      }),
      prisma.approvalItem.update({
        where: { id: approvalItemId },
        data: { status: action }
      })
    ])

    revalidatePath("/client/dashboard")
    revalidatePath("/admin/dashboard")

    return { success: true }
  } catch (error: any) {
    console.error("Failed to respond to approval item:", error)
    return { error: "Failed to respond" }
  }
}

// Admin resubmits a new file for a specific item
export async function resubmitApprovalItemAction(
  approvalItemId: string,
  fileUrl: string,
  fileName: string,
  fileType: string,
  note?: string
) {
  try {
    const token = await getAuthSession()
    if (!token?.id || token.role !== "ADMIN") return { error: "Unauthorized" }

    const item = await prisma.approvalItem.findUnique({
      where: { id: approvalItemId }
    })
    if (!item) return { error: "Item not found" }

    await prisma.$transaction([
      prisma.approvalItem.update({
        where: { id: approvalItemId },
        data: {
          fileUrl,
          fileName,
          fileType,
          status: "PENDING",
          version: item.version + 1
        }
      }),
      prisma.approvalFeedback.create({
        data: {
          approvalItemId,
          action: "RESUBMITTED",
          comment: note || `Resubmitted version ${item.version + 1}`
        }
      })
    ])

    revalidatePath("/client/dashboard")

    return { success: true }
  } catch (error: any) {
    console.error("Failed to resubmit:", error)
    return { error: "Failed to resubmit" }
  }
}

// Admin deletes an entire approval batch
export async function deleteApprovalAction(approvalId: string) {
  try {
    const token = await getAuthSession()
    if (!token?.id || token.role !== "ADMIN" || !token.tenantId) return { error: "Unauthorized" }

    // Verify the approval belongs to this admin's tenant
    const approval = await prisma.approval.findUnique({
      where: { id: approvalId },
      include: { clientProfile: true }
    })
    if (!approval || approval.clientProfile.tenantId !== token.tenantId) return { error: "Unauthorized or not found" }

    await prisma.approval.delete({
      where: { id: approvalId }
    })

    revalidatePath("/client/dashboard")

    return { success: true }
  } catch (error: any) {
    console.error("Failed to delete approval:", error)
    return { error: "Failed to delete approval" }
  }
}
