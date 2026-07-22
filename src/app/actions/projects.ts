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

export async function createProjectAction(clientProfileId: string,
    secureCookie: process.env.NODE_ENV === "production" || process.env.VERCEL === "1",
    cookieName: (process.env.NODE_ENV === "production" || process.env.VERCEL === "1") ? "__Secure-authjs.session-token" : "authjs.session-token", name: string, stages: string[]) {
  try {
    const token = await getAuthSession()
    if (!token?.id || token.role !== "ADMIN" || !token.tenantId) return { error: "Unauthorized" }

    // Verify the client profile belongs to this admin's tenant
    const profile = await prisma.clientProfile.findUnique({ where: { id: clientProfileId } })
    if (!profile || profile.tenantId !== token.tenantId) return { error: "Unauthorized or not found" }

    const project = await prisma.project.create({
      data: {
        clientProfileId,
        name,
        stages
      }
    })

    revalidatePath(`/admin/client/${clientProfileId}`)
    revalidatePath("/client/dashboard")

    return { success: true, data: project }
  } catch (error: any) {
    console.error("Failed to create project:", error)
    return { error: "Failed to create project" }
  }
}

export async function updateProjectStageAction(projectId: string, currentStageIdx: number, clientProfileId: string) {
  try {
    const token = await getAuthSession()
    if (!token?.id || token.role !== "ADMIN" || !token.tenantId) return { error: "Unauthorized" }

    // Verify the project belongs to this admin's tenant
    const existingProject = await prisma.project.findUnique({
      where: { id: projectId },
      include: { clientProfile: true }
    })
    if (!existingProject || existingProject.clientProfile.tenantId !== token.tenantId) return { error: "Unauthorized or not found" }

    const project = await prisma.project.update({
      where: { id: projectId },
      data: { currentStageIdx }
    })

    revalidatePath(`/admin/client/${clientProfileId}`)
    revalidatePath("/client/dashboard")

    return { success: true, data: project }
  } catch (error: any) {
    console.error("Failed to update project:", error)
    return { error: "Failed to update project" }
  }
}

export async function deleteProjectAction(projectId: string, clientProfileId: string) {
  try {
    const token = await getAuthSession()
    if (!token?.id || token.role !== "ADMIN" || !token.tenantId) return { error: "Unauthorized" }

    // Verify the project belongs to this admin's tenant
    const existingProject = await prisma.project.findUnique({
      where: { id: projectId },
      include: { clientProfile: true }
    })
    if (!existingProject || existingProject.clientProfile.tenantId !== token.tenantId) return { error: "Unauthorized or not found" }

    await prisma.project.delete({
      where: { id: projectId }
    })

    revalidatePath(`/admin/client/${clientProfileId}`)
    revalidatePath("/client/dashboard")

    return { success: true }
  } catch (error: any) {
    console.error("Failed to delete project:", error)
    return { error: "Failed to delete project" }
  }
}

import { GoogleGenAI } from "@google/genai"

export async function generateProjectPhasesAction(serviceName: string) {
  try {
    const token = await getAuthSession()
    if (!token?.id || token.role !== "ADMIN") return { error: "Unauthorized" }

    const prompt = `Generate 4 to 6 standard project delivery phases/stages for a service called: "${serviceName}".
The last phase must always be exactly "Project Finished" or "Final Delivery" to indicate completion.
Return ONLY a JSON object with a single key "phases" containing an array of strings representing the phases in chronological order. Example: {"phases": ["Planning", "Design", "Development", "Project Finished"]}`

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
      console.warn("Gemini phases failed, falling back to Groq:", geminiError)
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
    const parsed = JSON.parse(cleanedText || "{}")
    
    if (!parsed.phases || !Array.isArray(parsed.phases)) {
      return { error: "AI returned invalid format." }
    }
    
    return { success: true, data: parsed.phases }
  } catch (error: any) {
    console.error("Failed to generate AI phases:", error)
    return { error: error.message || "Failed to generate AI phases" }
  }
}
