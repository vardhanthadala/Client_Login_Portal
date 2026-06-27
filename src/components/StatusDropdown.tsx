"use client"

import { useState } from "react"
import { updateClientStatusAction } from "@/app/actions/admin"
import { Loader2 } from "lucide-react"

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

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value
    setStatus(newStatus)
    setIsUpdating(true)
    
    const res = await updateClientStatusAction(clientProfileId, newStatus)
    if (!res.success) {
      alert(res.error)
      setStatus(currentStatus) // Revert on failure
    }
    
    setIsUpdating(false)
  }

  return (
    <div className="relative flex items-center">
      <select
        value={status}
        onChange={handleStatusChange}
        disabled={isUpdating}
        className="appearance-none bg-primary/10 text-primary px-3 py-1 pr-8 rounded-full text-xs uppercase tracking-[0.12em] font-bold border border-transparent hover:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 disabled:opacity-50 transition-all cursor-pointer"
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt} value={opt} className="bg-background text-foreground">
            {opt}
          </option>
        ))}
      </select>
      
      {/* Custom down arrow */}
      <div className="pointer-events-none absolute right-2 flex items-center">
        {isUpdating ? (
          <Loader2 className="w-3 h-3 animate-spin text-primary" />
        ) : (
          <svg className="w-3 h-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </div>
    </div>
  )
}
