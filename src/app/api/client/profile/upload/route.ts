import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import { prisma } from "@/lib/prisma"
import { decrypt } from "@/lib/encryption"
import { cookies, headers } from "next/headers"
import { revalidatePath } from "next/cache"

export async function POST(req: NextRequest) {
  try {
    const reqCookies = await cookies()
    const reqHeaders = await headers()
    
    const mockReq = {
      cookies: Object.fromEntries(reqCookies.getAll().map(c => [c.name, c.value])),
      headers: Object.fromEntries(reqHeaders.entries())
    } as any

    const token = await getToken({ req: mockReq, secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || "c4d8Y0Pq9rK2nX7fWm3JvL8aZs1QeH5tBg9NpRx6UcIyEoDn" })
    
    if (!token?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File
    const clientName = formData.get("clientName") as string
    
    if (!file && !clientName) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: token.id as string },
      include: { tenant: true }
    })

    if (!user || !user.tenant) {
      return NextResponse.json({ error: "Tenant not found for user." }, { status: 404 })
    }

    const tenant = user.tenant
    
    const dataToUpdate: any = {}
    if (clientName) dataToUpdate.clientName = clientName

    let fileUrl = undefined
    if (file) {
      const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"]
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        return NextResponse.json({ error: "Invalid file type. Only images are allowed." }, { status: 400 })
      }

      const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: "File exceeds the 50MB limit." }, { status: 400 })
      }

      if (!tenant.awsAccessKeyId || !tenant.awsSecretAccessKey || !tenant.awsRegion || !tenant.awsS3BucketName) {
        return NextResponse.json({ error: "Agency storage is not configured." }, { status: 400 })
      }

      const decryptedSecret = decrypt(tenant.awsSecretAccessKey)
      const cleanRegion = tenant.awsRegion.split(" ").pop()?.trim() || tenant.awsRegion

      const s3Client = new S3Client({
        region: cleanRegion,
        credentials: {
          accessKeyId: tenant.awsAccessKeyId,
          secretAccessKey: decryptedSecret,
        },
      })

      const key = `uploads/${token.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      await s3Client.send(new PutObjectCommand({
        Bucket: tenant.awsS3BucketName,
        Key: key,
        ContentType: file.type,
        Body: buffer,
      }))

      fileUrl = `https://${tenant.awsS3BucketName}.s3.${tenant.awsRegion}.amazonaws.com/${key}`
      dataToUpdate.profileImageUrl = fileUrl
    }

    // Ensure database persistence immediately
    await prisma.clientProfile.update({
      where: { userId: token.id as string },
      data: dataToUpdate
    })

    revalidatePath('/client/dashboard', 'page')

    return NextResponse.json({ success: true, fileUrl })
  } catch (error) {
    console.error("Direct S3 Upload error:", error)
    return NextResponse.json({ error: "Failed to upload and save profile image" }, { status: 500 })
  }
}
