import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

import { cookies, headers } from "next/headers"

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
      return NextResponse.json({ error: "Unauthorized - Token missing or invalid" }, { status: 401 })
    }

    const { filename, contentType, fileSize } = await req.json()

    if (!filename || !contentType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // 1. Strict File Type Whitelisting
    const ALLOWED_MIME_TYPES = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
      "video/mp4",
      "text/csv",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" // .docx
    ]

    if (!ALLOWED_MIME_TYPES.includes(contentType)) {
      return NextResponse.json({ error: "Invalid file type. Only images, PDFs, MP4s, CSVs, and DOCX files are allowed for security." }, { status: 400 })
    }

    // 2. File Size Limits (Max 50MB)
    const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
    if (fileSize && fileSize > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File size exceeds the 50MB limit." }, { status: 400 })
    }

    const key = `uploads/${token.id}/${Date.now()}-${filename}`
    
    // 3. Force attachment headers so browsers don't execute raw HTML/SVG
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: key,
      ContentType: contentType,
      ContentDisposition: 'attachment'
    })

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 })

    return NextResponse.json({ 
      uploadUrl: signedUrl, 
      fileUrl: `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}` 
    })
  } catch (error) {
    console.error("Presigned URL generation error:", error)
    return NextResponse.json({ error: "Failed to generate upload URL" }, { status: 500 })
  }
}
