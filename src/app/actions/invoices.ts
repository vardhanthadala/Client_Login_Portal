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

export async function createInvoiceAction(data: {
  clientProfileId: string
  title: string
  currency: string
  type: string
  dueDate?: string | null
  notes?: string
  items: { description: string; quantity: number; rate: number }[]
}) {
  try {
    const token = await getAuthSession()
    if (!token?.id || token.role !== "ADMIN") return { error: "Unauthorized" }

    // Calculate total amount
    const totalAmount = data.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0)

    const invoice = await prisma.invoice.create({
      data: {
        clientProfileId: data.clientProfileId,
        title: data.title,
        amount: totalAmount,
        currency: data.currency,
        type: data.type,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        notes: data.notes || null,
        status: "SENT", // Set to SENT automatically when created by admin
        items: {
          create: data.items.map(item => ({
            description: item.description,
            quantity: item.quantity,
            rate: item.rate,
            amount: item.quantity * item.rate
          }))
        }
      }
    })

    revalidatePath("/admin/dashboard")
    revalidatePath(`/admin/client/${data.clientProfileId}`)
    revalidatePath("/client/dashboard")

    return { success: true, data: invoice }
  } catch (error: any) {
    console.error("Failed to create invoice:", error)
    return { error: "Failed to create invoice" }
  }
}

export async function deleteInvoiceAction(invoiceId: string) {
  try {
    const token = await getAuthSession()
    if (!token?.id || token.role !== "ADMIN") return { error: "Unauthorized" }

    await prisma.invoice.delete({
      where: { id: invoiceId }
    })

    revalidatePath("/admin/dashboard")
    revalidatePath("/client/dashboard")

    return { success: true }
  } catch (error: any) {
    console.error("Failed to delete invoice:", error)
    return { error: "Failed to delete invoice" }
  }
}

export async function updateInvoiceStatusAction(invoiceId: string, status: string) {
  try {
    const token = await getAuthSession()
    if (!token?.id || token.role !== "ADMIN") return { error: "Unauthorized" }

    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status }
    })

    revalidatePath("/admin/dashboard")
    revalidatePath("/client/dashboard")

    return { success: true }
  } catch (error: any) {
    console.error("Failed to update invoice status:", error)
    return { error: "Failed to update invoice status" }
  }
}
