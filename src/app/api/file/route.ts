import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3"
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
    let key = ""
    try {
      const parsedUrl = new URL(urlParam)
      // pathname has a leading slash, we need to remove it for S3 key
      key = decodeURIComponent(parsedUrl.pathname.substring(1))
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
    const s3Response = await s3Client.send(command)

    if (!s3Response.Body) {
      return NextResponse.json({ error: "Empty response from S3" }, { status: 500 })
    }

    // Stream the S3 object body directly as the response
    const responseHeaders: Record<string, string> = {
      "Cache-Control": "private, max-age=3600",
    }

    if (s3Response.ContentType) {
      responseHeaders["Content-Type"] = s3Response.ContentType
    }
    if (s3Response.ContentLength) {
      responseHeaders["Content-Length"] = String(s3Response.ContentLength)
    }
    if (download) {
      let filename = key.split("/").pop() || "download"
      try { filename = decodeURIComponent(filename) } catch(e) {}
      responseHeaders["Content-Disposition"] = `attachment; filename="${filename}"`
    }

    // Convert the readable stream from AWS SDK to a web ReadableStream
    const bodyStream = s3Response.Body.transformToWebStream()

    return new NextResponse(bodyStream as any, {
      status: 200,
      headers: responseHeaders,
    })
  } catch (error) {
    console.error("S3 file proxy error:", error)
    return NextResponse.json({ error: "Failed to access file" }, { status: 500 })
  }
}
