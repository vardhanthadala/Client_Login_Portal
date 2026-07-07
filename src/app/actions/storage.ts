"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { decrypt } from "@/lib/encryption"
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3"

export async function getTenantStorageUsageAction() {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "ADMIN" || !session.user.tenantId) {
      return { error: "Unauthorized" }
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: session.user.tenantId },
      select: { awsAccessKeyId: true, awsSecretAccessKey: true, awsRegion: true, awsS3BucketName: true }
    })

    if (!tenant || !tenant.awsAccessKeyId || !tenant.awsSecretAccessKey || !tenant.awsS3BucketName || !tenant.awsRegion) {
      // Not configured yet
      return { success: true, data: { totalBytes: 0, fileCount: 0, isConfigured: false } }
    }

    const decryptedSecret = decrypt(tenant.awsSecretAccessKey).trim()

    const s3Client = new S3Client({
      region: tenant.awsRegion.trim(),
      credentials: {
        accessKeyId: tenant.awsAccessKeyId.trim(),
        secretAccessKey: decryptedSecret,
      },
    })

    let totalBytes = 0
    let fileCount = 0
    let isTruncated = true
    let continuationToken: string | undefined = undefined

    // Loop through all objects if there are more than 1000
    while (isTruncated) {
      const command: any = new ListObjectsV2Command({
        Bucket: tenant.awsS3BucketName,
        ContinuationToken: continuationToken,
      })
      
      const response: any = await s3Client.send(command)
      
      if (response.Contents) {
        response.Contents.forEach((item: any) => {
          totalBytes += item.Size || 0
          fileCount += 1
        })
      }
      
      isTruncated = response.IsTruncated || false
      continuationToken = response.NextContinuationToken
    }

    return { success: true, data: { totalBytes, fileCount, isConfigured: true, bucketName: tenant.awsS3BucketName } }
  } catch (error: any) {
    console.error("Failed to get storage usage:", error)
    return { error: `AWS Error: ${error.message || "Failed to connect to S3"}` }
  }
}
