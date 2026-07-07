"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Cloud, HardDrive, Loader2, FileIcon, Settings } from "lucide-react"
import { getTenantStorageUsageAction } from "@/app/actions/storage"

import Link from "next/link"

type StorageData = {
  totalBytes: number
  fileCount: number
  isConfigured: boolean
  bucketName?: string
}

export default function StorageUsageWidget() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<StorageData | null>(null)

  useEffect(() => {
    async function fetchStorage() {
      try {
        const result = await getTenantStorageUsageAction()
        if (result.error) {
          setError(result.error)
        } else if (result.data) {
          setData(result.data)
        }
      } catch (err) {
        setError("Failed to fetch storage usage")
      } finally {
        setLoading(false)
      }
    }
    fetchStorage()
  }, [])

  const formatBytes = (bytes: number, decimals = 2) => {
    if (!+bytes) return '0 Bytes'
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
  }

  // Set an arbitrary quota for visual purposes if no actual quota is enforced
  // Assuming 100GB visual limit, but it won't prevent uploads
  const VISUAL_QUOTA_BYTES = 100 * 1024 * 1024 * 1024 // 100 GB
  const usagePercentage = data ? Math.min((data.totalBytes / VISUAL_QUOTA_BYTES) * 100, 100) : 0

  if (loading) {
    return (
      <Card className="border-indigo-100 bg-white shadow-sm mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-gray-900 text-lg flex items-center gap-2">
            <Cloud className="w-5 h-5 text-indigo-500" />
            AWS Storage Usage
          </CardTitle>
        </CardHeader>
        <CardContent className="h-24 flex items-center justify-center text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading storage data...
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50 shadow-sm mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-red-900 text-lg flex items-center gap-2">
            <Cloud className="w-5 h-5 text-red-500" />
            AWS Storage Usage Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-600">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (!data?.isConfigured) {
    return (
      <Card className="border-amber-200 bg-amber-50/50 shadow-sm mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-amber-900 text-lg flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-amber-500" />
            AWS Storage Not Configured
          </CardTitle>
          <CardDescription className="text-amber-700">
            Set up your AWS S3 bucket to start storing client files and brand assets securely.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/admin/settings" className="text-sm font-medium text-amber-600 hover:text-amber-800 flex items-center gap-1 mt-2">
            <Settings className="w-4 h-4" /> Go to Settings
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-indigo-100 bg-white shadow-sm mb-6 overflow-hidden relative">
      <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-gray-900 text-lg flex items-center gap-2">
              <Cloud className="w-5 h-5 text-indigo-500" />
              AWS S3 Storage
            </CardTitle>
            <CardDescription className="text-gray-500 mt-1 flex items-center gap-1">
              Bucket: <span className="font-mono text-xs bg-gray-100 px-1 py-0.5 rounded">{data.bucketName}</span>
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{formatBytes(data.totalBytes)}</div>
            <div className="text-sm text-gray-500 font-medium">Space Used</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mt-4 space-y-2 relative z-10">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-500 flex items-center gap-1"><FileIcon className="w-4 h-4" /> {data.fileCount} Total Files</span>
            <span className="text-gray-400">100 GB Visual Quota</span>
          </div>
          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${usagePercentage}%` }}></div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
