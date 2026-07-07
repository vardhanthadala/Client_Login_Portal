"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
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
      <Card className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex items-center justify-center min-h-[120px] md:col-span-2 lg:col-span-1">
        <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-red-50/50 rounded-2xl border border-red-100 p-6 shadow-sm min-h-[120px] md:col-span-2 lg:col-span-1">
        <p className="text-sm font-medium text-red-600">Failed to load MRR</p>
        <p className="text-xs text-red-500 mt-1">{error}</p>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-br from-indigo-500 via-purple-500 to-fuchsia-500 rounded-2xl border-0 p-6 shadow-lg text-white relative overflow-hidden min-h-[120px] md:col-span-2 lg:col-span-1">
      <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
      <div className="absolute left-0 bottom-0 w-24 h-24 bg-black/10 rounded-full blur-xl -ml-8 -mb-8 pointer-events-none"></div>
      
      <div className="relative z-10 flex flex-col justify-between h-full">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-indigo-100 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4" /> Monthly Recurring Revenue
          </p>
          <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm">
            <DollarSign className="w-4 h-4 text-white" />
          </div>
        </div>
        
        <div className="mt-4 flex items-baseline gap-2">
          <h3 className="text-3xl font-bold tracking-tight">
            ₹{mrr.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          <span className="text-indigo-200 text-sm font-medium">/ mo</span>
        </div>
        
        <div className="mt-4 pt-4 border-t border-white/20 flex justify-between items-center text-sm">
          <span className="text-indigo-100">Annual Run Rate (ARR)</span>
          <span className="font-bold">₹{arr.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
      </div>
    </Card>
  )
}
