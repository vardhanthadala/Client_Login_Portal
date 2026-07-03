import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { encrypt } from "@/lib/encryption"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "ADMIN" || !session.user.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: session.user.tenantId },
      select: {
        razorpayKeyId: true,
        razorpayKeySecret: true,
        awsAccessKeyId: true,
        awsRegion: true,
        awsS3BucketName: true,
        awsSecretAccessKey: true,
      }
    })

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 })
    }

    // NEVER return the actual secret to the frontend.
    return NextResponse.json({
      razorpayKeyId: tenant.razorpayKeyId || "",
      hasRazorpaySecret: !!tenant.razorpayKeySecret,
      awsAccessKeyId: tenant.awsAccessKeyId || "",
      awsRegion: tenant.awsRegion || "",
      awsS3BucketName: tenant.awsS3BucketName || "",
      hasAwsSecret: !!tenant.awsSecretAccessKey
    })
  } catch (error: any) {
    console.error("Error fetching settings:", error)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "ADMIN" || !session.user.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { 
      razorpayKeyId, 
      razorpayKeySecret,
      awsAccessKeyId,
      awsSecretAccessKey,
      awsRegion,
      awsS3BucketName
    } = await req.json()

    const updateData: any = {}
    if (razorpayKeyId !== undefined) {
      updateData.razorpayKeyId = razorpayKeyId
    }
    
    // Only update the secret if a new one was provided
    if (razorpayKeySecret) {
      // Encrypt the secret before saving to DB
      updateData.razorpayKeySecret = encrypt(razorpayKeySecret)
    }

    if (awsAccessKeyId !== undefined) updateData.awsAccessKeyId = awsAccessKeyId
    if (awsRegion !== undefined) updateData.awsRegion = awsRegion
    if (awsS3BucketName !== undefined) updateData.awsS3BucketName = awsS3BucketName

    if (awsSecretAccessKey) {
      updateData.awsSecretAccessKey = encrypt(awsSecretAccessKey)
    }

    await prisma.tenant.update({
      where: { id: session.user.tenantId },
      data: updateData
    })

    return NextResponse.json({ success: true, message: "Settings saved successfully" })
  } catch (error: any) {
    console.error("Error saving settings:", error)
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 })
  }
}
