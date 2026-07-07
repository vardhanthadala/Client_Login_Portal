"use server"

import { prisma } from "@/lib/prisma"
import { getToken } from "next-auth/jwt"
import { cookies, headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { sendInvoiceReminderEmail } from "@/lib/mail"

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
    if (!token?.id || token.role !== "ADMIN" || !token.tenantId) return { error: "Unauthorized" }

    // Verify the client profile belongs to this admin's tenant
    const profile = await prisma.clientProfile.findUnique({ where: { id: data.clientProfileId } })
    if (!profile || profile.tenantId !== token.tenantId) return { error: "Unauthorized or not found" }

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
    if (!token?.id || token.role !== "ADMIN" || !token.tenantId) return { error: "Unauthorized" }

    // Verify the invoice belongs to this admin's tenant
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { clientProfile: true }
    })
    if (!invoice || invoice.clientProfile.tenantId !== token.tenantId) return { error: "Unauthorized or not found" }

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

export async function sendInvoiceReminderAction(invoiceId: string) {
  try {
    const token = await getAuthSession()
    if (!token?.id || token.role !== "ADMIN" || !token.tenantId) return { error: "Unauthorized" }

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { 
        clientProfile: {
          include: { user: true }
        }
      }
    })

    if (!invoice || invoice.clientProfile.tenantId !== token.tenantId) {
      return { error: "Invoice not found or unauthorized" }
    }
    
    if (invoice.status === "PAID" || invoice.status === "CANCELLED" || invoice.status === "DRAFT") {
      return { error: "Cannot send reminder for this invoice status" }
    }

    const email = invoice.clientProfile.user.email
    const clientName = invoice.clientProfile.clientName
    const dueDateStr = invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Upon Receipt'

    const emailResult = await sendInvoiceReminderEmail(
      email,
      clientName,
      invoice.title,
      invoice.amount,
      invoice.currency,
      dueDateStr
    )

    if (!emailResult.success) {
      return { error: emailResult.error || "Failed to send email" }
    }

    return { success: true }
  } catch (error: any) {
    console.error("Failed to send invoice reminder:", error)
    return { error: "Failed to send invoice reminder" }
  }
}

export async function updateInvoiceStatusAction(invoiceId: string, status: string) {
  try {
    const token = await getAuthSession()
    if (!token?.id || token.role !== "ADMIN" || !token.tenantId) return { error: "Unauthorized" }

    // Verify the invoice belongs to this admin's tenant
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { clientProfile: true }
    })
    if (!invoice || invoice.clientProfile.tenantId !== token.tenantId) return { error: "Unauthorized or not found" }

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
