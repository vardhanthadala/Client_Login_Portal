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

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => !isUpdating && setIsOpen(!isOpen)}
        disabled={isUpdating}
        className="flex items-center gap-2 bg-[#F3F5FF] text-[#5A52FF] px-4 py-1.5 rounded-full text-xs uppercase tracking-[0.12em] font-bold border-2 border-[#5A52FF]/20 hover:border-[#5A52FF]/50 transition-all disabled:opacity-50"
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
        <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-[#E5E7EB] rounded-[1.25rem] shadow-[0_8px_30px_rgb(0,0,0,0.08)] z-50 p-1.5">
          <div className="flex flex-col gap-0.5">
            {STATUS_OPTIONS.map((opt) => {
              const isSelected = status === opt;
              return (
                <button
                  key={opt}
                  onClick={() => handleStatusSelect(opt)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs uppercase tracking-[0.1em] font-bold transition-all duration-200 ${
                    isSelected 
                      ? "bg-[#5A52FF] text-white shadow-sm" 
                      : "text-[#475569] hover:bg-[#F3F5FF] hover:text-[#5A52FF]"
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

