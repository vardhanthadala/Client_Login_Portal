"use client"

import { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
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
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 })
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    const handleScrollOrResize = () => setIsOpen(false)
    if (isOpen) {
      window.addEventListener("scroll", handleScrollOrResize, true)
      window.addEventListener("resize", handleScrollOrResize)
    }
    return () => {
      window.removeEventListener("scroll", handleScrollOrResize, true)
      window.removeEventListener("resize", handleScrollOrResize)
    }
  }, [isOpen])

  const toggleDropdown = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      const dropdownWidth = 190
      setCoords({
        top: rect.bottom + 6, // 6px spacing
        left: rect.left, // Left aligned
        width: dropdownWidth
      })
    }
    setIsOpen(!isOpen)
  }

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
    <>
      <button
        ref={buttonRef}
        onClick={() => !isUpdating && toggleDropdown()}
        disabled={isUpdating}
        className={`flex items-center gap-2 px-4 py-1.5 rounded-sm text-[11px] uppercase tracking-[0.12em] font-normal border-2 transition-all disabled:opacity-50 ${getBadgeColors(status)}`}
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
      
      {isOpen && typeof document !== "undefined" && createPortal(
        <div 
          ref={dropdownRef}
          style={{ 
            position: 'fixed', 
            top: `${coords.top}px`, 
            left: `${coords.left}px`, 
            width: `${coords.width}px` 
          }}
          className="bg-white dark:bg-[#171A21] border border-[#E2E8F0] dark:border-white/10 rounded-sm shadow-[0_4px_20px_rgba(0,0,0,0.08)] z-[9999] p-0 overflow-hidden"
        >
          <div className="flex flex-col gap-0">
            {STATUS_OPTIONS.map((opt) => {
              const isSelected = status === opt;
              return (
                <button
                  key={opt}
                  onClick={() => handleStatusSelect(opt)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-none text-[13px] font-normal transition-all duration-200 ${
                    isSelected 
                      ? "bg-[#22C55E] text-white shadow-sm" 
                      : "text-[#1E293B] dark:text-white hover:bg-[#F8FAFC] dark:hover:bg-[#1C2029] hover:text-[#22C55E]"
                  }`}
                >
                  {opt}
                  {isSelected && <Check className="w-4 h-4" strokeWidth={2} />}
                </button>
              )
            })}
          </div>
        </div>,
        document.body
      )}
    </>
  )
}

