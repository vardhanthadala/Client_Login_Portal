"use client"

import { useEffect, useState } from "react"
import { Loader2, TrendingUp, DollarSign, MoreVertical } from "lucide-react"
import { getSuperadminMrrAction } from "@/app/actions/superadmin"

export default function MrrArrWidget() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [mrr, setMrr] = useState(0)
  const [arr, setArr] = useState(0)

  useEffect(() => {
    async function fetchMrr() {
      try {
        const result = await getSuperadminMrrAction()
        if (result.error) {
          setError(result.error)
        } else if (result.data) {
          setMrr(result.data.mrr)
          setArr(result.data.arr)
        }
      } catch (err) {
        setError("Failed to fetch MRR data")
      } finally {
        setLoading(false)
      }
    }
    fetchMrr()
  }, [])

  if (loading) {
    return (
      <div className="bg-white dark:bg-[#111111] border border-[#E9EDF4] dark:border-[#2A2E35] rounded-[24px] p-6 shadow-sm flex items-center justify-center min-h-[120px] md:col-span-2 lg:col-span-1">
        <Loader2 className="w-6 h-6 animate-spin text-[#5A52FF]" />
      </div>
    )
  }

  if (error) {

    return (
      <div className="bg-red-50 dark:bg-red-500/10 rounded-[24px] border border-red-200 dark:border-red-500/20 p-6 shadow-sm min-h-[120px] md:col-span-2 lg:col-span-1 flex flex-col justify-center">
        <p className="text-[14px] font-bold text-red-700 dark:text-red-400">Failed to load MRR</p>
        <p className="text-[12px] font-medium text-red-500 dark:text-red-300 mt-1">{error}</p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-[#111111] rounded-[16px] border border-[#E9EDF4] dark:border-[#2A2E35] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between min-h-[140px] md:col-span-2 lg:col-span-1 relative group">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <DollarSign className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-[22px] font-medium text-[#0F172A] dark:text-white tabular-nums tracking-tight">
              ₹{mrr.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </h3>
            <p className="text-[13px] font-normal text-[#64748B] dark:text-[#94A3B8] mt-0.5">Monthly Recurring Revenue</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 mt-4">
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-normal text-[#64748B] dark:text-[#94A3B8]">Annual Run Rate</span>
          <span className="text-[12px] font-medium text-[#64748B] dark:text-[#94A3B8]">
            ₹{arr.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </span>
        </div>
        <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-blue-600 rounded-full w-[75%]"></div>
        </div>
      </div>
    </div>
  )
}
