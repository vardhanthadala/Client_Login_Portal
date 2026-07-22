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

  return getToken({ req, secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || "c4d8Y0Pq9rK2nX7fWm3JvL8aZs1QeH5tBg9NpRx6UcIyEoDn", secureCookie: process.env.NODE_ENV === "production" || process.env.VERCEL === "1", cookieName: (process.env.NODE_ENV === "production" || process.env.VERCEL === "1") ? "__Secure-authjs.session-token" : "authjs.session-token" })
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

    // Send Welcome Email via custom SMTP
    await sendWelcomeEmail(email, password, "Our Platform", clientName, token.tenantId as string)

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

    let finalImageUrl = imageUrl || undefined

    // If an image URL is provided and platform S3 is configured,
    // copy the image server-side to the platform S3 bucket
    if (imageUrl && imageUrl.startsWith("http")) {
      try {
        const accessKeyId = process.env.AWS_ACCESS_KEY_ID
        const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY
        const region = process.env.AWS_REGION
        const bucketName = process.env.AWS_S3_BUCKET_NAME

        if (accessKeyId && secretAccessKey && region && bucketName) {
          // Fetch the image from the admin's S3 (using tenant credentials via our own proxy)
          const user = await prisma.user.findUnique({
            where: { id: token.id as string },
            include: { tenant: true }
          })

          if (user?.tenant?.awsAccessKeyId && user?.tenant?.awsSecretAccessKey && user?.tenant?.awsRegion && user?.tenant?.awsS3BucketName) {
            const { S3Client, GetObjectCommand, PutObjectCommand } = await import("@aws-sdk/client-s3")
            const { decrypt } = await import("@/lib/encryption")

            // Parse the S3 key from the URL
            const parsedUrl = new URL(imageUrl)
            const s3Key = decodeURIComponent(parsedUrl.pathname.substring(1))

            const tenantRegion = user.tenant.awsRegion.split(" ").pop()?.trim() || user.tenant.awsRegion
            const decryptedSecret = decrypt(user.tenant.awsSecretAccessKey)

            // Fetch from admin's S3
            const tenantS3 = new S3Client({
              region: tenantRegion,
              credentials: {
                accessKeyId: user.tenant.awsAccessKeyId,
                secretAccessKey: decryptedSecret,
              },
            })

            const getCmd = new GetObjectCommand({
              Bucket: user.tenant.awsS3BucketName!,
              Key: s3Key,
            })

            const s3Response = await tenantS3.send(getCmd)
            if (s3Response.Body) {
              const bodyBytes = await s3Response.Body.transformToByteArray()

              // Upload to platform S3
              const pRegion = region.split(" ").pop()?.trim() || region
              const platformS3 = new S3Client({
                region: pRegion,
                credentials: { accessKeyId, secretAccessKey },
              })

              const filename = s3Key.split("/").pop() || "profile.jpg"
              const pKey = `admin-profiles/${token.id}/${Date.now()}-${filename}`

              const putCmd = new PutObjectCommand({
                Bucket: bucketName,
                Key: pKey,
                ContentType: s3Response.ContentType || "image/jpeg",
                Body: bodyBytes,
              })

              await platformS3.send(putCmd)
              finalImageUrl = `https://${bucketName}.s3.${pRegion}.amazonaws.com/${pKey}`
              console.log("[ProfileSync] Copied admin profile to platform S3:", finalImageUrl)
            }
          }
        }
      } catch (copyErr) {
        console.warn("Failed to copy image to platform S3:", copyErr)
        // Continue with the original imageUrl as fallback
      }
    }

    console.log("[ProfileSync] Saving image to DB:", finalImageUrl || "(no image)")
    await prisma.user.update({
      where: { id: token.id as string },
      data: {
        name,
        image: finalImageUrl || undefined
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
