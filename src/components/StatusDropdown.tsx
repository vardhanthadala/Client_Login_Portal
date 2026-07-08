"use client"

import { useState, useRef, useEffect } from "react"
import { updateClientStatusAction } from "@/app/actions/admin"
import { toast } from "sonner"
import { Loader2, ChevronDown, Check } from "lucide-react"

const STATUS_OPTIONS = [
  "ONBOARDED",
  "IN PROGRESS",
  "IN REVIEW",
  "COMPLETED",
  "ON HOLD"
]

export default function StatusDropdown({ 
  clientProfileId, 
  currentStatus 
}: { 
  clientProfileId: string
  currentStatus: string
}) {
  const [status, setStatus] = useState(currentStatus || "ONBOARDED")
  const [isUpdating, setIsUpdating] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleStatusSelect = async (newStatus: string) => {
    if (newStatus === status) {
      setIsOpen(false)
      return
    }
    
    setStatus(newStatus)
    setIsOpen(false)
    setIsUpdating(true)
    
    const res = await updateClientStatusAction(clientProfileId, newStatus)
    if (!res.success) {
      toast.error(res.error)
      setStatus(currentStatus) // Revert on failure
    } else {
      toast.success("Status updated")
    }
    
    setIsUpdating(false)
  }

  const getBadgeColors = (st: string) => {
    switch (st) {
      case "COMPLETED": return "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20"
      case "ONBOARDED": 
      case "ON HOLD": return "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20"
      case "IN PROGRESS":
      case "IN REVIEW": return "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20"
      default: return "bg-slate-50 dark:bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-500/20"
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => !isUpdating && setIsOpen(!isOpen)}
        disabled={isUpdating}
        className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] uppercase tracking-[0.12em] font-bold border-2 transition-all disabled:opacity-50 ${getBadgeColors(status)}`}
      >
        {isUpdating ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <>
            {status}
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
          </>
        )}
      </button>
      
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-[#FFFFFF] dark:bg-[#171A21] border border-[#0F172A]/5 dark:border-white/5 rounded-[1.25rem] shadow-[0_20px_60px_rgba(0,0,0,0.05)] dark:shadow-[0_25px_70px_rgba(0,0,0,0.45)] z-50 p-1.5">
          <div className="flex flex-col gap-0.5">
            {STATUS_OPTIONS.map((opt) => {
              const isSelected = status === opt;
              return (
                <button
                  key={opt}
                  onClick={() => handleStatusSelect(opt)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[11px] uppercase tracking-[0.1em] font-bold transition-all duration-200 ${
                    isSelected 
                      ? "bg-[#22C55E] text-white shadow-sm" 
                      : "text-[#475569] dark:text-[#94A3B8] hover:bg-[#FAFBFD] dark:hover:bg-[#1C2029] hover:text-[#22C55E] dark:hover:text-[#22C55E]"
                  }`}
                >
                  {opt}
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

