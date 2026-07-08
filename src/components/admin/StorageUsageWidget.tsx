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
      <Card className="bg-white dark:bg-[#111111] border border-[#E9EDF4] dark:border-[#2A2E35] rounded-[24px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-[#0F172A] dark:text-white text-lg flex items-center gap-2">
            <Cloud className="w-5 h-5 text-[#5A52FF]" />
            AWS Storage Usage
          </CardTitle>
        </CardHeader>
        <CardContent className="h-24 flex items-center justify-center text-[#64748B] dark:text-[#888]">
          <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading storage data...
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-[24px] shadow-sm h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-red-900 dark:text-red-400 text-lg flex items-center gap-2">
            <Cloud className="w-5 h-5 text-red-500" />
            AWS Storage Usage Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (!data?.isConfigured) {
    return (
      <Card className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-[24px] shadow-sm h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-amber-900 dark:text-amber-400 text-lg flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-amber-500" />
            AWS Storage Not Configured
          </CardTitle>
          <CardDescription className="text-amber-700 dark:text-amber-600 mt-1">
            Set up your AWS S3 bucket to start storing client files securely.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/admin/settings" className="text-sm font-semibold text-amber-600 dark:text-amber-500 hover:text-amber-800 dark:hover:text-amber-400 flex items-center gap-1 mt-2">
            <Settings className="w-4 h-4" /> Go to Settings
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white dark:bg-[#111111] border border-[#E9EDF4] dark:border-[#2A2E35] rounded-[24px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden relative h-full flex flex-col group">
      <div className="absolute right-0 top-0 w-32 h-32 bg-[#5A52FF]/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none group-hover:bg-[#5A52FF]/10 transition-colors"></div>
      <CardHeader className="pb-2 border-b border-[#F1F5F9] dark:border-[#222]">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl font-sans font-bold text-[#0F172A] dark:text-white flex items-center gap-2 tracking-tight">
              <div className="w-8 h-8 rounded-lg bg-[#5A52FF]/10 flex items-center justify-center">
                <Cloud className="w-4 h-4 text-[#5A52FF]" />
              </div>
              AWS S3 Storage
            </CardTitle>
            <CardDescription className="text-[#64748B] dark:text-[#94A3B8] font-medium mt-2 flex items-center gap-2">
              Bucket: <span className="font-mono text-xs bg-[#F8FAFC] dark:bg-[#1A1A1A] border border-[#E2E8F0] dark:border-[#333] px-2 py-0.5 rounded-md text-[#0F172A] dark:text-white">{data.bucketName}</span>
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-3xl font-sans font-bold text-[#0F172A] dark:text-white tabular-nums tracking-tight">{formatBytes(data.totalBytes)}</div>
            <div className="text-[12px] text-[#64748B] dark:text-[#888] font-bold uppercase tracking-wider mt-0.5">Space Used</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-center py-6">
        <div className="space-y-3 relative z-10">
          <div className="flex justify-between text-[13px] font-medium mb-1">
            <span className="text-[#0F172A] dark:text-white flex items-center gap-1.5">
              <FileIcon className="w-4 h-4 text-[#5A52FF]" /> 
              {data.fileCount} Total Files
            </span>
            <span className="text-[#64748B] dark:text-[#888]">100 GB Visual Quota</span>
          </div>
          <div className="h-2.5 w-full bg-[#F1F5F9] dark:bg-[#222] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#5A52FF] to-[#9D97FF] rounded-full transition-all duration-1000 ease-out" style={{ width: `${usagePercentage}%` }}></div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
