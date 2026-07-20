"use client"

import { useState } from "react"
import { Copy, Check } from "lucide-react"

export default function CompanyIdWidget({ tenantId }: { tenantId: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(tenantId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="group inline-flex items-center gap-2 text-[14px] text-gray-900 dark:text-white font-medium hover:opacity-70 transition-opacity"
    >
      <span className="font-mono text-[13px]">{tenantId}</span>
      {copied ? (
        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
      ) : (
        <Copy className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 shrink-0 transition-colors" />
      )}
    </button>
  )
}
