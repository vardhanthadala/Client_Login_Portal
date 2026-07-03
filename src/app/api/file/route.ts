import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import { prisma } from "@/lib/prisma"
import { decrypt } from "@/lib/encryption"
import { cookies, headers } from "next/headers"

export async function GET(req: NextRequest) {
  try {
    const urlParam = req.nextUrl.searchParams.get("url")
    const download = req.nextUrl.searchParams.get("download") === "true"

    if (!urlParam) {
      return NextResponse.json({ error: "Missing url parameter" }, { status: 400 })
    }

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

    // Fetch user and tenant
    const user = await prisma.user.findUnique({
      where: { id: token.id as string },
      include: { tenant: true }
    })

    if (!user || !user.tenant) {
      return NextResponse.json({ error: "Tenant not found for user." }, { status: 404 })
    }

    const tenant = user.tenant

    if (!tenant.awsAccessKeyId || !tenant.awsSecretAccessKey || !tenant.awsRegion || !tenant.awsS3BucketName) {
      return NextResponse.json({ error: "Storage is not configured." }, { status: 400 })
    }

    // Parse the S3 URL to extract the key
    // URL format: https://bucket-name.s3.region.amazonaws.com/path/to/key.jpg
    let key = ""
    try {
      const parsedUrl = new URL(urlParam)
      // pathname has a leading slash, we need to remove it for S3 key
      key = parsedUrl.pathname.substring(1)
    } catch (e) {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 })
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

    const commandOptions: any = {
      Bucket: tenant.awsS3BucketName,
      Key: key,
    }

    if (download) {
      let filename = key.split("/").pop() || "download"
      try {
        filename = decodeURIComponent(filename)
      } catch(e) {}
      commandOptions.ResponseContentDisposition = `attachment; filename="${filename}"`
    }

    const command = new GetObjectCommand(commandOptions)

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 })

    return NextResponse.redirect(signedUrl)
  } catch (error) {
    console.error("Presigned URL generation error:", error)
    return NextResponse.json({ error: "Failed to access file" }, { status: 500 })
  }
}
