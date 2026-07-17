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
      <Card className="bg-[#FFF5F5] dark:bg-[#FFF5F5]/10 border-none shadow-sm bg-white dark:bg-[#111111] border border-[#E9EDF4] dark:border-[#2A2E35] rounded-[24px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-[#0F172A] dark:text-white text-lg flex items-center gap-2">
            <Cloud className="w-5 h-5 text-[#22C55E]" />
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
    <Card className="bg-white dark:bg-[#171A21] border border-[#E5E7EB] dark:border-white/5 rounded-[16px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] min-w-0 h-full flex flex-col justify-between overflow-hidden relative group">
      <div className="absolute right-0 top-0 w-32 h-32 bg-[#22C55E]/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none group-hover:bg-[#22C55E]/10 transition-colors"></div>
      
      <CardContent className="p-6 flex-1 flex flex-col justify-between z-10 relative">
        <div className="flex justify-between items-start mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full border border-[#E2E8F0] dark:border-white/10 flex items-center justify-center shrink-0 bg-[#22C55E]/5">
              <Cloud className="w-5 h-5 text-[#22C55E]" />
            </div>
            <div>
              <h3 className="text-[16px] font-semibold text-[#0F172A] dark:text-white leading-tight">AWS S3 Storage</h3>
              <p className="text-[13px] font-medium text-[#64748B] dark:text-[#94A3B8] mt-0.5 flex items-center gap-1.5">
                Bucket: <span className="font-mono text-xs bg-[#F8FAFC] dark:bg-white/5 border border-[#E2E8F0] dark:border-white/10 px-1.5 py-0.5 rounded-md text-[#0F172A] dark:text-white">{data.bucketName}</span>
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-medium text-[#0F172A] dark:text-white tabular-nums">{formatBytes(data.totalBytes)}</div>
            <div className="text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider mt-1">Space Used</div>
          </div>
        </div>

        <div className="space-y-3 mt-auto">
          <div className="flex justify-between items-center text-[13px] font-medium mb-1">
            <span className="text-[#0F172A] dark:text-white flex items-center gap-1.5">
              <FileIcon className="w-4 h-4 text-[#22C55E]" /> 
              {data.fileCount} Total Files
            </span>
            <span className="text-[#64748B] dark:text-[#94A3B8]">100 GB Visual Quota</span>
          </div>
          <div className="h-2.5 w-full bg-[#F1F5F9] dark:bg-white/5 rounded-full overflow-hidden border border-[#E2E8F0] dark:border-white/10">
            <div className="h-full bg-gradient-to-r from-[#22C55E] to-[#22C55E] rounded-full transition-all duration-1000 ease-out" style={{ width: `${usagePercentage}%` }}></div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
