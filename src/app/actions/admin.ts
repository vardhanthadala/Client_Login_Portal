"use server"

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"
import crypto from "crypto"
import { sendWelcomeEmail } from "@/lib/mail"

export async function inviteClientAction(formData: FormData) {
  try {
    const companyName = formData.get("companyName") as string
    const clientName = formData.get("clientName") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const servicePurchased = formData.get("servicePurchased") as string

    if (!companyName || !clientName || !email || !password) {
      return { error: "Missing required fields" }
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return { error: "A user with this email already exists." }
    }

    const passwordHash = await bcrypt.hash(password, 10)

    // Create User and ClientProfile transaction
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          role: "CLIENT",
        },
      })

      await tx.clientProfile.create({
        data: {
          userId: user.id,
          companyName,
          clientName,
          description: `Purchased: ${servicePurchased}`,
        },
      })
    })

    // Send Welcome Email via Resend (fire and forget, or await)
    await sendWelcomeEmail(email, password)

    revalidatePath("/admin/dashboard")

    return { 
      success: true, 
      credentials: { email, password } 
    }
  } catch (error: any) {
    console.error("Invite client error:", error)
    return { error: "Failed to invite client. Please try again." }
  }
}

export async function deleteClientAction(clientId: string) {
  try {
    await prisma.user.delete({
      where: { id: clientId, role: "CLIENT" }
    })
    
    revalidatePath("/admin/dashboard")
    return { success: true }
  } catch (error: any) {
    console.error("Delete client error:", error)
    return { error: "Failed to delete client." }
  }
}
