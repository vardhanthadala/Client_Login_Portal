"use server"

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"
import crypto from "crypto"
import { sendWelcomeEmail } from "@/lib/mail"
import { getToken } from "next-auth/jwt"
import { cookies, headers } from "next/headers"

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

export async function markAllAdminMessagesAsReadAction() {
  try {
    const token = await getAuthSession()
    if (!token?.id || token.role !== "ADMIN" || !token.tenantId) return { error: "Unauthorized" }

    await prisma.message.updateMany({
      where: {
        clientProfile: {
          user: { tenantId: token.tenantId }
        },
        senderId: { not: token.id },
        isRead: false
      },
      data: { isRead: true }
    })
    
    revalidatePath("/admin/dashboard")
    return { success: true }
  } catch (error) {
    return { error: "Failed to mark as read" }
  }
}

export async function inviteClientAction(formData: FormData) {
  try {
    const token = await getAuthSession()
    if (!token?.id || token.role !== "ADMIN" || !token.tenantId) return { error: "Unauthorized" }

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
    await prisma.$transaction(async (tx: any) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          role: "CLIENT",
          tenantId: token.tenantId,
        },
      })

      await tx.clientProfile.create({
        data: {
          userId: user.id,
          tenantId: token.tenantId,
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
    const token = await getAuthSession()
    if (!token?.id || token.role !== "ADMIN" || !token.tenantId) return { error: "Unauthorized" }

    await prisma.user.delete({
      where: { id: clientId, tenantId: token.tenantId }
    })

    revalidatePath("/admin/dashboard")

    return { success: true }
  } catch (error: any) {
    console.error("Failed to delete client:", error)
    return { error: "Failed to delete client" }
  }
}

export async function updateClientStatusAction(clientProfileId: string, newStatus: string) {
  try {
    const token = await getAuthSession()
    if (!token?.id || token.role !== "ADMIN" || !token.tenantId) return { error: "Unauthorized" }

    // First ensure the client profile belongs to the tenant
    const profile = await prisma.clientProfile.findUnique({ where: { id: clientProfileId } })
    if (!profile || profile.tenantId !== token.tenantId) return { error: "Unauthorized or not found" }

    await prisma.clientProfile.update({
      where: { id: clientProfileId },
      data: { status: newStatus }
    })

    revalidatePath("/admin/dashboard")
    revalidatePath(`/admin/client/${clientProfileId}`)
    // Might need to revalidate client dashboard if we knew their user id, but revalidatePath("/client/dashboard") affects the active layout context.
    revalidatePath("/client/dashboard")

    return { success: true }
  } catch (error: any) {
    console.error("Failed to update status:", error)
    return { error: error.message || "Failed to update status" }
  }
}

import { GoogleGenAI } from "@google/genai"

export async function generateAiSummaryAction(clientProfileId: string) {
  try {
    const token = await getAuthSession()
    if (!token?.id || token.role !== "ADMIN" || !token.tenantId) return { error: "Unauthorized" }

    const clientProfile = await prisma.clientProfile.findUnique({
      where: { id: clientProfileId },
      include: { questionnaire: true }
    })
    if (!clientProfile || clientProfile.tenantId !== token.tenantId) return { error: "Profile not found or unauthorized" }

    const qna = clientProfile.questionnaire?.qna as any || {}
    const audience = clientProfile.audience || qna?.audience || "N/A"
    const goals = clientProfile.goals || qna?.goals || "N/A"

    const prompt = `Analyze this marketing onboarding data for a client:
      Industry: ${clientProfile.industry}
      Description: ${clientProfile.description}
      Target Audience: ${audience}
      Business Goals: ${goals}
      
      Extract and summarize the following in JSON format:
      - brandVoice: Array of 3-5 adjectives describing their desired tone.
      - targetAudience: A 2-sentence description of their ideal customer.
      - coreServices: Array of strings listing their primary offerings.
      - marketingAngle: A 1-sentence recommendation on how to position them.
      `
      
    let aiResponseText = ""
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "dummy_key" })
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      aiResponseText = response.text || "{}"
    } catch (geminiError) {
      console.warn("Gemini analysis failed, falling back to Groq:", geminiError)
      const Groq = (await import('groq-sdk')).default;
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "dummy_key" });
      
      const chatCompletion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
        response_format: { type: "json_object" },
      });
      aiResponseText = chatCompletion.choices[0]?.message?.content || "{}"
    }
    
    const cleanedText = aiResponseText.replace(/```json/g, "").replace(/```/g, "").trim();
    const aiSummary = JSON.parse(cleanedText || "{}")
    
    await prisma.aIAnalysis.upsert({
      where: { clientProfileId: clientProfile.id },
      update: { summary: aiSummary },
      create: { clientProfileId: clientProfile.id, summary: aiSummary }
    })

    revalidatePath(`/admin/client/${clientProfile.userId}`)
    return { success: true }
  } catch (error: any) {
    console.error("Failed to generate AI summary:", error)
    return { error: error.message || "Failed to generate AI summary" }
  }
}

export async function updateAdminProfileAction(formData: FormData) {
  try {
    const token = await getAuthSession()
    if (!token?.id || token.role !== "ADMIN") {
      return { error: "Unauthorized" }
    }

    const name = formData.get("name") as string
    const imageUrl = formData.get("imageUrl") as string | null

    if (!name) {
      return { error: "Name is required" }
    }

    await prisma.user.update({
      where: { id: token.id as string },
      data: {
        name,
        image: imageUrl || undefined
      }
    })

    revalidatePath("/admin/dashboard")
    return { success: true }
  } catch (error: any) {
    console.error("Failed to update profile:", error)
    return { error: "Failed to update profile" }
  }
}

export async function cancelAdminSubscriptionAction() {
  try {
    const token = await getAuthSession()
    if (!token?.id || token.role !== "ADMIN" || !token.tenantId) {
      return { error: "Unauthorized" }
    }

    await prisma.tenant.update({
      where: { id: token.tenantId as string },
      data: {
        cancelAtPeriodEnd: true
      }
    })

    revalidatePath("/admin/dashboard")
    return { success: true }
  } catch (error: any) {
    console.error("Failed to cancel subscription:", error)
    return { error: "Failed to cancel subscription" }
  }
}

export async function updateAdminStatusAction(status: string) {
  try {
    const token = await getAuthSession()
    if (!token?.id || token.role !== "ADMIN") return { error: "Unauthorized" }

    await prisma.user.update({
      where: { id: token.id as string },
      data: { availabilityStatus: status }
    })

    revalidatePath("/admin/dashboard")
    return { success: true }
  } catch (error) {
    console.error("Failed to update status:", error)
    return { error: "Failed to update status" }
  }
}
