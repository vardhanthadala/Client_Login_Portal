"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { analyzeClientQuestionnaire } from "@/lib/gemini"
import { sendOnboardingCompleteEmail } from "@/lib/mail"
import { GoogleGenAI } from "@google/genai"
import { revalidatePath } from "next/cache"

import { getToken } from "next-auth/jwt"
import { cookies, headers } from "next/headers"

export async function submitWizardAction(data: any) {
  console.log("RECEIVED WIZARD DATA:", JSON.stringify(data, null, 2));
  try {
    const reqCookies = await cookies()
    const reqHeaders = await headers()
    
    // Create a mock NextRequest for getToken
    const req = {
      cookies: Object.fromEntries(reqCookies.getAll().map(c => [c.name, c.value])),
      headers: Object.fromEntries(reqHeaders.entries())
    } as any

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || "c4d8Y0Pq9rK2nX7fWm3JvL8aZs1QeH5tBg9NpRx6UcIyEoDn" })
    
    if (!token?.id) {
      return { error: `Unauthorized. Session token missing.` }
    }

    const userId = token.id as string

    // 1. Find ClientProfile
    const clientProfile = await prisma.clientProfile.findUnique({
      where: { userId },
    })

    if (!clientProfile) {
      return { error: "Client profile not found" }
    }

    // 2. Update Client Profile Details
    await prisma.clientProfile.update({
      where: { id: clientProfile.id },
      data: {
        companyName: data.businessDetails?.businessName || data.businessDetails?.companyName || clientProfile.companyName,
        website: data.businessDetails?.website,
        industry: data.businessDetails?.industry,
        description: data.businessDetails?.description,
        audience: data.questionnaire?.audience || data.businessDetails?.questionnaire?.audience,
        goals: data.questionnaire?.goals || data.businessDetails?.questionnaire?.goals,
        locations: data.businessDetails?.locations,
        hours: data.businessDetails?.workingHours,
        phone: data.businessDetails?.phone,
      },
    })

    // 3. Save Brand Assets
    if (data.businessDetails?.brandAssets?.length) {
      for (const asset of data.businessDetails.brandAssets) {
        await prisma.brandAsset.create({
          data: {
            clientProfileId: clientProfile.id,
            type: "UPLOAD",
            fileUrl: asset.url,
          },
        })
      }
    }

    // 4. Run Gemini AI summarization if questionnaire exists
    let aiSummary = {}
    const questionnairePayload = data.questionnaire || data.businessDetails?.questionnaire
    if (questionnairePayload) {
      const prompt = `Analyze this marketing onboarding data for a client:
      Industry: ${data.businessDetails?.industry}
      Description: ${data.businessDetails?.description}
      Questionnaire Answers: ${JSON.stringify(questionnairePayload)}
      
      Extract and summarize the following in JSON format:
      - brandVoice: Array of 3-5 adjectives describing their desired tone.
      - targetAudience: A 2-sentence description of their ideal customer.
      - coreServices: Array of strings listing their primary offerings.
      - marketingAngle: A 1-sentence recommendation on how to position them.
      `
      
      try {
        let aiResponseText = ""
        try {
          const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "dummy_key" })
          const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: prompt,
            config: {
              responseMimeType: "application/json",
            }
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
        
        // Strip markdown backticks if they exist
        const cleanedText = aiResponseText.replace(/```json/g, "").replace(/```/g, "").trim();
        aiSummary = JSON.parse(cleanedText || "{}")
        
        await prisma.aIAnalysis.upsert({
          where: { clientProfileId: clientProfile.id },
          update: { summary: aiSummary },
          create: { clientProfileId: clientProfile.id, summary: aiSummary }
        })
      } catch (aiError) {
        console.error("All AI analysis attempts failed:", aiError)
        // We continue even if AI fails
      }
    }

    revalidatePath("/client/dashboard")
    revalidatePath("/admin/dashboard")

    // Send email notification to admin
    await sendOnboardingCompleteEmail(
      clientProfile.clientName || "Client",
      clientProfile.companyName || "Company",
      aiSummary
    )

    return { success: true, aiSummary }
  } catch (error: any) {
    console.error("Wizard submit error:", error)
    return { error: "Failed to submit onboarding data." }
  }
}

export async function addBrandAssetAction(fileUrl: string, fileName: string) {
  try {
    const reqCookies = await cookies()
    const reqHeaders = await headers()
    
    const req = {
      cookies: Object.fromEntries(reqCookies.getAll().map(c => [c.name, c.value])),
      headers: Object.fromEntries(reqHeaders.entries())
    } as any

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || "c4d8Y0Pq9rK2nX7fWm3JvL8aZs1QeH5tBg9NpRx6UcIyEoDn" })
    
    if (!token?.id) return { error: "Unauthorized" }

    const clientProfile = await prisma.clientProfile.findUnique({
      where: { userId: token.id as string }
    })

    if (!clientProfile) return { error: "Profile not found" }

    await prisma.brandAsset.create({
      data: {
        clientProfileId: clientProfile.id,
        type: fileName,
        fileUrl: fileUrl,
      }
    })

    revalidatePath("/client/dashboard")
    revalidatePath("/admin/dashboard")
    revalidatePath(`/admin/client/${token.id}`)
    
    return { success: true }
  } catch (error: any) {
    console.error("Failed to add asset:", error)
    return { error: "Failed to add asset" }
  }
}
