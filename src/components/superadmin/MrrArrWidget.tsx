"use client"

import { useEffect, useState } from "react"
import { Loader2, TrendingUp, DollarSign } from "lucide-react"
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
    <div className="bg-[#5A52FF] rounded-[24px] border border-[#5A52FF] p-6 shadow-[0_8px_30px_rgba(90,82,255,0.2)] text-white relative overflow-hidden min-h-[120px] md:col-span-2 lg:col-span-1 hover:-translate-y-1 transition-transform duration-300">
      <div className="absolute right-0 top-0 w-32 h-32 bg-white/20 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
      <div className="absolute left-0 bottom-0 w-24 h-24 bg-black/20 rounded-full blur-2xl -ml-8 -mb-8 pointer-events-none"></div>
      
      <div className="relative z-10 flex flex-col justify-between h-full">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-bold tracking-[0.15em] text-white/80 uppercase flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" /> Monthly Recurring Revenue
          </p>
          <div className="bg-white/20 p-1.5 rounded-xl backdrop-blur-sm">
            <DollarSign className="w-4 h-4 text-white" />
          </div>
        </div>
        
        <div className="mt-4 flex items-baseline gap-2">
          <h3 className="text-3xl font-sans font-bold tracking-tight tabular-nums">
            ₹{mrr.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          <span className="text-white/70 text-[13px] font-bold">/ mo</span>
        </div>
        
        <div className="mt-4 pt-4 border-t border-white/20 flex justify-between items-center">
          <span className="text-[11px] font-bold tracking-wider uppercase text-white/80">Annual Run Rate (ARR)</span>
          <span className="text-[14px] font-bold tabular-nums">₹{arr.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
      </div>
    </div>
  )
}

