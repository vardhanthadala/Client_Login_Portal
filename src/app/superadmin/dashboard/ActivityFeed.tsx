"use client"

import { useEffect, useState } from "react"
import { getSuperAdminLogs } from "@/app/actions/superadmin"
import { formatDistanceToNow } from "date-fns"
import { Loader2, Plus, XCircle, Info } from "lucide-react"

export default function ActivityFeed() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLogs() {
      const res = await getSuperAdminLogs()
      if (res?.success) {
        setLogs(res.data)
      }
      setLoading(false)
    }
    fetchLogs()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48 w-full bg-white rounded-2xl border border-gray-100 shadow-sm">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
      </div>
    )
  }

  if (logs.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Activity Feed</h3>
        <p className="text-sm text-gray-500 text-center py-8">No recent activity.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm h-[400px] flex flex-col">
      <h3 className="text-lg font-bold text-gray-900 mb-6 shrink-0">Platform Activity</h3>
      <div className="flex-1 overflow-y-auto pr-2 space-y-6">
        {logs.map((log) => {
          let Icon = Info
          let iconColor = "text-blue-500"
          let bgColor = "bg-blue-50"

          if (log.action === "AGENCY_CREATED") {
            Icon = Plus
            iconColor = "text-green-600"
            bgColor = "bg-green-100"
          } else if (log.action === "SUBSCRIPTION_CANCELLED") {
            Icon = XCircle
            iconColor = "text-red-600"
            bgColor = "bg-red-100"
          }

          return (
            <div key={log.id} className="flex gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${bgColor}`}>
                <Icon className={`w-5 h-5 ${iconColor}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {log.message}
                </p>
                <div className="flex items-center mt-1 text-xs text-gray-500 gap-2">
                  <span>{formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}</span>
                  {log.tenant && (
                    <>
                      <span>•</span>
                      <span className="font-semibold">{log.tenant.name}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
